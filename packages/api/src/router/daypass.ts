/**
 * Day Pass Router - Payment and pass issuance
 */

import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";

export const daypassRouter = createRouter({
  createPaymentIntent: publicProcedure
    .input(z.object({
      siteId: z.string(),
      passTypeId: z.string(),
      email: z.string().email(),
      name: z.string().min(1),
    }))
    .mutation(async () => {
      // TODO: Implement with Stripe
      return {
        clientSecret: "pi_placeholder",
        amount: 2500,
        currency: "aud",
      };
    }),

  issuePass: publicProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async () => {
      // TODO: Implement pass issuance
      return {
        passId: "00000000-0000-0000-0000-000000000000",
        code: "DAYPASS-XXXX-XXXX",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passType: "Day Pass",
        siteName: "Demo Site",
      };
    }),

  validatePass: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      // TODO: Implement with Supabase
      return { valid: false, reason: `Pass ${input.code} not found` };
    }),
});
