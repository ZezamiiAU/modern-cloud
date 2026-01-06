import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { appRouter, createContext } from "@repo/api";
import { createClient } from "@supabase/supabase-js";

/**
 * tRPC API Route Handler
 *
 * Handles all tRPC requests with proper auth context:
 * - Extracts Kinde session
 * - Resolves PostgreSQL user
 * - Validates org access from x-org-id header
 */
const handler = async (req: Request) => {
  // Create Supabase client with service role
  const supabase = createClient(
    process.env.SUPABASE_URL ?? "http://localhost:54321",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder"
  );

  // Get Kinde session
  const { getUser, getAccessTokenRaw } = getKindeServerSession();
  const kindeUser = await getUser();
  const accessToken = await getAccessTokenRaw();

  // Parse token claims if we have a token
  let tokenClaims = null;
  if (accessToken) {
    try {
      // Decode JWT payload (middle part)
      const payload = accessToken.split(".")[1];
      if (payload) {
        tokenClaims = JSON.parse(atob(payload));
      }
    } catch {
      console.warn("Failed to decode access token");
    }
  }

  // Get org ID from header
  const orgRefId = req.headers.get("x-org-id");

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        supabase,
        kindeUser,
        tokenClaims,
        orgRefId,
        requestId: crypto.randomUUID(),
      }),
  });
};

export { handler as GET, handler as POST };
