"use client";

import * as React from "react";
import { ZezamiiSidebar } from "@repo/ui";
import { useRouter } from "next/navigation";

interface SidebarWrapperProps {
  user: {
    name: string;
    email: string;
    initials?: string;
  };
}

export const SidebarWrapper = React.memo(function SidebarWrapper({
  user,
}: SidebarWrapperProps) {
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    const mockEnabled = process.env.NEXT_PUBLIC_MOCK_AUTH === "1";
    router.push(mockEnabled ? "/api/mock-auth/logout" : "/api/auth/logout");
  }, [router]);

  return <ZezamiiSidebar user={user} onLogout={handleLogout} />;
});
