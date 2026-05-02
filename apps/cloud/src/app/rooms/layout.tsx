import { getAuthSession } from "@/lib/auth-session";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { HeaderWrapper } from "@/components/header-wrapper";

export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getAuthSession();
  const kindeUser = await getUser();

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
      <SidebarWrapper user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderWrapper user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
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
