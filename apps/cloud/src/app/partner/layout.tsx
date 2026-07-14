import { getAuthSession } from "@/lib/auth-session";
import { getPartnerContext } from "@/lib/partner/context";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { HeaderWrapper } from "@/components/header-wrapper";
import { ShieldAlert } from "lucide-react";

export default async function PartnerLayout({
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

  // Role gate — only partners may see the portal. Stubbed today (see
  // lib/partner/context.ts); this is where the real partner-role check lives.
  const partnerContext = await getPartnerContext();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarWrapper user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderWrapper user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {partnerContext ? children : <NotAPartner />}
        </main>
      </div>
    </div>
  );
}

function NotAPartner() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-sky-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Partner access required
        </h1>
        <p className="text-gray-600">
          This area is reserved for Zezamii installation partners. If you
          believe you should have access, contact your Zezamii account manager.
        </p>
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
