"use client";

import { ZezamiiSidebar } from "@repo/ui";
import { useRouter } from "next/navigation";

interface SidebarWrapperProps {
  user: {
    name: string;
    email: string;
    initials?: string;
  };
}

export function SidebarWrapper({ user }: SidebarWrapperProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Redirect to Kinde logout endpoint
    router.push("/api/auth/logout");
  };

  return <ZezamiiSidebar user={user} onLogout={handleLogout} />;
}
