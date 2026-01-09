"use client";

import { ZezamiiHeader, type HealthPill } from "@repo/ui";
import { usePathname } from "next/navigation";

interface HeaderWrapperProps {
  user: {
    name: string;
    email: string;
    initials?: string;
  };
}

export function HeaderWrapper({ user }: HeaderWrapperProps) {
  const pathname = usePathname();

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { label: "Cloud", href: "/dashboard" },
    ];

    if (segments.includes("people")) {
      breadcrumbs.push({ label: "People" });
    } else if (segments.includes("spaces")) {
      breadcrumbs.push({ label: "Spaces" });
    } else if (segments.includes("access")) {
      breadcrumbs.push({ label: "Access" });
    }

    return breadcrumbs;
  };

  // Health Pills - These would come from your API/state management
  const healthPills: HealthPill[] = [
    {
      id: "sites",
      label: "Sites",
      value: "12 Online",
      status: "online",
    },
    {
      id: "events",
      label: "Events",
      value: "247",
      status: "active",
      trend: "up",
    },
    {
      id: "alerts",
      label: "Alerts",
      value: "2 Active",
      status: "error",
    },
  ];

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // Implement global search functionality
  };

  const handleOrganizationChange = () => {
    console.log("Organization change");
    // Implement organization switching
  };

  return (
    <ZezamiiHeader
      breadcrumbs={generateBreadcrumbs()}
      healthPills={healthPills}
      onSearch={handleSearch}
      organizationName="Zezamii"
      userName={user.name}
      onOrganizationChange={handleOrganizationChange}
    />
  );
}
