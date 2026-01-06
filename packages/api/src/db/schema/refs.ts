/**
 * Reference Tables Schema
 *
 * building_refs, device_refs: References to legacy MSSQL (MSSQL is SoR)
 * slug_history: Redirect support for changed slugs (PostgreSQL is SoR)
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
import { orgRefs } from "./orgs";
import { siteRefs } from "./sites";

// =============================================================================
// BUILDING REFS (references to legacy MSSQL)
// =============================================================================

export const buildingRefs = coreSchema.table(
  "building_refs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteRefId: uuid("site_ref_id")
      .notNull()
      .references(() => siteRefs.id, { onDelete: "cascade" }),
    externalBuildingId: text("external_building_id").notNull(),
    slug: text("slug").notNull(),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_building_external").on(table.siteRefId, table.externalBuildingId),
    uniqueIndex("uq_building_slug").on(table.siteRefId, table.slug),
    index("idx_building_refs_site").on(table.siteRefId),
    check("chk_building_slug", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ]
);

// =============================================================================
// DEVICE REFS (references to legacy MSSQL)
// =============================================================================

export const deviceRefs = coreSchema.table(
  "device_refs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgRefId: uuid("org_ref_id")
      .notNull()
      .references(() => orgRefs.id, { onDelete: "cascade" }),
    siteRefId: uuid("site_ref_id").references(() => siteRefs.id),
    externalDeviceId: text("external_device_id").notNull(),
    slug: text("slug").notNull(),
    deviceType: text("device_type"),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_device_external").on(table.orgRefId, table.externalDeviceId),
    uniqueIndex("uq_device_slug").on(table.orgRefId, table.slug),
    index("idx_device_refs_org").on(table.orgRefId),
    index("idx_device_refs_site").on(table.siteRefId),
    index("idx_device_refs_type").on(table.orgRefId, table.deviceType),
    check("chk_device_slug", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ]
);

// =============================================================================
// SLUG HISTORY (redirect support)
// =============================================================================

export const slugEntityTypeEnum = ["org", "site", "building", "device"] as const;
export type SlugEntityType = (typeof slugEntityTypeEnum)[number];

export const slugHistory = coreSchema.table(
  "slug_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull().$type<SlugEntityType>(),
    entityId: uuid("entity_id").notNull(),
    oldSlug: text("old_slug").notNull(),
    parentId: uuid("parent_id"),
    changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_slug_history_lookup").on(table.entityType, table.oldSlug, table.parentId),
    check("chk_entity_type", sql`${table.entityType} IN ('org', 'site', 'building', 'device')`),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const buildingRefsRelations = relations(buildingRefs, ({ one }) => ({
  site: one(siteRefs, {
    fields: [buildingRefs.siteRefId],
    references: [siteRefs.id],
  }),
}));

export const deviceRefsRelations = relations(deviceRefs, ({ one }) => ({
  org: one(orgRefs, {
    fields: [deviceRefs.orgRefId],
    references: [orgRefs.id],
  }),
  site: one(siteRefs, {
    fields: [deviceRefs.siteRefId],
    references: [siteRefs.id],
  }),
}));
