-- ============================================================================
-- TEST DATA SEED SCRIPT
-- ============================================================================
-- Creates sample organization, site, devices, and pass types for testing
--
-- Usage:
--   psql $DATABASE_URL -f scripts/seed-test-data.sql
--
-- WARNING: This will create test data in your database!
-- ============================================================================

-- Set schema
SET search_path TO core, public;

-- ============================================================================
-- 1. CREATE TEST ORGANIZATION
-- ============================================================================
INSERT INTO core.org_refs (id, external_org_id, slug, display_name)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'TEST-ORG-001', 'test-org', 'Test Organization')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. CREATE TEST SITE
-- ============================================================================
INSERT INTO core.site_refs (id, org_ref_id, external_site_id, slug, display_name)
VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'TEST-SITE-001',
    'melbourne-cbd',
    'Melbourne CBD Office'
  )
ON CONFLICT (org_ref_id, slug) DO NOTHING;

-- ============================================================================
-- 3. CREATE TEST DEVICES
-- ============================================================================
INSERT INTO core.device_refs (id, org_ref_id, site_ref_id, external_device_id, slug, device_type, display_name)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'TEST-DEV-001',
    'front-door',
    'lock',
    'Front Door Lock'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'TEST-DEV-002',
    'back-door',
    'lock',
    'Back Door Lock'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'TEST-DEV-003',
    'reception',
    'reader',
    'Reception Card Reader'
  )
ON CONFLICT (org_ref_id, slug) DO NOTHING;

-- ============================================================================
-- 4. CREATE PASS TYPES FOR TEST SITE
-- ============================================================================
INSERT INTO core.pass_types (id, site_ref_id, name, description, price_cents, currency, duration_hours, active, sort_order)
VALUES
  -- Day Pass
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000101',
    'Day Pass',
    '24-hour access to the facility',
    2500,
    'aud',
    24,
    true,
    1
  ),
  -- Half Day Pass
  (
    '00000000-0000-0000-0000-000000000302',
    '00000000-0000-0000-0000-000000000101',
    'Half Day',
    '4-hour access to the facility',
    1500,
    'aud',
    4,
    true,
    2
  ),
  -- Week Pass
  (
    '00000000-0000-0000-0000-000000000303',
    '00000000-0000-0000-0000-000000000101',
    'Week Pass',
    '7-day access to the facility',
    10000,
    'aud',
    168,
    true,
    3
  ),
  -- Monthly Pass (inactive example)
  (
    '00000000-0000-0000-0000-000000000304',
    '00000000-0000-0000-0000-000000000101',
    'Monthly Pass',
    '30-day access to the facility',
    35000,
    'aud',
    720,
    false,
    4
  )
ON CONFLICT (site_ref_id, name) DO NOTHING;

-- ============================================================================
-- 5. CREATE ORG SETTINGS
-- ============================================================================
INSERT INTO core.org_settings (org_ref_id, timezone, audit_retention_days)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Australia/Melbourne', 365)
ON CONFLICT (org_ref_id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT
  'Seed data created successfully!' as status,
  (SELECT COUNT(*) FROM core.org_refs WHERE slug = 'test-org') as orgs,
  (SELECT COUNT(*) FROM core.site_refs WHERE slug = 'melbourne-cbd') as sites,
  (SELECT COUNT(*) FROM core.device_refs WHERE org_ref_id = '00000000-0000-0000-0000-000000000001') as devices,
  (SELECT COUNT(*) FROM core.pass_types WHERE site_ref_id = '00000000-0000-0000-0000-000000000101') as pass_types;

-- ============================================================================
-- QR CODE URLs FOR TESTING
-- ============================================================================
-- These are the URLs to use in QR codes for each device:
--
-- Front Door:
--   https://daypass.zezamii.com/p/test-org/melbourne-cbd/front-door
--
-- Back Door:
--   https://daypass.zezamii.com/p/test-org/melbourne-cbd/back-door
--
-- Reception:
--   https://daypass.zezamii.com/p/test-org/melbourne-cbd/reception
--
-- Or site-wide QR:
--   https://daypass.zezamii.com/p/test-org/melbourne-cbd
-- ============================================================================
