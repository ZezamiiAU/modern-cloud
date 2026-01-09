/**
 * Stripe Service - Payment Processing
 *
 * Handles payment intent creation, webhook verification, and payment status checks.
 */

import Stripe from "stripe";

// Lazy-initialized Stripe client
let _stripe: Stripe | null = null;

/**
 * Get or create the Stripe client
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }

    _stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }

  return _stripe;
}

// =============================================================================
// PAYMENT INTENTS
// =============================================================================

export interface CreatePaymentIntentInput {
  amount: number; // in cents
  currency: string;
  metadata: {
    siteId: string;
    passTypeId: string;
    email: string;
    name: string;
    phone?: string;
    vehiclePlate?: string;
  };
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

/**
 * Create a payment intent for a day pass purchase
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<PaymentIntentResult> {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: input.amount,
    currency: input.currency,
    metadata: input.metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  if (!paymentIntent.client_secret) {
    throw new Error("Failed to create payment intent: no client secret");
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  };
}

/**
 * Retrieve payment intent status
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Verify payment is successful
 */
export async function verifyPayment(paymentIntentId: string): Promise<boolean> {
  const paymentIntent = await getPaymentIntent(paymentIntentId);
  return paymentIntent.status === "succeeded";
}

// =============================================================================
// WEBHOOKS
// =============================================================================

/**
 * Construct and verify Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
