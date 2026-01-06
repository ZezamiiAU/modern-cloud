/**
 * @repo/api
 *
 * Common Core API for Zezamii Modern Platform.
 *
 * This package is the single backend interface for all apps.
 * It encapsulates:
 * - New data (Supabase)
 * - Legacy integrations
 * - Business rules
 * - Event orchestration
 * - Payment workflows
 * - Permission checks
 *
 * Apps NEVER talk directly to databases.
 * Apps NEVER call legacy directly.
 * Apps ONLY talk to @repo/api.
 */

// Router
export { appRouter, type AppRouter } from "./router";

// tRPC primitives for extending
export {
  createRouter,
  publicProcedure,
  protectedProcedure,
  orgProcedure,
  adminProcedure,
  ownerProcedure,
  middleware,
  mergeRouters,
  type Context,
  type BaseContext,
  type AuthenticatedContext,
  type OrgScopedContext,
} from "./trpc";

// Database - schema, types, and client
export {
  // Client
  db,
  getDb,
  createDb,
  // Schema tables
  users,
  userIdentities,
  orgRefs,
  memberships,
  siteMemberships,
  siteRefs,
  buildingRefs,
  deviceRefs,
  slugHistory,
  orgSettings,
  auditLog,
  passes,
  passEvents,
  // Enums
  membershipRoleEnum,
  siteMembershipRoleEnum,
  passTypeEnum,
  passStatusEnum,
  passEventTypeEnum,
  slugEntityTypeEnum,
} from "./db";

// Database types
export type {
  // Select types
  User,
  UserIdentity,
  OrgRef,
  Membership,
  SiteMembership,
  SiteRef,
  BuildingRef,
  DeviceRef,
  SlugHistory,
  OrgSettings,
  AuditLog,
  Pass,
  PassEvent,
  // Insert types
  CreateUserInput,
  CreateUserIdentityInput,
  CreateOrgRefInput,
  CreateMembershipInput,
  CreateSiteMembershipInput,
  CreateSiteRefInput,
  CreateBuildingRefInput,
  CreateDeviceRefInput,
  CreateSlugHistoryInput,
  CreateOrgSettingsInput,
  CreateAuditLogInput,
  CreatePassInput,
  CreatePassEventInput,
  // Enum types
  MembershipRole,
  SiteMembershipRole,
  SlugEntityType,
  PassType,
  PassStatus,
  PassEventType,
  // View types
  VUser,
  VMembership,
  VUserAccess,
  VPass,
} from "./db";

// User resolution
export {
  resolveUser,
  resolveSession,
  getUserMemberships,
  validateOrgAccess,
  type ResolvedUser,
  type ResolvedSession,
} from "./db";

// Context factory
export {
  createContext,
  createPublicContext,
  type CreateContextOptions,
} from "./context";
