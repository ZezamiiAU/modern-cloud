/**
 * Passes Schema - NEW CAPABILITY
 *
 * PostgreSQL is System of Record for passes.
 * This is a new feature not in legacy MSSQL.
 */

import {
  uuid,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { coreSchema, users } from "./users";
import { orgRefs } from "./orgs";
import { siteRefs } from "./sites";
import { deviceRefs } from "./refs";

// =============================================================================
// PASS TYPES
// =============================================================================

export const passTypeEnum = ["visitor", "contractor", "delivery", "event"] as const;
export type PassType = (typeof passTypeEnum)[number];

export const passStatusEnum = ["pending", "active", "expired", "revoked"] as const;
export type PassStatus = (typeof passStatusEnum)[number];

export const passEventTypeEnum = ["scanned", "entry", "exit", "denied"] as const;
export type PassEventType = (typeof passEventTypeEnum)[number];

// =============================================================================
// PASSES
// =============================================================================

export const passes = coreSchema.table(
  "passes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgRefId: uuid("org_ref_id")
      .notNull()
      .references(() => orgRefs.id, { onDelete: "cascade" }),
    siteRefId: uuid("site_ref_id").references(() => siteRefs.id),
    userId: uuid("user_id").references(() => users.id),
    code: text("code").notNull(),
    passType: text("pass_type").notNull().$type<PassType>(),
    status: text("status").notNull().default("pending").$type<PassStatus>(),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    visitorName: text("visitor_name"),
    visitorEmail: text("visitor_email"),
    hostUserId: uuid("host_user_id").references(() => users.id),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_pass_code").on(table.orgRefId, table.code),
    index("idx_passes_org").on(table.orgRefId),
    index("idx_passes_org_status").on(table.orgRefId, table.status),
    index("idx_passes_org_valid").on(table.orgRefId, table.status, table.validTo),
    index("idx_passes_site").on(table.siteRefId),
    index("idx_passes_user").on(table.userId),
    index("idx_passes_code").on(table.orgRefId, table.code),
    check("chk_pass_type", sql`${table.passType} IN ('visitor', 'contractor', 'delivery', 'event')`),
    check("chk_pass_status", sql`${table.status} IN ('pending', 'active', 'expired', 'revoked')`),
  ]
);

// =============================================================================
// PASS EVENTS
// =============================================================================

export const passEvents = coreSchema.table(
  "pass_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    passId: uuid("pass_id")
      .notNull()
      .references(() => passes.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull().$type<PassEventType>(),
    deviceRefId: uuid("device_ref_id").references(() => deviceRefs.id),
    location: jsonb("location"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_pass_events_pass").on(table.passId, table.createdAt),
    index("idx_pass_events_device").on(table.deviceRefId, table.createdAt),
    check("chk_event_type", sql`${table.eventType} IN ('scanned', 'entry', 'exit', 'denied')`),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const passesRelations = relations(passes, ({ one, many }) => ({
  org: one(orgRefs, {
    fields: [passes.orgRefId],
    references: [orgRefs.id],
  }),
  site: one(siteRefs, {
    fields: [passes.siteRefId],
    references: [siteRefs.id],
  }),
  user: one(users, {
    fields: [passes.userId],
    references: [users.id],
  }),
  host: one(users, {
    fields: [passes.hostUserId],
    references: [users.id],
  }),
  events: many(passEvents),
}));

export const passEventsRelations = relations(passEvents, ({ one }) => ({
  pass: one(passes, {
    fields: [passEvents.passId],
    references: [passes.id],
  }),
  device: one(deviceRefs, {
    fields: [passEvents.deviceRefId],
    references: [deviceRefs.id],
  }),
}));
