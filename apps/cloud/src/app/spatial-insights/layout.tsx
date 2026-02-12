/**
 * Spatial Insights Layout - Server Component
 *
 * Fetches user from Kinde server-side.
 * Uses standard ZezamiiSidebar and Header for consistent navigation.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { HeaderWrapper } from "@/components/header-wrapper";
import { SiteProviderWrapper } from "./components/site-provider-wrapper";

export default async function SpatialInsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user from Kinde server-side (don't cache - session is per-request)
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  // Transform to serializable user object
  const user = kindeUser
    ? {
        name:
          `${kindeUser.given_name || ""} ${kindeUser.family_name || ""}`.trim() ||
          "User",
        email: kindeUser.email || "",
        initials: getInitials(kindeUser.given_name, kindeUser.family_name),
      }
    : {
        name: "Guest",
        email: "",
        initials: "?",
      };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Zezamii Multi-Product Sidebar */}
      <SidebarWrapper user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Unified Header */}
        <HeaderWrapper user={user} />

        {/* Content with SiteProvider */}
        <SiteProviderWrapper>
          <main className="flex-1 overflow-auto bg-slate-900">
            {children}
          </main>
        </SiteProviderWrapper>
      </div>
    </div>
  );
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "?";
}
