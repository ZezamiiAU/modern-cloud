"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Layers,
  Lock,
  Radio,
  Router,
  Gauge,
  Cpu,
  Camera,
  GripVertical,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Check,
} from "lucide-react";
import { cn, Button } from "@repo/ui";
import { useSiteContext, type Device, type Zone, ZONE_TYPE_LABELS } from "@/contexts/site-context";

const deviceTypeIcons: Record<Device["type"], React.ComponentType<{ className?: string }>> = {
  "digital-lock": Lock,
  "access-reader": Radio,
  gateway: Router,
  sensor: Gauge,
  controller: Cpu,
  camera: Camera,
};

const deviceTypeLabels: Record<Device["type"], string> = {
  "digital-lock": "Digital Lock",
  "access-reader": "Access Reader",
  gateway: "Gateway",
  sensor: "Sensor",
  controller: "Controller",
  camera: "Camera",
};

function DeviceTypeIcon({ type, className }: { type: Device["type"]; className?: string }) {
  const Icon = deviceTypeIcons[type];
  return <Icon className={className} />;
}

// Recursive ZoneCard component for hierarchical display
interface ZoneCardProps {
  zone: Zone;
  depth: number;
  allDevices: Device[];
  getChildZones: (zoneId: string) => Zone[];
  expandedZones: Set<string>;
  toggleZoneExpansion: (zoneId: string) => void;
  selectedZoneId: string | null;
  setSelectedZoneId: (zoneId: string | null) => void;
  dragOverZoneId: string | null;
  handleDragOver: (e: React.DragEvent, zoneId: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, zoneId: string) => void;
  handleDragStart: (e: React.DragEvent, deviceId: string) => void;
  handleDragEnd: () => void;
  selectDevice: (deviceId: string | null) => void;
  recentlyDropped: string | null;
}

