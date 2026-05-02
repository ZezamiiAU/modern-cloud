import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@repo/api";
import { createClient } from "@supabase/supabase-js";
import { getAuthSession } from "@/lib/auth-session";

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
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  );

  // Get auth session (real Kinde, or mock when MOCK_AUTH=1 and cookie set)
  const { getUser, getAccessTokenRaw } = getAuthSession();
  const rawKindeUser = await getUser();
  const accessToken = await getAccessTokenRaw();

  // Transform to our KindeUser type (handle nullable email)
  const kindeUser = rawKindeUser
    ? {
        id: rawKindeUser.id,
        email: rawKindeUser.email ?? "",
        givenName: rawKindeUser.given_name ?? undefined,
        familyName: rawKindeUser.family_name ?? undefined,
        picture: rawKindeUser.picture ?? undefined,
      }
    : null;

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
