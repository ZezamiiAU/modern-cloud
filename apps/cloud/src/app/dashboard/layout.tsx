/**
 * Dashboard Layout - Server Component
 *
 * Fetches user from Kinde server-side.
 * Passes serializable config to PageShell.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PageShell, type NavItem } from "@repo/ui";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/sites", label: "Sites", icon: "building" },
  { href: "/dashboard/spaces", label: "Spaces", icon: "grid" },
  { href: "/dashboard/devices", label: "Devices", icon: "cpu" },
  { href: "/dashboard/people", label: "People", icon: "users" },
  { href: "/dashboard/passes", label: "Access / Passes", icon: "key" },
  { href: "/dashboard/events", label: "Events / Audit", icon: "activity" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user from Kinde server-side
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

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
    <PageShell
      title="Zezamii"
      subtitle="Admin Portal"
      navItems={navItems}
      user={user}
    >
      {children}
    </PageShell>
  );
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";
  return first + last || "?";
}
