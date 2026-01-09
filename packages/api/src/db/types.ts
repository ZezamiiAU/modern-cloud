/**
 * Database Types
 *
 * TypeScript types inferred from Drizzle schema.
 * These are used for type-safe queries.
 */

import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
  type users,
  type userIdentities,
  type orgRefs,
  type memberships,
  type siteMemberships,
  type siteRefs,
  type buildingRefs,
  type deviceRefs,
  type slugHistory,
  type orgSettings,
  type auditLog,
  type passTypes,
  type passes,
  type passEvents,
} from "./schema";

// Re-export enum types from schema
export type {
  MembershipRole,
  SiteMembershipRole,
  SlugEntityType,
  PassType,
  PassStatus,
  PassEventType,
} from "./schema";

// =============================================================================
// SELECT TYPES (for reading from DB)
// =============================================================================

export type User = InferSelectModel<typeof users>;
export type UserIdentity = InferSelectModel<typeof userIdentities>;
export type OrgRef = InferSelectModel<typeof orgRefs>;
export type Membership = InferSelectModel<typeof memberships>;
export type SiteMembership = InferSelectModel<typeof siteMemberships>;
export type SiteRef = InferSelectModel<typeof siteRefs>;
export type BuildingRef = InferSelectModel<typeof buildingRefs>;
export type DeviceRef = InferSelectModel<typeof deviceRefs>;
export type SlugHistory = InferSelectModel<typeof slugHistory>;
export type OrgSettings = InferSelectModel<typeof orgSettings>;
export type AuditLog = InferSelectModel<typeof auditLog>;
export type PassTypeConfig = InferSelectModel<typeof passTypes>;
export type Pass = InferSelectModel<typeof passes>;
export type PassEvent = InferSelectModel<typeof passEvents>;

// =============================================================================
// INSERT TYPES (for writing to DB)
// =============================================================================

export type CreateUserInput = InferInsertModel<typeof users>;
export type CreateUserIdentityInput = InferInsertModel<typeof userIdentities>;
export type CreateOrgRefInput = InferInsertModel<typeof orgRefs>;
export type CreateMembershipInput = InferInsertModel<typeof memberships>;
export type CreateSiteMembershipInput = InferInsertModel<typeof siteMemberships>;
export type CreateSiteRefInput = InferInsertModel<typeof siteRefs>;
export type CreateBuildingRefInput = InferInsertModel<typeof buildingRefs>;
export type CreateDeviceRefInput = InferInsertModel<typeof deviceRefs>;
export type CreateSlugHistoryInput = InferInsertModel<typeof slugHistory>;
export type CreateOrgSettingsInput = InferInsertModel<typeof orgSettings>;
export type CreateAuditLogInput = InferInsertModel<typeof auditLog>;
export type CreatePassTypeInput = InferInsertModel<typeof passTypes>;
export type CreatePassInput = InferInsertModel<typeof passes>;
export type CreatePassEventInput = InferInsertModel<typeof passEvents>;

// =============================================================================
// VIEW TYPES (for common query patterns)
// =============================================================================

/**
 * User with primary identity info
 * Matches v_users view
 */
export interface VUser {
  id: string;
  primaryEmail: string;
  name: string | null;
  pictureUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  primaryProvider: string | null;
  primaryProviderUserId: string | null;
}

/**
 * Membership with org details
 * Matches v_memberships view
 */
export interface VMembership {
  id: string;
  user_id: string;
  org_ref_id: string;
  external_org_id: string;
  org_slug: string;
  org_display_name: string | null;
  role: Membership["role"];
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User's effective access (org + site combined)
 * Matches v_user_access view
 */
export interface VUserAccess {
  user_id: string;
  org_ref_id: string;
  external_org_id: string;
  org_slug: string;
  org_role: Membership["role"];
  site_ref_id: string | null;
  external_site_id: string | null;
  site_slug: string | null;
  site_role: SiteMembership["role"] | null;
  has_site_access: boolean;
}

/**
 * Pass with org/site context
 * Matches v_passes view
 */
export interface VPass {
  id: string;
  org_ref_id: string;
  org_slug: string;
  site_ref_id: string | null;
  site_slug: string | null;
  user_id: string | null;
  code: string;
  pass_type: Pass["passType"];
  status: Pass["status"];
  valid_from: string | null;
  valid_to: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  host_user_id: string | null;
  host_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  url_path: string;
}
