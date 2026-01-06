-- Zezamii Modern Platform - PostgreSQL Schema
-- Pure PostgreSQL (no Supabase-specific features, no RLS)
-- System of Record: Users, Memberships, Passes, Slugs, Audit
-- References only: Orgs, Sites, Buildings, Devices (SoR in MSSQL)

-- =============================================================================
-- SCHEMA SETUP
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS core;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Slug validation: lowercase alphanumeric + hyphens, no leading/trailing hyphens
CREATE OR REPLACE FUNCTION core.is_valid_slug(slug TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- USERS & IDENTITY (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_email TEXT NOT NULL,
  name TEXT,
  picture_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON core.users(primary_email);
CREATE INDEX idx_users_deleted ON core.users(deleted_at) WHERE deleted_at IS NOT NULL;

COMMENT ON TABLE core.users IS 'User accounts - PostgreSQL is SoR';
COMMENT ON COLUMN core.users.primary_email IS 'Canonical email for display/contact';
COMMENT ON COLUMN core.users.deleted_at IS 'Soft delete timestamp';

-- Multiple identity providers per user (Kinde, Firebase, Google, etc.)
CREATE TABLE core.user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT,
  metadata JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  linked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_identity_provider UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_user_identities_user ON core.user_identities(user_id);
CREATE INDEX idx_user_identities_provider ON core.user_identities(provider, provider_user_id);

COMMENT ON TABLE core.user_identities IS 'Links users to external IdPs (Kinde, Firebase, etc.)';
COMMENT ON COLUMN core.user_identities.provider IS 'Identity provider: kinde, firebase, google, microsoft';
COMMENT ON COLUMN core.user_identities.provider_user_id IS 'User ID from the provider (Kinde sub, Firebase UID, etc.)';
COMMENT ON COLUMN core.user_identities.is_primary IS 'Primary login method for this user';

-- =============================================================================
-- ORGANIZATION REFERENCES (MSSQL is SoR - we store references only)
-- =============================================================================

CREATE TABLE core.org_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_org_id TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_org_slug CHECK (core.is_valid_slug(slug))
);

CREATE INDEX idx_org_refs_slug ON core.org_refs(slug);
CREATE INDEX idx_org_refs_external ON core.org_refs(external_org_id);

COMMENT ON TABLE core.org_refs IS 'References to orgs in legacy MSSQL - NOT authoritative';
COMMENT ON COLUMN core.org_refs.external_org_id IS 'ID from legacy MSSQL system';
COMMENT ON COLUMN core.org_refs.slug IS 'URL-friendly identifier - PostgreSQL owns this';
COMMENT ON COLUMN core.org_refs.display_name IS 'Cached name - refreshed hourly from legacy';

-- =============================================================================
-- MEMBERSHIPS (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
  org_ref_id UUID NOT NULL REFERENCES core.org_refs(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  invited_by UUID REFERENCES core.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT uq_user_org UNIQUE (user_id, org_ref_id),
  CONSTRAINT chk_role CHECK (role IN ('owner', 'global_admin', 'global_user', 'viewer'))
);

CREATE INDEX idx_memberships_user ON core.memberships(user_id);
CREATE INDEX idx_memberships_org ON core.memberships(org_ref_id);
CREATE INDEX idx_memberships_role ON core.memberships(org_ref_id, role);

COMMENT ON TABLE core.memberships IS 'Org-level membership - PostgreSQL is SoR';
COMMENT ON COLUMN core.memberships.role IS 'owner, global_admin, global_user, viewer';

-- =============================================================================
-- SITE REFERENCES (MSSQL is SoR - we store references only)
-- =============================================================================

CREATE TABLE core.site_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_ref_id UUID NOT NULL REFERENCES core.org_refs(id) ON DELETE CASCADE,
  external_site_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_site_external UNIQUE (org_ref_id, external_site_id),
  CONSTRAINT uq_site_slug UNIQUE (org_ref_id, slug),
  CONSTRAINT chk_site_slug CHECK (core.is_valid_slug(slug))
);

CREATE INDEX idx_site_refs_org ON core.site_refs(org_ref_id);
CREATE INDEX idx_site_refs_slug ON core.site_refs(org_ref_id, slug);

COMMENT ON TABLE core.site_refs IS 'References to sites in legacy MSSQL - NOT authoritative';
COMMENT ON COLUMN core.site_refs.slug IS 'URL-friendly identifier, unique within org';

-- =============================================================================
-- SITE MEMBERSHIPS (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.site_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES core.memberships(id) ON DELETE CASCADE,
  site_ref_id UUID NOT NULL REFERENCES core.site_refs(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT uq_membership_site UNIQUE (membership_id, site_ref_id),
  CONSTRAINT chk_site_role CHECK (role IN ('site_admin', 'site_user', 'site_viewer'))
);

CREATE INDEX idx_site_memberships_membership ON core.site_memberships(membership_id);
CREATE INDEX idx_site_memberships_site ON core.site_memberships(site_ref_id);

COMMENT ON TABLE core.site_memberships IS 'Site-level access within an org membership';
COMMENT ON COLUMN core.site_memberships.role IS 'site_admin, site_user, site_viewer';

-- =============================================================================
-- BUILDING REFERENCES (MSSQL is SoR - we store references only)
-- =============================================================================

CREATE TABLE core.building_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_ref_id UUID NOT NULL REFERENCES core.site_refs(id) ON DELETE CASCADE,
  external_building_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_building_external UNIQUE (site_ref_id, external_building_id),
  CONSTRAINT uq_building_slug UNIQUE (site_ref_id, slug),
  CONSTRAINT chk_building_slug CHECK (core.is_valid_slug(slug))
);

CREATE INDEX idx_building_refs_site ON core.building_refs(site_ref_id);

COMMENT ON TABLE core.building_refs IS 'References to buildings in legacy MSSQL';

-- =============================================================================
-- DEVICE REFERENCES (MSSQL is SoR - we store references only)
-- =============================================================================

CREATE TABLE core.device_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_ref_id UUID NOT NULL REFERENCES core.org_refs(id) ON DELETE CASCADE,
  site_ref_id UUID REFERENCES core.site_refs(id),
  external_device_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  device_type TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT uq_device_external UNIQUE (org_ref_id, external_device_id),
  CONSTRAINT uq_device_slug UNIQUE (org_ref_id, slug),
  CONSTRAINT chk_device_slug CHECK (core.is_valid_slug(slug))
);

