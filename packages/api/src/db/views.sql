-- Zezamii Modern Platform - Public CDM Views
-- These views are the stable contract for tRPC procedures
-- Rules: Additive changes only, never remove columns

-- =============================================================================
-- USER VIEWS
-- =============================================================================

-- Users with their primary identity
CREATE OR REPLACE VIEW public.v_users AS
SELECT
  u.id,
  u.primary_email,
  u.name,
  u.picture_url,
  u.email_verified,
  u.created_at,
  u.updated_at,
  pi.provider AS primary_provider,
  pi.provider_user_id AS primary_provider_user_id
FROM core.users u
LEFT JOIN core.user_identities pi ON pi.user_id = u.id AND pi.is_primary = true
WHERE u.deleted_at IS NULL;

COMMENT ON VIEW public.v_users IS 'Active users with primary identity info';

-- All user identities (for lookup by any provider)
CREATE OR REPLACE VIEW public.v_user_identities AS
SELECT
  ui.id,
  ui.user_id,
  ui.provider,
  ui.provider_user_id,
  ui.email,
  ui.is_primary,
  ui.last_login_at,
  ui.linked_at,
  ui.created_at
FROM core.user_identities ui
JOIN core.users u ON u.id = ui.user_id AND u.deleted_at IS NULL;

COMMENT ON VIEW public.v_user_identities IS 'All linked identity providers per user';

-- =============================================================================
-- MEMBERSHIP VIEWS
-- =============================================================================

-- Org-level memberships with org details
CREATE OR REPLACE VIEW public.v_memberships AS
SELECT
  m.id,
  m.user_id,
  m.org_ref_id,
  o.external_org_id,
  o.slug AS org_slug,
  o.display_name AS org_display_name,
  m.role,
  m.invited_by,
  m.invited_at,
  m.accepted_at,
  m.created_at,
  m.updated_at
FROM core.memberships m
JOIN core.org_refs o ON o.id = m.org_ref_id
WHERE m.deleted_at IS NULL;

COMMENT ON VIEW public.v_memberships IS 'Org-level memberships with org details';

-- Site-level memberships with site details
CREATE OR REPLACE VIEW public.v_site_memberships AS
SELECT
  sm.id,
  sm.membership_id,
  m.user_id,
  m.org_ref_id,
  sm.site_ref_id,
  s.external_site_id,
  s.slug AS site_slug,
  s.display_name AS site_display_name,
  sm.role,
  sm.created_at,
  sm.updated_at
FROM core.site_memberships sm
JOIN core.memberships m ON m.id = sm.membership_id AND m.deleted_at IS NULL
JOIN core.site_refs s ON s.id = sm.site_ref_id
WHERE sm.deleted_at IS NULL;

COMMENT ON VIEW public.v_site_memberships IS 'Site-level access within org memberships';

-- Combined view: user's effective access (org + sites)
CREATE OR REPLACE VIEW public.v_user_access AS
SELECT
  m.user_id,
  m.org_ref_id,
  o.external_org_id,
  o.slug AS org_slug,
  m.role AS org_role,
  sm.site_ref_id,
  s.external_site_id,
  s.slug AS site_slug,
  sm.role AS site_role,
  -- Global admins/owners have implicit access to all sites
  CASE
    WHEN m.role IN ('owner', 'global_admin') THEN true
    ELSE sm.id IS NOT NULL
  END AS has_site_access
FROM core.memberships m
JOIN core.org_refs o ON o.id = m.org_ref_id
LEFT JOIN core.site_memberships sm ON sm.membership_id = m.id AND sm.deleted_at IS NULL
LEFT JOIN core.site_refs s ON s.id = sm.site_ref_id
WHERE m.deleted_at IS NULL;

COMMENT ON VIEW public.v_user_access IS 'Combined org + site access for a user';

-- =============================================================================
-- REFERENCE VIEWS (cached from legacy)
-- =============================================================================

-- Org references with slugs
CREATE OR REPLACE VIEW public.v_org_refs AS
SELECT
  id,
  external_org_id,
  slug,
  display_name,
  created_at,
  updated_at
FROM core.org_refs;

COMMENT ON VIEW public.v_org_refs IS 'Organization references (SoR in MSSQL)';

-- Site references with slugs and org context
CREATE OR REPLACE VIEW public.v_site_refs AS
SELECT
  s.id,
  s.org_ref_id,
  o.slug AS org_slug,
  s.external_site_id,
  s.slug,
  s.display_name,
  s.created_at,
  s.updated_at
FROM core.site_refs s
JOIN core.org_refs o ON o.id = s.org_ref_id;

COMMENT ON VIEW public.v_site_refs IS 'Site references (SoR in MSSQL)';

-- Building references
CREATE OR REPLACE VIEW public.v_building_refs AS
SELECT
  b.id,
  b.site_ref_id,
  s.org_ref_id,
  o.slug AS org_slug,
  s.slug AS site_slug,
  b.external_building_id,
  b.slug,
  b.display_name,
  b.created_at
FROM core.building_refs b
JOIN core.site_refs s ON s.id = b.site_ref_id
JOIN core.org_refs o ON o.id = s.org_ref_id;

COMMENT ON VIEW public.v_building_refs IS 'Building references (SoR in MSSQL)';

-- Device references with full slug path
CREATE OR REPLACE VIEW public.v_device_refs AS
SELECT
  d.id,
  d.org_ref_id,
  d.site_ref_id,
  o.slug AS org_slug,
  s.slug AS site_slug,
  d.external_device_id,
  d.slug,
  d.device_type,
  d.display_name,
  d.created_at,
  -- Full slug path for QR codes
  CASE
    WHEN s.slug IS NOT NULL THEN o.slug || '/' || s.slug || '/' || d.slug
    ELSE o.slug || '/' || d.slug
  END AS full_slug_path
