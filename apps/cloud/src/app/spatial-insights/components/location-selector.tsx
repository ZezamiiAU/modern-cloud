"use client";

import { memo, useMemo } from "react";
import { ChevronDown, MapPin, Building2, Layers } from "lucide-react";
import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { useSiteContext } from "@/contexts/site-context";

interface LocationSelectorProps {
  className?: string;
}

export const LocationSelector = memo(function LocationSelector({
  className,
}: LocationSelectorProps) {
  const {
    sites,
    zones,
    selectedSiteId,
    selectedZoneId,
    selectSite,
    selectZone,
  } = useSiteContext();

  // Get buildings for selected site
  const buildings = useMemo(() => {
    if (!selectedSiteId) return [];
    return zones.filter(
      (z) =>
        z.siteId === selectedSiteId && z.type === "building" && !z.isDefault,
    );
  }, [zones, selectedSiteId]);

  // Get the selected building (either directly selected or parent of selected zone)
  const selectedBuildingId = useMemo(() => {
    if (!selectedZoneId) return null;
    const selectedZone = zones.find((z) => z.id === selectedZoneId);
    if (!selectedZone) return null;
    if (selectedZone.type === "building") return selectedZone.id;
    // Find parent building
    let current = selectedZone;
    while (current.parentId) {
      const parent = zones.find((z) => z.id === current.parentId);
      if (!parent) break;
      if (parent.type === "building") return parent.id;
      current = parent;
    }
    return null;
  }, [zones, selectedZoneId]);

  // Get floors for selected building
  const floors = useMemo(() => {
    if (!selectedBuildingId) return [];
    return zones.filter(
      (z) =>
        z.parentId === selectedBuildingId && z.type === "floor" && !z.isDefault,
    );
  }, [zones, selectedBuildingId]);

  // Get selected floor ID
  const selectedFloorId = useMemo(() => {
    if (!selectedZoneId) return null;
    const selectedZone = zones.find((z) => z.id === selectedZoneId);
    if (!selectedZone) return null;
    if (selectedZone.type === "floor") return selectedZone.id;
    // Find parent floor
    let current = selectedZone;
    while (current.parentId) {
      const parent = zones.find((z) => z.id === current.parentId);
      if (!parent) break;
      if (parent.type === "floor") return parent.id;
      current = parent;
    }
    return null;
  }, [zones, selectedZoneId]);

  const handleSiteChange = (siteId: string) => {
    selectSite(siteId);
  };

  const handleBuildingChange = (buildingId: string) => {
    selectZone(buildingId);
  };

  const handleFloorChange = (floorId: string) => {
    selectZone(floorId);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Site Selector */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-400" />
        <Select value={selectedSiteId || ""} onValueChange={handleSiteChange}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-100 focus:ring-cyan-500">
            <SelectValue placeholder="Select Site" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {sites.map((site) => (
              <SelectItem
                key={site.id}
                value={site.id}
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      site.status === "online"
                        ? "bg-green-500"
                        : site.status === "maintenance"
                          ? "bg-yellow-500"
                          : "bg-red-500",
                    )}
                  />
                  {site.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <ChevronDown className="w-4 h-4 text-slate-600 rotate-[-90deg]" />

      {/* Building Selector */}
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-slate-400" />
        <Select
          value={selectedBuildingId || ""}
          onValueChange={handleBuildingChange}
          disabled={!selectedSiteId || buildings.length === 0}
        >
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-100 focus:ring-cyan-500 disabled:opacity-50">
            <SelectValue
              placeholder={
                selectedSiteId ? "Select Building" : "Select a site first"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {buildings.map((building) => (
              <SelectItem
                key={building.id}
                value={building.id}
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
              >
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <ChevronDown className="w-4 h-4 text-slate-600 rotate-[-90deg]" />

      {/* Floor Selector */}
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-400" />
        <Select
          value={selectedFloorId || ""}
          onValueChange={handleFloorChange}
          disabled={!selectedBuildingId || floors.length === 0}
        >
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-100 focus:ring-cyan-500 disabled:opacity-50">
            <SelectValue
              placeholder={
                selectedBuildingId ? "Select Floor" : "Select a building first"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {floors.map((floor) => (
              <SelectItem
                key={floor.id}
                value={floor.id}
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-100"
              >
                {floor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
