export * from "./env";

/**
 * Application constants
 */
export const APP_NAME = "Zezamii";

export const ROUTES = {
  // Public routes
  HOME: "/",
  DAYPASS: "/pass",

  // Cloud admin routes
  CLOUD_DASHBOARD: "/dashboard",
  CLOUD_SITES: "/dashboard/sites",
  CLOUD_DEVICES: "/dashboard/devices",
  CLOUD_PASSES: "/dashboard/passes",
  CLOUD_SETTINGS: "/dashboard/settings",
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  // tRPC endpoint
  TRPC_ENDPOINT: "/api/trpc",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;
