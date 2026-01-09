/**
 * Auth Middleware - Server-side route protection
 *
 * Protects /dashboard routes.
 * Redirects unauthenticated users to login.
 * Bypasses auth in development when Kinde is not configured.
 */

import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { NextRequest, NextResponse } from "next/server";

// Check if Kinde is properly configured
const isKindeConfigured = () => {
  const issuerUrl = process.env.KINDE_ISSUER_URL;
  return issuerUrl && !issuerUrl.includes("placeholder");
};

export default async function middleware(req: NextRequest) {
  // Skip auth if Kinde is not configured (dev mode without credentials)
  if (!isKindeConfigured()) {
    return NextResponse.next();
  }

  // Use Kinde middleware when configured
  return withAuth(req, {
    isReturnToCurrentPage: true,
  });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
