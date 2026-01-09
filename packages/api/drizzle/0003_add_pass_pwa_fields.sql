-- Migration: Add PWA fields to passes table
-- Adds vehicle plate, phone, and Stripe payment intent ID fields

ALTER TABLE core.passes
ADD COLUMN IF NOT EXISTS visitor_phone text,
ADD COLUMN IF NOT EXISTS vehicle_plate text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Create index for Stripe payment intent lookups
CREATE INDEX IF NOT EXISTS idx_passes_stripe_intent
ON core.passes(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN core.passes.visitor_phone IS 'Optional phone number for pass recipient (SMS notifications)';
COMMENT ON COLUMN core.passes.vehicle_plate IS 'Optional vehicle registration plate for parking passes';
COMMENT ON COLUMN core.passes.stripe_payment_intent_id IS 'Stripe payment intent ID for paid passes';
