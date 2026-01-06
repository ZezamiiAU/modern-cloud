/**
 * tRPC Server Configuration
 *
 * Context includes:
 * - supabase: Database client
 * - kindeUser: Raw Kinde user from session (if authenticated)
 * - user: Resolved PostgreSQL user (if authenticated)
 * - orgRefId: Current org context (from header/cookie)
 * - membership: User's membership in current org (if org selected)
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type KindeUser } from "@repo/auth";
import { type SupabaseClient } from "@supabase/supabase-js";
import type { ResolvedUser } from "./db/resolve-user";
import type { VMembership } from "./db/types";

/**
 * Base context - always available
 */
export interface BaseContext {
  supabase: SupabaseClient;
  requestId: string;
  /** Raw Kinde user from session */
  kindeUser: KindeUser | null;
}

/**
 * Full context - includes resolved user and org
 */
export interface Context extends BaseContext {
  /** Resolved PostgreSQL user */
  user: ResolvedUser | null;
  /** Current org context (from x-org-id header or cookie) */
  orgRefId: string | null;
  /** User's membership in current org */
  membership: VMembership | null;
  /** All user's org memberships */
  memberships: VMembership[];
}

/**
 * Authenticated context - user is guaranteed
 */
export interface AuthenticatedContext extends Context {
  kindeUser: KindeUser;
  user: ResolvedUser;
  memberships: VMembership[];
}

/**
 * Org-scoped context - user and org are guaranteed
 */
export interface OrgScopedContext extends AuthenticatedContext {
  orgRefId: string;
  membership: VMembership;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const mergeRouters = t.mergeRouters;

/**
 * Protected procedure - requires authenticated user
 *
 * Use for user-level operations that don't require org context.
 * Examples: user profile, list user's orgs
 */
export const protectedProcedure = t.procedure.use(
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    return next({
      ctx: {
        ...ctx,
        kindeUser: ctx.kindeUser!,
        user: ctx.user,
        memberships: ctx.memberships,
      } as AuthenticatedContext,
    });
  })
);

/**
 * Org-scoped procedure - requires authenticated user AND org context
 *
 * Use for all org-specific operations. The orgRefId is automatically
 * validated against user's memberships.
 *
 * Examples: list passes, create membership, view audit log
 */
export const orgProcedure = t.procedure.use(
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    if (!ctx.orgRefId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization context required. Set x-org-id header.",
      });
    }

    if (!ctx.membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have access to this organization",
      });
    }

    return next({
      ctx: {
        ...ctx,
        kindeUser: ctx.kindeUser!,
        user: ctx.user,
        orgRefId: ctx.orgRefId,
        membership: ctx.membership,
        memberships: ctx.memberships,
      } as OrgScopedContext,
    });
  })
);

/**
 * Admin procedure - requires org admin role
 *
 * Use for admin-only operations within an org.
 * Roles: owner, global_admin
 */
export const adminProcedure = orgProcedure.use(
  middleware(async ({ ctx, next }) => {
    const adminRoles = ["owner", "global_admin"];

    if (!adminRoles.includes(ctx.membership.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    return next({ ctx });
  })
);

/**
 * Owner procedure - requires owner role only
 *
 * Use for owner-only operations like deleting the org.
 */
export const ownerProcedure = orgProcedure.use(
  middleware(async ({ ctx, next }) => {
    if (ctx.membership.role !== "owner") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Owner access required",
      });
    }

    return next({ ctx });
  })
);
