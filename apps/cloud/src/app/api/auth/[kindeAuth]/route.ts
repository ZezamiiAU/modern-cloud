/**
 * Kinde Auth Route Handler
 *
 * Handles all Kinde auth callbacks:
 * - /api/auth/login
 * - /api/auth/logout
 * - /api/auth/callback
 * - /api/auth/register
 */

import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const authHandler = handleAuth();

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ kindeAuth: string }> },
) {
  const { kindeAuth } = await ctx.params;
  console.log("[kinde-debug] route:", kindeAuth);
  console.log("[kinde-debug] full url:", req.url);
  console.log("[kinde-debug] search:", req.nextUrl.search);
  console.log(
    "[kinde-debug] state param:",
    req.nextUrl.searchParams.get("state"),
  );
  console.log(
    "[kinde-debug] code param:",
    req.nextUrl.searchParams.get("code"),
  );
  return authHandler(req, ctx);
}
