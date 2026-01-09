/**
 * Dashboard Layout - Server Component
 *
 * Fetches user from Kinde server-side.
 * Uses new ZezamiiSidebar for multi-product navigation.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { HeaderWrapper } from "@/components/header-wrapper";
import { unstable_cache } from "next/cache";

// Cache user session for 60 seconds to speed up navigation
const getCachedUser = unstable_cache(
  async () => {
    const { getUser } = getKindeServerSession();
    return await getUser();
  },
  ["user-session"],
  { revalidate: 60 }
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user from Kinde server-side
  const kindeUser = await getCachedUser();

  // Transform to serializable user object
  const user = kindeUser
    ? {
        name: `${kindeUser.given_name || ""} ${kindeUser.family_name || ""}`.trim() || "User",
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

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "?";
}
