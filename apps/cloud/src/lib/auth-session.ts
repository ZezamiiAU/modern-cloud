/**
 * Auth session helper.
 *
 * Wraps Kinde's getKindeServerSession() so server components and route
 * handlers can call it as before. When MOCK_AUTH=1 and a `mock_auth=1`
 * cookie is set, the helper returns a fixed dev user instead of hitting
 * Kinde — useful for reviewing the portal locally without configured
 * callbacks. Outside of that, it delegates to the real Kinde session.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { cookies } from "next/headers";

export const MOCK_AUTH_COOKIE = "mock_auth";

const MOCK_KINDE_USER = {
  id: "mock-user-001",
  email: "dev@zezamii.local",
  given_name: "Dev",
  family_name: "User",
  picture: null,
};

export function isMockAuthEnabled(): boolean {
  return process.env.MOCK_AUTH === "1";
}

async function isMockSessionActive(): Promise<boolean> {
  if (!isMockAuthEnabled()) return false;
  const store = await cookies();
  return store.get(MOCK_AUTH_COOKIE)?.value === "1";
}

function buildMockJwt(): string {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    sub: MOCK_KINDE_USER.id,
    email: MOCK_KINDE_USER.email,
    given_name: MOCK_KINDE_USER.given_name,
    family_name: MOCK_KINDE_USER.family_name,
    iat: now,
    exp: now + 60 * 60,
    iss: "mock-auth",
    aud: "mock-auth",
  };
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${header}.${payload}.mock`;
}

export function getAuthSession(): ReturnType<typeof getKindeServerSession> {
  const real = getKindeServerSession();
  if (!isMockAuthEnabled()) return real;

  return {
    ...real,
    isAuthenticated: async () => {
      if (await isMockSessionActive()) return true;
      return real.isAuthenticated();
    },
    getUser: async () => {
      if (await isMockSessionActive()) return MOCK_KINDE_USER;
      return real.getUser();
    },
    getAccessToken: async () => {
      if (await isMockSessionActive()) {
        const now = Math.floor(Date.now() / 1000);
        return {
          sub: MOCK_KINDE_USER.id,
          email: MOCK_KINDE_USER.email,
          given_name: MOCK_KINDE_USER.given_name,
          family_name: MOCK_KINDE_USER.family_name,
          iat: now,
          exp: now + 60 * 60,
          iss: "mock-auth",
          aud: "mock-auth",
        };
      }
      return real.getAccessToken();
    },
    getAccessTokenRaw: async () => {
      if (await isMockSessionActive()) return buildMockJwt();
      return real.getAccessTokenRaw();
    },
  } as ReturnType<typeof getKindeServerSession>;
}
