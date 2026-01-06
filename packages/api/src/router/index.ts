/**
 * Core API Router
 *
 * This is the main tRPC router that combines all domain routers.
 * Apps import this via @repo/api/router
 */

import { createRouter } from "../trpc";
import { healthRouter } from "./health";
import { publicRouter } from "./public";
import { daypassRouter } from "./daypass";
import { eventsRouter } from "./events";
import { legacyRouter } from "./legacy";

/**
 * Main application router
 * All tRPC procedures are accessed through this router
 */
export const appRouter = createRouter({
  health: healthRouter,
  public: publicRouter,
  daypass: daypassRouter,
  events: eventsRouter,
  legacy: legacyRouter,
});

/**
 * Type definition for the API
 * Used by tRPC client for end-to-end type safety
 */
export type AppRouter = typeof appRouter;
