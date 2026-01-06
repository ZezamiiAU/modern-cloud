/**
 * Database Module
 *
 * Exports Drizzle client, schema, and types.
 *
 * Usage:
 *   import { db, users, memberships } from "@repo/api/db";
 *   import type { User, Membership } from "@repo/api/db";
 *
 *   const allUsers = await db.select().from(users);
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// =============================================================================
// DATABASE CLIENT
// =============================================================================

/**
 * Create a Drizzle database client
 *
 * Uses postgres.js driver for optimal performance.
 * Connection string from DATABASE_URL environment variable.
 */
export function createDb(connectionString?: string) {
  const url = connectionString || process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(url, {
    // Supabase requires SSL in production
    ssl: url.includes("supabase.co") ? "require" : undefined,
    // Connection pool settings
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
}

// Lazy-initialized default client
let _db: ReturnType<typeof createDb> | null = null;

/**
 * Get the default database client
 *
 * Lazily creates the client on first access.
 */
export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

/**
 * Default database client
 *
 * Use this for simple queries. For custom connections, use createDb().
 */
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    return (getDb() as Record<string, unknown>)[prop as string];
  },
});

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Schema (tables and relations)
export * from "./schema";

// Types
export * from "./types";

// User resolution helpers
export {
  resolveUser,
  resolveSession,
  getUserMemberships,
  validateOrgAccess,
  type ResolvedUser,
  type ResolvedSession,
} from "./resolve-user";
