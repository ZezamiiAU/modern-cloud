/**
 * Drizzle Schema - Core Database Schema
 *
 * Re-exports all tables, relations, and types for Drizzle ORM.
 *
 * Usage:
 *   import { users, memberships, passes } from "@repo/api/db";
 *   import type { User, Membership } from "@repo/api/db";
 */

// Users & Identity
export {
  coreSchema,
  users,
  userIdentities,
  usersRelations,
  userIdentitiesRelations,
} from "./users";

// Organizations & Memberships
export {
  orgRefs,
  memberships,
  membershipRoleEnum,
  type MembershipRole,
  orgRefsRelations,
  membershipsRelations,
} from "./orgs";

// Sites & Site Memberships
export {
  siteRefs,
  siteMemberships,
  siteMembershipRoleEnum,
  type SiteMembershipRole,
  siteRefsRelations,
  siteMembershipsRelations,
} from "./sites";

// Reference Tables
export {
  buildingRefs,
  deviceRefs,
  slugHistory,
  slugEntityTypeEnum,
  type SlugEntityType,
  buildingRefsRelations,
  deviceRefsRelations,
} from "./refs";

// Pass Types (site-specific configuration)
export {
  passTypes,
  passTypesRelations,
} from "./pass-types";

// Passes (new capability)
export {
  passes,
  passEvents,
  passTypeEnum,
  passStatusEnum,
  passEventTypeEnum,
  type PassType,
  type PassStatus,
  type PassEventType,
  passesRelations,
  passEventsRelations,
} from "./passes";

// Audit & Settings
export {
  orgSettings,
  auditLog,
  orgSettingsRelations,
  auditLogRelations,
} from "./audit";
