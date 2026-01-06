/**
 * tRPC Context Factory
 *
 * Creates the context for tRPC procedures. This is called for every request
 * and handles:
 * - User resolution from Kinde token
 * - Org context from x-org-id header
 * - Membership validation
 */

import { type SupabaseClient } from "@supabase/supabase-js";
import { type KindeUser, type KindeTokenClaims } from "@repo/auth";
import { type Context } from "./trpc";
import { resolveUser, getUserMemberships, validateOrgAccess } from "./db/resolve-user";

export interface CreateContextOptions {
  /** Supabase client with service role */
  supabase: SupabaseClient;
  /** Kinde user from getKindeServerSession().getUser() */
  kindeUser: KindeUser | null;
  /** Kinde token claims (includes Firebase UID if OIDC) */
  tokenClaims: KindeTokenClaims | null;
  /** Selected org ID from x-org-id header or cookie */
  orgRefId: string | null;
  /** Request ID for tracing */
  requestId: string;
}

/**
 * Create tRPC context from request data
 *
 * Called by the app's tRPC handler before each procedure.
 *
 * @example
 * ```ts
 * // In apps/cloud/src/app/api/trpc/[trpc]/route.ts
 * const handler = fetchRequestHandler({
 *   createContext: async ({ req }) => {
 *     const { getUser, getAccessToken } = getKindeServerSession();
 *     const kindeUser = await getUser();
 *     const token = await getAccessToken();
 *
 *     return createContext({
 *       supabase,
 *       kindeUser,
 *       tokenClaims: token ? decodeToken(token) : null,
 *       orgRefId: req.headers.get("x-org-id"),
 *       requestId: crypto.randomUUID(),
 *     });
 *   },
 * });
 * ```
 */
export async function createContext(
  options: CreateContextOptions
): Promise<Context> {
  const { supabase, kindeUser, tokenClaims, orgRefId, requestId } = options;

  // Base context for unauthenticated requests
  if (!kindeUser || !tokenClaims) {
    return {
      supabase,
      requestId,
      kindeUser: null,
      user: null,
      orgRefId: null,
      membership: null,
      memberships: [],
    };
  }

  // Resolve Kinde user to PostgreSQL user
  const user = await resolveUser(supabase, tokenClaims);

  // Get all user's org memberships
  const memberships = await getUserMemberships(supabase, user.id);

  // If org context provided, validate membership
  let membership = null;
  if (orgRefId) {
    membership = await validateOrgAccess(supabase, user.id, orgRefId);
    // Note: We don't throw here - the orgProcedure middleware will handle missing membership
  }

  return {
    supabase,
    requestId,
    kindeUser,
    user,
    orgRefId,
    membership,
    memberships,
  };
}

/**
 * Create minimal context for public procedures
 *
 * Use when you only need supabase access without user resolution.
 */
export function createPublicContext(
  supabase: SupabaseClient,
  requestId: string
): Context {
  return {
    supabase,
    requestId,
    kindeUser: null,
    user: null,
    orgRefId: null,
    membership: null,
    memberships: [],
  };
}
