/**
 * Spaces Layout - Server Component
 *
 * Fetches user from Kinde server-side.
 * Uses ZezamiiSidebar for multi-product navigation.
 */

import { getAuthSession } from "@/lib/auth-session";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { HeaderWrapper } from "@/components/header-wrapper";
import { SiteProvider } from "@/contexts/site-context";
import { SpacesContent } from "./spaces-content";

export default async function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getAuthSession();
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Zezamii Multi-Product Sidebar */}
      <SidebarWrapper user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Unified Header */}
        <HeaderWrapper user={user} />

        {/* Content with Site Context */}
        <main className="flex-1 overflow-auto">
          <SiteProvider>
            <SpacesContent>{children}</SpacesContent>
          </SiteProvider>
        </main>
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
