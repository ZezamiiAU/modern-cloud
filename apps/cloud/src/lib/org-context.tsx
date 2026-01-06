"use client";

/**
 * Organization Context
 *
 * Manages the current org selection for multi-org users.
 * Stores selection in a cookie and includes x-org-id header in tRPC calls.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { VMembership } from "@repo/api";

const ORG_COOKIE_NAME = "selected_org";

export interface OrgContextValue {
  /** Current org ref ID */
  currentOrgId: string | null;
  /** Current org membership (includes role, org details) */
  currentOrg: VMembership | null;
  /** All user's org memberships */
  memberships: VMembership[];
  /** Switch to a different org */
  switchOrg: (orgRefId: string) => void;
  /** Whether user has multiple orgs */
  hasMultipleOrgs: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export interface OrgProviderProps {
  children: ReactNode;
  /** User's org memberships (from server) */
  memberships: VMembership[];
  /** Initial org ID (from cookie/header) */
  initialOrgId?: string | null;
}

/**
 * Provider for org context
 *
 * Wrap this around your dashboard layout to enable org switching.
 *
 * @example
 * ```tsx
 * // In dashboard/layout.tsx (server component)
 * const memberships = await getUserMemberships(userId);
 * const initialOrgId = cookies().get('selected_org')?.value;
 *
 * return (
 *   <OrgProvider memberships={memberships} initialOrgId={initialOrgId}>
 *     {children}
 *   </OrgProvider>
 * );
 * ```
 */
export function OrgProvider({
  children,
  memberships,
  initialOrgId,
}: OrgProviderProps) {
  // Determine initial org: from cookie, or first membership
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(() => {
    // If we have an initial org ID and it's valid, use it
    if (initialOrgId && memberships.some((m) => m.org_ref_id === initialOrgId)) {
      return initialOrgId;
    }
    // Otherwise use first membership
    return memberships[0]?.org_ref_id || null;
  });

  const currentOrg = memberships.find((m) => m.org_ref_id === currentOrgId) || null;
  const hasMultipleOrgs = memberships.length > 1;

  const switchOrg = useCallback((orgRefId: string) => {
    // Validate org is in memberships
    if (!memberships.some((m) => m.org_ref_id === orgRefId)) {
      console.warn(`Cannot switch to org ${orgRefId}: not a member`);
      return;
    }

    // Update state
    setCurrentOrgId(orgRefId);

    // Persist to cookie
    document.cookie = `${ORG_COOKIE_NAME}=${orgRefId}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Refresh the page to reload server components with new org context
    // This ensures all server-side data is fetched for the new org
    window.location.reload();
  }, [memberships]);

  // Sync cookie on mount if state differs
  useEffect(() => {
    if (currentOrgId) {
      document.cookie = `${ORG_COOKIE_NAME}=${currentOrgId}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
  }, [currentOrgId]);

  return (
    <OrgContext.Provider
      value={{
        currentOrgId,
        currentOrg,
        memberships,
        switchOrg,
        hasMultipleOrgs,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

/**
 * Hook to access org context
 *
 * @example
 * ```tsx
 * function OrgSwitcher() {
 *   const { currentOrg, memberships, switchOrg, hasMultipleOrgs } = useOrg();
 *
 *   if (!hasMultipleOrgs) return null;
 *
 *   return (
 *     <select value={currentOrg?.org_ref_id} onChange={(e) => switchOrg(e.target.value)}>
 *       {memberships.map((m) => (
 *         <option key={m.org_ref_id} value={m.org_ref_id}>
 *           {m.org_display_name || m.org_slug}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useOrg(): OrgContextValue {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }

  return context;
}

/**
 * Get current org ID from cookie (for use in tRPC headers)
 */
export function getSelectedOrgId(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`${ORG_COOKIE_NAME}=([^;]+)`));
  return match?.[1] || null;
}
