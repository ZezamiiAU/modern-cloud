"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo, memo } from "react";
import { Building2, Wifi, WifiOff, MapPin, ChevronDown, Layers } from "lucide-react";
import { cn, IntelligenceBar, type IntelligenceMetric } from "@repo/ui";
import { useSiteContext } from "@/contexts/site-context";

// Tab configuration - static, defined outside component
const tabs = [
  { id: "sites", label: "Sites", href: "/spaces/sites" },
  { id: "floorplan", label: "Floor Plan", href: "/spaces/floorplan" },
  { id: "devices", label: "Devices", href: "/spaces/devices" },
] as const;

// Memoized Tab component to prevent re-renders
const TabLink = memo(function TabLink({
  tab,
  isActive
}: {
  tab: typeof tabs[number];
  isActive: boolean;
}) {
  return (
    <Link
      href={tab.href}
      className={cn(
        "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
        isActive
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
      )}
    >
      {tab.label}
    </Link>
  );
});

// Memoized Site Button component
const SiteButton = memo(function SiteButton({
  site,
  isSelected,
  onSelect,
}: {
  site: { id: string; name: string; status: string; region: string };
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(site.id)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
        isSelected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          site.status === "online" ? "bg-green-500" : site.status === "offline" ? "bg-red-500" : "bg-yellow-500"
        )}
      />
      <span className="flex-1 text-left truncate">{site.name}</span>
      <span className="text-xs text-gray-400">{site.region}</span>
    </button>
  );
});

export function SpacesContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sites, selectedSiteId, selectedSite, selectSite, getMetricsForSite } = useSiteContext();

  // Determine active tab from pathname
  const activeTab = useMemo(() => {
    if (pathname.includes("/floorplan")) return "floorplan";
    if (pathname.includes("/devices")) return "devices";
    return "sites";
  }, [pathname]);

  // Get metrics for the selected site (or all sites if none selected)
  const metrics = useMemo(() => {
    const m = getMetricsForSite(selectedSiteId);
    const sitesOnline = sites.filter((s) => s.status === "online").length;

    const baseMetrics: IntelligenceMetric[] = [
      {
        id: "sites-online",
        label: selectedSiteId ? "Site Status" : "Sites Online",
        value: selectedSiteId ? (selectedSite?.status === "online" ? "Online" : "Offline") : sitesOnline,
        icon: Building2,
        iconColor: selectedSite?.status === "offline" ? "text-red-500" : "text-green-500",
      },
      {
        id: "devices-online",
        label: "Devices Online",
        value: m.onlineDevices,
        icon: Wifi,
        iconColor: "text-blue-500",
      },
      {
        id: "devices-offline",
        label: "Devices Offline",
        value: m.offlineDevices,
        icon: WifiOff,
        iconColor: m.offlineDevices > 0 ? "text-red-500" : "text-gray-400",
      },
    ];

    // Add unplaced devices metric if there are any
    if (m.unplacedDevices > 0) {
      baseMetrics.push({
        id: "unplaced-devices",
        label: "Unplaced Devices",
        value: m.unplacedDevices,
        icon: Layers,
        iconColor: "text-orange-500",
      });
    }

    return baseMetrics;
  }, [selectedSiteId, selectedSite, sites, getMetricsForSite]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-[1600px] mx-auto">
        {/* Site Breadcrumb / Selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/spaces/sites" className="text-gray-500 hover:text-gray-700">
              Infrastructure
            </Link>
            <span className="text-gray-400">/</span>
            <div className="relative group">
              <button className="flex items-center gap-1 font-medium text-gray-900 hover:text-indigo-600">
                {selectedSite ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    {selectedSite.name}
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    All Sites
                  </>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Site Dropdown */}
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 hidden group-hover:block">
                <div className="p-2">
                  <button
                    onClick={() => selectSite(null)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      !selectedSiteId ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"
                    )}
                  >
                    <Building2 className="w-4 h-4" />
                    All Sites
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  {sites.map((site) => (
                    <SiteButton
                      key={site.id}
                      site={site}
                      isSelected={selectedSiteId === site.id}
                      onSelect={selectSite}
                    />
                  ))}
                </div>
              </div>
            </div>
            {selectedSite && (
              <>
                <span className="text-gray-400">-</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedSite.address}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Intelligence Bar */}
        <IntelligenceBar metrics={metrics} actions={[]} />

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <TabLink key={tab.id} tab={tab} isActive={activeTab === tab.id} />
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
