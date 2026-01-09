/**
 * Users & Identity Schema
 *
 * PostgreSQL is System of Record for users.
 * Supports multiple identity providers (Kinde, Firebase, Google, etc.)
 */

import {
  pgSchema,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Use 'core' schema for all tables
export const coreSchema = pgSchema("core");

// =============================================================================
// USERS
// =============================================================================

export const users = coreSchema.table(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    primaryEmail: text("primary_email").notNull(),
    name: text("name"),
    pictureUrl: text("picture_url"),
    emailVerified: boolean("email_verified").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_users_email").on(table.primaryEmail),
    index("idx_users_deleted").on(table.deletedAt),
  ]
);

// =============================================================================
// USER IDENTITIES (multiple IdPs per user)
// =============================================================================

export const userIdentities = coreSchema.table(
  "user_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'kinde', 'firebase', 'google', 'microsoft'
    providerUserId: text("provider_user_id").notNull(),
    email: text("email"),
    metadata: jsonb("metadata").default({}),
    isPrimary: boolean("is_primary").default(false),
    linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_identity_provider").on(table.provider, table.providerUserId),
    index("idx_user_identities_user").on(table.userId),
    index("idx_user_identities_provider").on(table.provider, table.providerUserId),
  ]
);

// =============================================================================
// RELATIONS
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  identities: many(userIdentities),
}));

export const userIdentitiesRelations = relations(userIdentities, ({ one }) => ({
  user: one(users, {
    fields: [userIdentities.userId],
    references: [users.id],
  }),
}));

