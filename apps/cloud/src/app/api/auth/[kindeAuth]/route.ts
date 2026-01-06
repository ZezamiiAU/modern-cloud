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

export const GET = handleAuth();
