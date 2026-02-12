"use client";

import * as React from "react";
import { ZezamiiHeader } from "@repo/ui";
import { usePathname } from "next/navigation";

interface HeaderWrapperProps {
  user: {
    name: string;
    email: string;
    initials?: string;
  };
}

export const HeaderWrapper = React.memo(function HeaderWrapper({ user }: HeaderWrapperProps) {
  const pathname = usePathname();

  // Memoize breadcrumbs based on pathname
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Cloud", href: "/dashboard" }];

    if (segments.includes("people")) {
      crumbs.push({ label: "People", href: "/dashboard/people" });
    } else if (segments.includes("spatial-insights")) {
      crumbs.push({ label: "Spatial Insights", href: "/spatial-insights" });
    } else if (segments.includes("spaces")) {
      crumbs.push({ label: "Spaces", href: "/spaces" });
    } else if (segments.includes("access")) {
      crumbs.push({ label: "Access", href: "/access" });
    } else if (segments.includes("sites")) {
      crumbs.push({ label: "Sites", href: "/spaces/sites" });
    } else if (segments.includes("devices")) {
      crumbs.push({ label: "Devices", href: "/spaces/devices" });
    } else if (segments.includes("floorplan")) {
      crumbs.push({ label: "Floor Plan", href: "/spaces/floorplan" });
    }

    return crumbs;
  }, [pathname]);

  const handleSearch = React.useCallback((query: string) => {
    console.log("Search query:", query);
  }, []);

  const handleOrganizationChange = React.useCallback(() => {
    console.log("Organization change");
  }, []);

  return (
    <ZezamiiHeader
      breadcrumbs={breadcrumbs}
      onSearch={handleSearch}
      organizationName="Zezamii"
      userName={user.name}
      onOrganizationChange={handleOrganizationChange}
    />
  );
});