FROM core.device_refs d
JOIN core.org_refs o ON o.id = d.org_ref_id
LEFT JOIN core.site_refs s ON s.id = d.site_ref_id;

COMMENT ON VIEW public.v_device_refs IS 'Device references with full slug path';

-- =============================================================================
-- PASS VIEWS (NEW CAPABILITY)
-- =============================================================================

-- All passes for an org
CREATE OR REPLACE VIEW public.v_passes AS
SELECT
  p.id,
  p.org_ref_id,
  o.slug AS org_slug,
  p.site_ref_id,
  s.slug AS site_slug,
  p.user_id,
  p.code,
  p.pass_type,
  p.status,
  p.valid_from,
  p.valid_to,
  p.visitor_name,
  p.visitor_email,
  p.host_user_id,
  hu.name AS host_name,
  p.metadata,
  p.created_at,
  p.updated_at,
  -- Full URL path
  CASE
    WHEN s.slug IS NOT NULL THEN o.slug || '/' || s.slug || '/' || p.code
    ELSE o.slug || '/' || p.code
  END AS url_path
FROM core.passes p
JOIN core.org_refs o ON o.id = p.org_ref_id
LEFT JOIN core.site_refs s ON s.id = p.site_ref_id
LEFT JOIN core.users hu ON hu.id = p.host_user_id
WHERE p.deleted_at IS NULL;

COMMENT ON VIEW public.v_passes IS 'All passes with org/site context';

-- Active passes only
CREATE OR REPLACE VIEW public.v_passes_active AS
SELECT * FROM public.v_passes
WHERE status = 'active' AND (valid_to IS NULL OR valid_to > now());

COMMENT ON VIEW public.v_passes_active IS 'Currently active passes';

-- Pending passes (awaiting activation)
CREATE OR REPLACE VIEW public.v_passes_pending AS
SELECT * FROM public.v_passes
WHERE status = 'pending';

COMMENT ON VIEW public.v_passes_pending IS 'Pending passes awaiting activation';

-- Recent pass events (last 7 days)
CREATE OR REPLACE VIEW public.v_pass_events_recent AS
SELECT
  pe.id,
  pe.pass_id,
  p.code AS pass_code,
  p.org_ref_id,
  pe.event_type,
  pe.device_ref_id,
  d.slug AS device_slug,
  d.display_name AS device_name,
  pe.location,
  pe.metadata,
  pe.created_at
FROM core.pass_events pe
JOIN core.passes p ON p.id = pe.pass_id
LEFT JOIN core.device_refs d ON d.id = pe.device_ref_id
WHERE pe.created_at > now() - interval '7 days'
ORDER BY pe.created_at DESC;

COMMENT ON VIEW public.v_pass_events_recent IS 'Pass events from last 7 days';

-- =============================================================================
-- AUDIT VIEWS
-- =============================================================================

-- Recent audit log entries (last 30 days)
CREATE OR REPLACE VIEW public.v_audit_log_recent AS
SELECT
  a.id,
  a.org_ref_id,
  o.slug AS org_slug,
  a.user_id,
  u.name AS user_name,
  u.primary_email AS user_email,
  a.action,
  a.resource_type,
  a.resource_id,
  a.metadata,
  a.ip_address,
  a.user_agent,
  a.created_at
FROM core.audit_log a
LEFT JOIN core.org_refs o ON o.id = a.org_ref_id
LEFT JOIN core.users u ON u.id = a.user_id
WHERE a.created_at > now() - interval '30 days'
ORDER BY a.created_at DESC;

COMMENT ON VIEW public.v_audit_log_recent IS 'Audit entries from last 30 days';

-- =============================================================================
-- ORG SETTINGS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW public.v_org_settings AS
SELECT
  os.id,
  os.org_ref_id,
  o.slug AS org_slug,
  o.display_name AS org_display_name,
  os.audit_retention_days,
  os.timezone,
  os.settings,
  os.created_at,
  os.updated_at
FROM core.org_settings os
JOIN core.org_refs o ON o.id = os.org_ref_id;

COMMENT ON VIEW public.v_org_settings IS 'Organization settings with org context';

-- =============================================================================
-- SLUG LOOKUP HELPER VIEW
-- =============================================================================

-- Unified slug lookup for redirects
CREATE OR REPLACE VIEW public.v_slug_history AS
SELECT
  sh.id,
  sh.entity_type,
  sh.entity_id,
  sh.old_slug,
  sh.parent_id,
  sh.changed_at,
  -- Current slug based on entity type
  CASE sh.entity_type
    WHEN 'org' THEN o.slug
    WHEN 'site' THEN s.slug
    WHEN 'building' THEN b.slug
    WHEN 'device' THEN d.slug
  END AS current_slug
FROM core.slug_history sh
LEFT JOIN core.org_refs o ON sh.entity_type = 'org' AND sh.entity_id = o.id
LEFT JOIN core.site_refs s ON sh.entity_type = 'site' AND sh.entity_id = s.id
LEFT JOIN core.building_refs b ON sh.entity_type = 'building' AND sh.entity_id = b.id
LEFT JOIN core.device_refs d ON sh.entity_type = 'device' AND sh.entity_id = d.id;

COMMENT ON VIEW public.v_slug_history IS 'Old slugs with their current replacements';
