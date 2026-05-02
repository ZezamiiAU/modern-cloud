/**
 * Auth Middleware - Server-side route protection
 *
 * Protects /dashboard routes.
 * Redirects unauthenticated users to login.
 * Bypasses auth in development when Kinde is not configured.
 */

import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";

type KindeMiddleware = (
  req: NextRequest,
  evt: NextFetchEvent,
) => Promise<NextResponse>;

const kindeMiddleware = withAuth(async function middleware() {}, {
  publicPaths: ["/"],
}) as unknown as KindeMiddleware;

export default async function middleware(
  req: NextRequest,
  evt: NextFetchEvent,
) {
  if (process.env.MOCK_AUTH === "1") {
    return NextResponse.next();
  }
  return kindeMiddleware(req, evt);
}

export const config = {
  matcher: [
    "/((?!_next|api/auth|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
