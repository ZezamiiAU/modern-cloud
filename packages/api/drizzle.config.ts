import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit Configuration
 *
 * Uses Supabase PostgreSQL connection.
 * Set DATABASE_URL in .env or environment.
 *
 * Commands:
 *   pnpm db:generate  - Generate migrations from schema changes
 *   pnpm db:migrate   - Apply pending migrations
 *   pnpm db:push      - Push schema directly (dev only)
 *   pnpm db:studio    - Open Drizzle Studio GUI
 */
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Use 'core' schema for our tables
  schemaFilter: ["core", "public"],
  verbose: true,
  strict: true,
});
