/**
 * Events Router - Access events and audit logging
 */

import { z } from "zod";
import { createRouter, publicProcedure, protectedProcedure } from "../trpc";

export const eventsRouter = createRouter({
  record: publicProcedure
    .input(z.object({
      type: z.string(),
      siteId: z.string(),
      metadata: z.record(z.unknown()).optional(),
    }))
    .mutation(async () => {
      // TODO: Implement with Supabase
      return { recorded: true, eventId: "placeholder" };
    }),

  list: protectedProcedure
    .input(z.object({
      siteId: z.string(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async () => {
      // TODO: Implement with Supabase
      return { events: [], nextCursor: undefined };
    }),
});
