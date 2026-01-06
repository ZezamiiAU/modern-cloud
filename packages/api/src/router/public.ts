/**
 * Public Router - Slug resolution and public configuration
 */

import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";

export const publicRouter = createRouter({
  resolveSlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      // TODO: Implement with Supabase
      return {
        slug: input.slug,
        orgId: "placeholder",
        siteId: "placeholder",
        siteName: "Demo Site",
        orgName: "Demo Org",
        logoUrl: null,
        timezone: "Australia/Sydney",
        features: { dayPass: true, bookings: false },
      };
    }),

  getPassTypes: publicProcedure
    .input(z.object({ siteId: z.string() }))
    .query(async () => {
      // TODO: Implement with Supabase
      return [
        { id: "1", name: "Day Pass", description: "24-hour access", price_cents: 2500, duration_hours: 24 },
        { id: "2", name: "Half Day", description: "4-hour access", price_cents: 1500, duration_hours: 4 },
      ];
    }),
});
