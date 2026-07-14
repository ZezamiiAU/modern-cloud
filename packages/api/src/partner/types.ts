/**
 * Partner Domain — Contract Stub (cross-org entity model)
 *
 * A "partner" is a lock installer / reseller. Unlike the existing membership
 * roles (owner, global_admin, global_user, viewer) which are all scoped to a
 * SINGLE org via the x-org-id header, a partner's relationship is inherently
 * CROSS-ORG: they can see every site and lock they installed, no matter which
 * customer org owns it.
 *
 * Because of that, a partner is NOT modelled as a value in `membershipRoleEnum`.
 * It is a top-level entity with its own installation mapping.
 *
 * -----------------------------------------------------------------------------
 * INTENDED FUTURE SCHEMA (not yet migrated — this pass ships types + a scaffold
 * portal backed by mock data). When we land the migration, these interfaces map
 * onto the following Postgres tables in `coreSchema`:
 *
 *   partners                — one row per partner org (installer/reseller)
 *   partner_installations   — partner ↔ (org_ref, site_ref) link; the cross-org
 *                             fan-out that powers "all the places I installed"
 *   partner_memberships     — user ↔ partner link (who can sign into the portal)
 *
 * Devices, access events and resources are read from existing refs / audit data
 * filtered through partner_installations, plus a new partner_resources table for
 * co-branded content.
 * -----------------------------------------------------------------------------
 */

/**
 * Partner portal role.
 *
 * Kept separate from `MembershipRole` on purpose — a partner is not a member of
 * any one customer org. This is the single constant the portal gate checks
 * against; real auth wiring plugs in where `isPartnerUser()` is stubbed.
 */
export const PARTNER_ROLE = "partner" as const;
export type PartnerRole = typeof PARTNER_ROLE;

/** Commercial tier — drives portal branding / feature gating later. */
export type PartnerTier = "standard" | "premium" | "enterprise";

/** Health rollup for an installed lock/device. */
export type DeviceHealth = "online" | "offline" | "degraded" | "maintenance";

/** Outcome of an access event at an installed site. */
export type AccessOutcome = "granted" | "denied" | "error";

/** Category for co-branded portal content. */
export type PartnerResourceCategory =
  | "guide"
  | "marketing"
  | "support"
  | "firmware"
  | "announcement";

/**
 * A partner (installer / reseller).
 * Future table: `partners`.
 */
export interface Partner {
  id: string;
  slug: string;
  name: string;
  /** Optional co-branding assets shown in the portal. */
  logoUrl: string | null;
  brandColor: string | null;
  contactEmail: string | null;
  tier: PartnerTier;
}

/**
 * A single place a partner has installed locks. This is the cross-org join:
 * one partner has many installations, each pointing at a customer org + site.
 * Future table: `partner_installations`.
 */
export interface PartnerInstallation {
  id: string;
  partnerId: string;
  /** Customer org that owns the site (references orgRefs). */
  orgRefId: string;
  orgName: string;
  /** Site within the customer org (references siteRefs). */
  siteRefId: string;
  siteName: string;
  /** City / region label for quick scanning. */
  location: string | null;
  installedAt: string;
  deviceCount: number;
  /** How many of this installation's devices are currently healthy. */
  healthyDeviceCount: number;
}

/**
 * A lock/device installed by the partner (a `deviceRefs` row surfaced through a
 * partner_installation, plus health telemetry from the device platform).
 */
export interface PartnerDevice {
  id: string;
  partnerId: string;
  orgRefId: string;
  orgName: string;
  siteRefId: string;
  siteName: string;
  externalDeviceId: string;
  name: string;
  deviceType: string;
  health: DeviceHealth;
  firmwareVersion: string;
  /** Null for mains-powered devices. */
  batteryPercent: number | null;
  lastSeenAt: string;
  installedAt: string;
}

/**
 * An access event at one of the partner's installed sites (sourced from
 * audit_log / device events, scoped by partner_installations).
 */
export interface PartnerAccessEvent {
  id: string;
  partnerId: string;
  orgName: string;
  siteName: string;
  deviceName: string;
  /** e.g. "unlock", "lock", "access_denied", "tamper". */
  eventType: string;
  actorName: string | null;
  outcome: AccessOutcome;
  timestamp: string;
}

/**
 * Co-branded content / info surfaced to the partner.
 * Future table: `partner_resources`.
 */
export interface PartnerResource {
  id: string;
  title: string;
  description: string;
  category: PartnerResourceCategory;
  url: string;
  updatedAt: string;
  /** Whether this item carries the partner's branding. */
  coBranded: boolean;
}

/**
 * Everything the portal needs for a signed-in partner. In production this is
 * assembled by a partner-scoped tRPC context (analogous to OrgScopedContext),
 * resolving the user → partner_membership → partner and its installations.
 */
export interface PartnerContext {
  partner: Partner;
  installations: PartnerInstallation[];
}
