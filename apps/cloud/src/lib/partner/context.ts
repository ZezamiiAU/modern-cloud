/**
 * Partner Portal — Access Gate (stub)
 *
 * Single place the portal decides whether the current user is a partner and,
 * if so, which partner + installations they can see. Today this is backed by
 * mock data; when the migration lands, replace the body of `getPartnerContext`
 * with a partner-scoped tRPC call (resolve user → partner_membership → partner
 * + partner_installations) and have `isPartnerUser` read the resolved role.
 */

import type { PartnerContext } from "@repo/api";
import { getAuthSession } from "@/lib/auth-session";
import { mockPartner, mockInstallations } from "./mock-data";

/**
 * Whether the signed-in user should be allowed into the partner portal.
 *
 * SCAFFOLD: returns true whenever there is a session so the portal is
 * reviewable. The real check compares the resolved partner role against
 * `PARTNER_ROLE` from `@repo/api`.
 */
export async function isPartnerUser(): Promise<boolean> {
  const { getUser } = getAuthSession();
  const user = await getUser();
  return Boolean(user);
}

/**
 * Resolve the partner context for the current request, or null if the user is
 * not a partner. Consumed by the partner portal layout/pages.
 */
export async function getPartnerContext(): Promise<PartnerContext | null> {
  if (!(await isPartnerUser())) return null;

  // SCAFFOLD: static mock. Real implementation resolves the user's partner and
  // its cross-org installations from the backend.
  return {
    partner: mockPartner,
    installations: mockInstallations,
  };
}
