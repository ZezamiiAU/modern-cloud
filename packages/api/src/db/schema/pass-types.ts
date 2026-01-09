/**
 * Pass Types Schema - Site-Specific Pass Configuration
 *
 * PostgreSQL is System of Record for pass types.
 * Each site can configure their own pass types with custom pricing and durations.
 */

import {
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { coreSchema } from "./users";
import { siteRefs } from "./sites";

// =============================================================================
// PASS TYPES (site-specific pass products)
// =============================================================================

export const passTypes = coreSchema.table(
  "pass_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteRefId: uuid("site_ref_id")
      .notNull()
      .references(() => siteRefs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("aud"),
    durationHours: integer("duration_hours").notNull(),
    active: boolean("active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_pass_type_site_name").on(table.siteRefId, table.name),
    index("idx_pass_types_site").on(table.siteRefId),
    index("idx_pass_types_site_active").on(table.siteRefId, table.active),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const passTypesRelations = relations(passTypes, ({ one }) => ({
  site: one(siteRefs, {
    fields: [passTypes.siteRefId],
    references: [siteRefs.id],
  }),
}));
