/**
 * Organizations & Memberships Schema
 *
 * org_refs: References to legacy MSSQL orgs (MSSQL is SoR)
 * memberships: Org-level membership (PostgreSQL is SoR)
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
import { coreSchema, users } from "./users";

// =============================================================================
// ORG REFS (references to legacy MSSQL)
// =============================================================================

export const orgRefs = coreSchema.table(
  "org_refs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalOrgId: text("external_org_id").notNull().unique(),
    slug: text("slug").notNull().unique(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_org_refs_slug").on(table.slug),
    index("idx_org_refs_external").on(table.externalOrgId),
    check("chk_org_slug", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ]
);

// =============================================================================
// MEMBERSHIPS (org-level)
// =============================================================================

export const membershipRoleEnum = ["owner", "global_admin", "global_user", "viewer"] as const;
export type MembershipRole = (typeof membershipRoleEnum)[number];

export const memberships = coreSchema.table(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgRefId: uuid("org_ref_id")
      .notNull()
      .references(() => orgRefs.id, { onDelete: "cascade" }),
    role: text("role").notNull().$type<MembershipRole>(),
    invitedBy: uuid("invited_by").references(() => users.id),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_user_org").on(table.userId, table.orgRefId),
    index("idx_memberships_user").on(table.userId),
    index("idx_memberships_org").on(table.orgRefId),
    index("idx_memberships_role").on(table.orgRefId, table.role),
    check("chk_role", sql`${table.role} IN ('owner', 'global_admin', 'global_user', 'viewer')`),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const orgRefsRelations = relations(orgRefs, ({ many, one }) => ({
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  org: one(orgRefs, {
    fields: [memberships.orgRefId],
    references: [orgRefs.id],
  }),
  inviter: one(users, {
    fields: [memberships.invitedBy],
    references: [users.id],
  }),
}));