CREATE INDEX idx_device_refs_org ON core.device_refs(org_ref_id);
CREATE INDEX idx_device_refs_site ON core.device_refs(site_ref_id);
CREATE INDEX idx_device_refs_type ON core.device_refs(org_ref_id, device_type);

COMMENT ON TABLE core.device_refs IS 'References to devices in legacy MSSQL';
COMMENT ON COLUMN core.device_refs.site_ref_id IS 'Current site - devices can move between sites';
COMMENT ON COLUMN core.device_refs.slug IS 'URL-friendly identifier, unique within org';

-- =============================================================================
-- SLUG HISTORY (for redirect support when slugs change)
-- =============================================================================

CREATE TABLE core.slug_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_slug TEXT NOT NULL,
  parent_id UUID,
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_entity_type CHECK (entity_type IN ('org', 'site', 'building', 'device'))
);

CREATE INDEX idx_slug_history_lookup ON core.slug_history(entity_type, old_slug, parent_id);

COMMENT ON TABLE core.slug_history IS 'Tracks old slugs for redirect support';

-- =============================================================================
-- ORG SETTINGS (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.org_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_ref_id UUID UNIQUE NOT NULL REFERENCES core.org_refs(id) ON DELETE CASCADE,
  audit_retention_days INT DEFAULT 365,
  timezone TEXT DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE core.org_settings IS 'Per-org configuration';
COMMENT ON COLUMN core.org_settings.audit_retention_days IS 'How long to keep audit logs';

-- =============================================================================
-- AUDIT LOG (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_ref_id UUID REFERENCES core.org_refs(id),
  user_id UUID REFERENCES core.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_audit_log_org_time ON core.audit_log(org_ref_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON core.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON core.audit_log(resource_type, resource_id);

COMMENT ON TABLE core.audit_log IS 'Audit trail for all mutations';

-- =============================================================================
-- PASSES - NEW CAPABILITY (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_ref_id UUID NOT NULL REFERENCES core.org_refs(id) ON DELETE CASCADE,
  site_ref_id UUID REFERENCES core.site_refs(id),
  user_id UUID REFERENCES core.users(id),
  code TEXT NOT NULL,
  pass_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  visitor_name TEXT,
  visitor_email TEXT,
  host_user_id UUID REFERENCES core.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT uq_pass_code UNIQUE (org_ref_id, code),
  CONSTRAINT chk_pass_type CHECK (pass_type IN ('visitor', 'contractor', 'delivery', 'event')),
  CONSTRAINT chk_pass_status CHECK (status IN ('pending', 'active', 'expired', 'revoked'))
);

CREATE INDEX idx_passes_org ON core.passes(org_ref_id);
CREATE INDEX idx_passes_org_status ON core.passes(org_ref_id, status);
CREATE INDEX idx_passes_org_valid ON core.passes(org_ref_id, status, valid_to);
CREATE INDEX idx_passes_site ON core.passes(site_ref_id);
CREATE INDEX idx_passes_user ON core.passes(user_id);
CREATE INDEX idx_passes_code ON core.passes(org_ref_id, code);

COMMENT ON TABLE core.passes IS 'Visitor/contractor passes - NEW capability, PostgreSQL is SoR';
COMMENT ON COLUMN core.passes.code IS 'Human-readable pass code, e.g., P-ABC123';

-- =============================================================================
-- PASS EVENTS (PostgreSQL is SoR)
-- =============================================================================

CREATE TABLE core.pass_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID NOT NULL REFERENCES core.passes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  device_ref_id UUID REFERENCES core.device_refs(id),
  location JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT chk_event_type CHECK (event_type IN ('scanned', 'entry', 'exit', 'denied'))
);

CREATE INDEX idx_pass_events_pass ON core.pass_events(pass_id, created_at DESC);
CREATE INDEX idx_pass_events_device ON core.pass_events(device_ref_id, created_at DESC);

COMMENT ON TABLE core.pass_events IS 'Pass scan/entry/exit events';

-- =============================================================================
-- TRIGGERS FOR updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION core.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON core.users
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_org_refs_updated_at
  BEFORE UPDATE ON core.org_refs
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_memberships_updated_at
  BEFORE UPDATE ON core.memberships
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_site_refs_updated_at
  BEFORE UPDATE ON core.site_refs
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_site_memberships_updated_at
  BEFORE UPDATE ON core.site_memberships
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_org_settings_updated_at
  BEFORE UPDATE ON core.org_settings
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();

CREATE TRIGGER trg_passes_updated_at
  BEFORE UPDATE ON core.passes
  FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();