function ZoneCard({
  zone,
  depth,
  allDevices,
  getChildZones,
  expandedZones,
  toggleZoneExpansion,
  selectedZoneId,
  setSelectedZoneId,
  dragOverZoneId,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragStart,
  handleDragEnd,
  selectDevice,
  recentlyDropped,
}: ZoneCardProps) {
  const childZones = getChildZones(zone.id);
  const hasChildren = childZones.length > 0;
  const isExpanded = expandedZones.has(zone.id);
  const zoneDevices = allDevices.filter((d) => d.zoneId === zone.id);
  const isSelected = selectedZoneId === zone.id;
  const isDragOver = dragOverZoneId === zone.id;

  // Depth-based styling
  const depthColors = [
    { border: "border-indigo-300", bg: "bg-indigo-50", header: "bg-indigo-100" },
    { border: "border-blue-300", bg: "bg-blue-50", header: "bg-blue-100" },
    { border: "border-teal-300", bg: "bg-teal-50", header: "bg-teal-100" },
    { border: "border-purple-300", bg: "bg-purple-50", header: "bg-purple-100" },
    { border: "border-pink-300", bg: "bg-pink-50", header: "bg-pink-100" },
  ] as const;
  const depthStyle = depthColors[depth % depthColors.length] ?? depthColors[0];

  return (
    <div
      className={cn(
        "border-2 rounded-lg transition-all",
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200"
          : isDragOver
          ? "border-green-500 bg-green-50 shadow-lg"
          : depthStyle.border,
        zone.color && !isSelected && !isDragOver ? "" : ""
      )}
      style={zone.color && !isSelected && !isDragOver ? { borderColor: zone.color } : undefined}
    >
      {/* Zone Header */}
      <div
        onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
        onDragOver={(e) => handleDragOver(e, zone.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, zone.id)}
        className={cn(
          "px-4 py-3 flex items-center justify-between cursor-pointer rounded-t-lg",
          isSelected ? "bg-indigo-100" : isDragOver ? "bg-green-100" : depthStyle.header
        )}
        style={zone.color && !isSelected && !isDragOver ? { backgroundColor: `${zone.color}20` } : undefined}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleZoneExpansion(zone.id);
              }}
              className="p-0.5 hover:bg-white/50 rounded"
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
          <h4 className="font-medium text-sm">{zone.name}</h4>
          {zone.description && (
            <span className="text-xs text-muted-foreground">- {zone.description}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-white/50 rounded">
            {ZONE_TYPE_LABELS[zone.type]}
          </span>
          {zoneDevices.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {zoneDevices.length} device{zoneDevices.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Zone Content */}
      <div
        className={cn(
          "p-4",
          isDragOver ? "bg-green-50/50" : depthStyle.bg
        )}
        onDragOver={(e) => handleDragOver(e, zone.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, zone.id)}
      >
        {/* Drop zone indicator */}
        {isDragOver && (
          <div className="flex items-center justify-center py-3 mb-3 border-2 border-dashed border-green-400 rounded-lg bg-green-100">
            <p className="text-sm text-green-700 font-medium">Drop device here</p>
          </div>
        )}

        {/* Devices in this zone */}
        {zoneDevices.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {zoneDevices.map((device) => (
              <div
                key={device.id}
                draggable
                onDragStart={(e) => handleDragStart(e, device.id)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  selectDevice(device.id);
                }}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all cursor-grab active:cursor-grabbing",
                  device.status === "online"
                    ? "bg-green-100 hover:bg-green-200"
                    : "bg-gray-200 hover:bg-gray-300",
                  recentlyDropped === device.id && "ring-2 ring-green-500 ring-offset-1"
                )}
              >
                {recentlyDropped === device.id ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      device.status === "online" ? "bg-green-500" : "bg-gray-400"
                    )}
                  />
                )}
                <DeviceTypeIcon type={device.type} className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{device.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Child zones */}
        {hasChildren && isExpanded && (
          <div className="space-y-3 mt-3">
            {childZones.map((child) => (
              <ZoneCard
                key={child.id}
                zone={child}
                depth={depth + 1}
                allDevices={allDevices}
                getChildZones={getChildZones}
                expandedZones={expandedZones}
                toggleZoneExpansion={toggleZoneExpansion}
                selectedZoneId={selectedZoneId}
                setSelectedZoneId={setSelectedZoneId}
                dragOverZoneId={dragOverZoneId}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                selectDevice={selectDevice}
                recentlyDropped={recentlyDropped}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasChildren && zoneDevices.length === 0 && !isDragOver && (
          <p className="text-xs text-muted-foreground">
            Drop devices here or add child zones
          </p>
        )}
      </div>
    </div>
  );
}

export default function FloorplanPage() {
  const {
    selectedSiteId,
    selectedSite,
    getZonesForSite,
    getRootZones,
    getChildZones,
    getUnplacedDevices,
    getDevicesForSite,
    selectDevice,
    assignDeviceToZone,
  } = useSiteContext();

  const [selectedZoneId, setSelectedZoneId] = React.useState<string | null>(null);
  const [dragOverZoneId, setDragOverZoneId] = React.useState<string | null>(null);
  const [draggingDeviceId, setDraggingDeviceId] = React.useState<string | null>(null);
  const [recentlyDropped, setRecentlyDropped] = React.useState<string | null>(null);
  const [expandedZones, setExpandedZones] = React.useState<Set<string>>(new Set());

  // Get zones for the selected site (excluding default "Common Area" for cleaner display)
  const zones = React.useMemo(() => {
    if (!selectedSiteId) return [];
    return getZonesForSite(selectedSiteId).filter((z) => !z.isDefault);
  }, [selectedSiteId, getZonesForSite]);

  // Get root-level zones for hierarchical display
  const rootZones = React.useMemo(() => {
    if (!selectedSiteId) return [];
    return getRootZones(selectedSiteId).filter((z) => !z.isDefault);
  }, [selectedSiteId, getRootZones]);

  const unplacedDevices = React.useMemo(() => {
    if (!selectedSiteId) return [];
    return getUnplacedDevices(selectedSiteId);
  }, [selectedSiteId, getUnplacedDevices]);

  const allDevices = React.useMemo(() => {
    if (!selectedSiteId) return [];
    return getDevicesForSite(selectedSiteId);
  }, [selectedSiteId, getDevicesForSite]);

  // Toggle zone expansion
  const toggleZoneExpansion = (zoneId: string) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, deviceId: string) => {
    e.dataTransfer.setData("deviceId", deviceId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingDeviceId(deviceId);
  };

  const handleDragEnd = () => {
    setDraggingDeviceId(null);
    setDragOverZoneId(null);
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverZoneId(zoneId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the zone container entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverZoneId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData("deviceId");

    if (deviceId) {
      assignDeviceToZone(deviceId, zoneId);
      setRecentlyDropped(deviceId);

      // Clear the "recently dropped" indicator after animation
      setTimeout(() => {
        setRecentlyDropped(null);
      }, 2000);
    }

    setDragOverZoneId(null);
    setDraggingDeviceId(null);
  };

  // Handle removing device from zone (drag back to unplaced)
  const handleDropToUnplaced = (e: React.DragEvent) => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData("deviceId");

    if (deviceId) {
      assignDeviceToZone(deviceId, null);
    }

    setDragOverZoneId(null);
    setDraggingDeviceId(null);
  };

  // If no site is selected, show prompt
  if (!selectedSiteId) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Site</h2>
          <p className="text-gray-600 mb-6">
            Choose a site from the breadcrumb above to view its floor plan and manage spaces.
          </p>
          <Link href="/spaces/sites">
            <Button>
              <Layers className="w-4 h-4 mr-2" />
              View All Sites
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)]">
      {/* Main Floor Plan Area */}
      <div className="flex-1 bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Zone
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">100%</span>
            <Button variant="ghost" size="sm">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Floor Plan Canvas */}
        <div className="flex-1 bg-gray-50 relative overflow-auto p-8">
          {zones.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Layers className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Zones Defined</h3>
                <p className="text-gray-600 mb-4 max-w-sm">
                  Create zones to organize your site. Drag devices from the sidebar to place them on the map.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Zone
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rootZones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  depth={0}
                  allDevices={allDevices}
                  getChildZones={getChildZones}
                  expandedZones={expandedZones}
                  toggleZoneExpansion={toggleZoneExpansion}
                  selectedZoneId={selectedZoneId}
                  setSelectedZoneId={setSelectedZoneId}
                  dragOverZoneId={dragOverZoneId}
                  handleDragOver={handleDragOver}
                  handleDragLeave={handleDragLeave}
                  handleDrop={handleDrop}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  selectDevice={selectDevice}
                  recentlyDropped={recentlyDropped}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 px-4 py-2 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500" />
            <span>Booking Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Access Event</span>
          </div>
        </div>
      </div>

      {/* Unplaced Devices Sidebar */}
      <div
        className={cn(
          "w-72 bg-white rounded-lg border shadow-sm flex flex-col transition-all",
          draggingDeviceId && "ring-2 ring-orange-300"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={handleDropToUnplaced}
      >
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Unplaced Devices</h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {unplacedDevices.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Drag devices to place them on the floor plan
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {unplacedDevices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All devices are placed</p>
              {draggingDeviceId && (
                <p className="text-xs mt-2 text-orange-600">Drop here to unassign</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {unplacedDevices.map((device) => (
                <div
                  key={device.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, device.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => selectDevice(device.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                    "hover:bg-gray-50 border border-transparent hover:border-gray-200",
                    draggingDeviceId === device.id
                      ? "opacity-50 cursor-grabbing scale-95"
                      : "cursor-grab",
                    device.status === "offline" && "opacity-60"
                  )}
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div
                    className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      device.status === "online" ? "bg-blue-100" : "bg-gray-100"
                    )}
                  >
                    <DeviceTypeIcon
                      type={device.type}
                      className={cn(
                        "w-4 h-4",
                        device.status === "online" ? "text-blue-600" : "text-gray-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{device.name}</p>
                    <p className="text-xs text-muted-foreground">{deviceTypeLabels[device.type]}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-200">
          <Link href="/spaces/devices" className="block">
            <Button variant="outline" className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
