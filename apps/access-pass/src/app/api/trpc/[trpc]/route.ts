import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, type Context } from "@repo/api";
import { createClient } from "@supabase/supabase-js";

/**
 * tRPC API Route Handler for Access Pass Portal
 */
const handler = async (req: Request) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (): Context => {
      // Access-pass is a public portal with no authentication
      // Provide minimal context with null values
      const user = null;

      return {
        supabase,
        user,
        requestId: crypto.randomUUID(),
        // Required Context fields - set to null for public access
        orgRefId: null,
        membership: null,
        memberships: [],
        kindeUser: null,
      };
    },
  });
};

export { handler as GET, handler as POST };
