/**
 * Health Router
 */

import { createRouter, publicProcedure } from "../trpc";

export const healthRouter = createRouter({
  check: publicProcedure.query(() => {
    return {
      status: "healthy" as const,
      timestamp: new Date().toISOString(),
    };
  }),
});
