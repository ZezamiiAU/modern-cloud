/**
 * Mock auth route handler.
 *
 * Active when MOCK_AUTH=1. Provides a Kinde-free login/logout flow.
 * Login requires a passcode (MOCK_AUTH_PASSCODE env, defaults to "112233")
 * submitted via POST. A best-effort in-memory IP throttle limits brute force;
 * note that serverless cold starts reset it, so keep the passcode strong.
 *
 * - POST /api/mock-auth/login  (form: passcode) → sets cookie, redirects to /dashboard
 * - GET  /api/mock-auth/logout → clears cookie, redirects to /
 */

import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isMockAuthEnabled, MOCK_AUTH_COOKIE } from "@/lib/auth-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_PASSCODE = "112233";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function passcodeMatches(input: string): boolean {
  const expected = process.env.MOCK_AUTH_PASSCODE || DEFAULT_PASSCODE;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkThrottle(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

function recordFailure(ip: string): void {
  const entry = attempts.get(ip);
  if (entry) entry.count += 1;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ action: string }> },
) {
  if (!isMockAuthEnabled()) {
    return NextResponse.json({ error: "Mock auth disabled" }, { status: 404 });
  }

  const { action } = await ctx.params;
  if (action !== "login") {
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  }

  const ip = clientIp(req);
  const throttle = checkThrottle(ip);
  if (!throttle.ok) {
    return NextResponse.redirect(new URL("/?mock_error=throttled", req.url));
  }

  const form = await req.formData().catch(() => null);
  const passcode = String(form?.get("passcode") ?? "");

  if (!passcode || !passcodeMatches(passcode)) {
    recordFailure(ip);
    return NextResponse.redirect(new URL("/?mock_error=invalid", req.url));
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set(MOCK_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ action: string }> },
) {
  if (!isMockAuthEnabled()) {
    return NextResponse.json({ error: "Mock auth disabled" }, { status: 404 });
  }

  const { action } = await ctx.params;
  if (action === "logout") {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete(MOCK_AUTH_COOKIE);
    return res;
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
