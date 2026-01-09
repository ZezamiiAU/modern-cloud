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

export default async function VisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const kindeUser = await getCachedUser();

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
      <SidebarWrapper user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderWrapper user={user} />
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
