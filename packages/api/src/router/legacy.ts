/**
 * Legacy Router - Controlled access to legacy APIs
 */

import { z } from "zod";
import { createRouter, protectedProcedure } from "../trpc";

export const legacyRouter = createRouter({
  getDevices: protectedProcedure
    .input(z.object({ siteId: z.string() }))
    .query(async () => {
      // TODO: Implement legacy API call
      return [];
    }),

  getSites: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async () => {
      // TODO: Implement legacy API call
      return [];
    }),

  requestUnlock: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      reason: z.string(),
    }))
    .mutation(async () => {
      // TODO: Implement legacy unlock
      return { success: false, message: "Not implemented" };
    }),
});
