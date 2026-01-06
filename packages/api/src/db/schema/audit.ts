/**
 * Audit & Settings Schema
 *
 * PostgreSQL is System of Record for audit and settings.
 */

import {
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  inet,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { coreSchema, users } from "./users";
import { orgRefs } from "./orgs";

// =============================================================================
// ORG SETTINGS
// =============================================================================

export const orgSettings = coreSchema.table(
  "org_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgRefId: uuid("org_ref_id")
      .notNull()
      .unique()
      .references(() => orgRefs.id, { onDelete: "cascade" }),
    auditRetentionDays: integer("audit_retention_days").default(365),
    timezone: text("timezone").default("UTC"),
    settings: jsonb("settings").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// =============================================================================
// AUDIT LOG
// =============================================================================

export const auditLog = coreSchema.table(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgRefId: uuid("org_ref_id").references(() => orgRefs.id),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    resourceType: text("resource_type"),
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata").default({}),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_log_org_time").on(table.orgRefId, table.createdAt),
    index("idx_audit_log_user").on(table.userId, table.createdAt),
    index("idx_audit_log_resource").on(table.resourceType, table.resourceId),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const orgSettingsRelations = relations(orgSettings, ({ one }) => ({
  org: one(orgRefs, {
    fields: [orgSettings.orgRefId],
    references: [orgRefs.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  org: one(orgRefs, {
    fields: [auditLog.orgRefId],
    references: [orgRefs.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));
