/**
 * Sites & Site Memberships Schema
 *
 * site_refs: References to legacy MSSQL sites (MSSQL is SoR)
 * site_memberships: Site-level access (PostgreSQL is SoR)
 */

import {
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { coreSchema } from "./users";
import { orgRefs, memberships } from "./orgs";

// =============================================================================
// SITE REFS (references to legacy MSSQL)
// =============================================================================

export const siteRefs = coreSchema.table(
  "site_refs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgRefId: uuid("org_ref_id")
      .notNull()
      .references(() => orgRefs.id, { onDelete: "cascade" }),
    externalSiteId: text("external_site_id").notNull(),
    slug: text("slug").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_site_external").on(table.orgRefId, table.externalSiteId),
    uniqueIndex("uq_site_slug").on(table.orgRefId, table.slug),
    index("idx_site_refs_org").on(table.orgRefId),
    index("idx_site_refs_slug").on(table.orgRefId, table.slug),
    check("chk_site_slug", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ]
);

// =============================================================================
// SITE MEMBERSHIPS (site-level access)
// =============================================================================

export const siteMembershipRoleEnum = ["site_admin", "site_user", "site_viewer"] as const;
export type SiteMembershipRole = (typeof siteMembershipRoleEnum)[number];

export const siteMemberships = coreSchema.table(
  "site_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    membershipId: uuid("membership_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    siteRefId: uuid("site_ref_id")
      .notNull()
      .references(() => siteRefs.id, { onDelete: "cascade" }),
    role: text("role").notNull().$type<SiteMembershipRole>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_membership_site").on(table.membershipId, table.siteRefId),
    index("idx_site_memberships_membership").on(table.membershipId),
    index("idx_site_memberships_site").on(table.siteRefId),
    check("chk_site_role", sql`${table.role} IN ('site_admin', 'site_user', 'site_viewer')`),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const siteRefsRelations = relations(siteRefs, ({ one, many }) => ({
  org: one(orgRefs, {
    fields: [siteRefs.orgRefId],
    references: [orgRefs.id],
  }),
  siteMemberships: many(siteMemberships),
}));

export const siteMembershipsRelations = relations(siteMemberships, ({ one }) => ({
  membership: one(memberships, {
    fields: [siteMemberships.membershipId],
    references: [memberships.id],
  }),
  site: one(siteRefs, {
    fields: [siteMemberships.siteRefId],
    references: [siteRefs.id],
  }),
}));
