import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, type Context } from "@repo/api";
import { createClient } from "@supabase/supabase-js";

/**
 * tRPC API Route Handler
 *
 * All tRPC requests go through here.
 * Context is created per-request with:
 * - Supabase client
 * - User (extracted from auth headers)
 */

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async (): Promise<Context> => {
      // Create Supabase client
      const supabase = createClient(
        process.env.SUPABASE_URL ?? "http://localhost:54321",
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder"
      );

      // TODO: Extract user from Kinde auth
      const user = null;

      return {
        supabase,
        user,
        requestId: crypto.randomUUID(),
      };
    },
  });

export { handler as GET, handler as POST };
