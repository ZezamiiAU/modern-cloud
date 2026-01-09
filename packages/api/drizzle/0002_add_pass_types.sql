-- Migration: Add pass_types table for site-specific pricing
-- Created: 2026-01-06

-- ============================================================================
-- PASS TYPES TABLE
-- ============================================================================
-- Site-specific pass products with pricing and duration configuration
CREATE TABLE IF NOT EXISTS "core"."pass_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "site_ref_id" uuid NOT NULL REFERENCES "core"."site_refs"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "price_cents" integer NOT NULL,
  "currency" text DEFAULT 'aud' NOT NULL,
  "duration_hours" integer NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS "uq_pass_type_site_name" ON "core"."pass_types" ("site_ref_id", "name");
CREATE INDEX IF NOT EXISTS "idx_pass_types_site" ON "core"."pass_types" ("site_ref_id");
CREATE INDEX IF NOT EXISTS "idx_pass_types_site_active" ON "core"."pass_types" ("site_ref_id", "active");

-- ============================================================================
-- UPDATE PASSES TABLE
-- ============================================================================
-- Add foreign key to pass_types
ALTER TABLE "core"."passes"
  ADD COLUMN IF NOT EXISTS "pass_type_id" uuid NOT NULL REFERENCES "core"."pass_types"("id") ON DELETE RESTRICT;

-- Add index for pass_type_id
CREATE INDEX IF NOT EXISTS "idx_passes_pass_type" ON "core"."passes" ("pass_type_id");
