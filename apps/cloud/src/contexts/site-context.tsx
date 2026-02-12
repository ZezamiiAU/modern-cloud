"use client";

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";

// Constants for Default Space logic
export const DEFAULT_ZONE_NAME = "Common Area";
export const DEFAULT_ZONE_TYPE = "area" as const;

// Zone Types (hierarchical)
export type ZoneType = "building" | "zone" | "floor" | "room" | "area";

// Zone hierarchy levels (lower = higher in hierarchy)
export const ZONE_HIERARCHY: Record<ZoneType, number> = {
  building: 0,
  zone: 1,
  floor: 2,
  room: 3,
  area: 4,
};

// Zone type labels for UI
export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  building: "Building",
  zone: "Zone",
  floor: "Floor",
  room: "Room",
  area: "Area",
};

// Valid child types for each zone type
export const ZONE_VALID_CHILDREN: Record<ZoneType, ZoneType[]> = {
  building: ["zone", "floor"],
  zone: ["floor", "room", "area"],
  floor: ["room", "area"],
  room: ["area"],
  area: [],
};

// Types
export interface Zone {
  id: string;
  name: string;
  siteId: string;
  parentId: string | null;  // null = top-level zone
  type: ZoneType;
  isDefault?: boolean;      // True for "Common Area"
  description?: string;
  capacity?: number;
  area?: number;            // Square meters/feet
  coordinates?: { x: number; y: number; width?: number; height?: number };
  color?: string;           // For floor plan visualization
}

export interface Site {
  id: string;
  name: string;
  address: string;
  region: string;
  type: string;
  status: "online" | "offline" | "maintenance";
  devicesCount: number;
  zonesCount: number;
  defaultZoneId: string;
  activitySparkline: number[];
  lastEvent?: {
    type: "access" | "rooms" | "lockers" | "bookings" | "vision";
    action: string;
    timestamp: Date;
  };
}

export interface Device {
  id: string;
  name: string;
  type: "digital-lock" | "access-reader" | "gateway" | "sensor" | "controller" | "camera";
  siteId: string;
  zoneId: string | null;    // Changed from spaceId to zoneId
  status: "online" | "offline";
  batteryLevel?: number;
  lastSeen: Date;
  macAddress: string;
  serialNumber: string;
  firmwareVersion: string;
}

// Asset = Device with extended operational data for Spatial Insights
export type AssetHealth = "healthy" | "warning" | "critical";

export interface Asset extends Device {
  health: AssetHealth;
  utilizationPercent?: number;
  lastTransaction?: Transaction;
}

// Transaction = Access/Activity event
export type TransactionType = "access" | "unlock" | "lock" | "alarm" | "maintenance";
export type TransactionStatus = "success" | "denied" | "error";

export interface Transaction {
  id: string;
  assetId: string;
  type: TransactionType;
  userId?: string;
  userName?: string;
  timestamp: Date;
  status: TransactionStatus;
  details?: string;
}

interface SiteContextValue {
  // Sites
  sites: Site[];
  selectedSiteId: string | null;
  selectedSite: Site | null;
  selectSite: (siteId: string | null) => void;
  addSite: (site: Omit<Site, "id" | "defaultZoneId" | "devicesCount" | "zonesCount">) => Site;

  // Zones (hierarchical)
  zones: Zone[];
  selectedZoneId: string | null;
  selectedZone: Zone | null;
  selectZone: (zoneId: string | null) => void;
  getZonesForSite: (siteId: string) => Zone[];
  getChildZones: (zoneId: string) => Zone[];
  getRootZones: (siteId: string) => Zone[];
  getZoneHierarchy: (zoneId: string) => Zone[];  // Returns path from root to zone
  getZoneDepth: (zoneId: string) => number;
  getDefaultZone: (siteId: string) => Zone | undefined;
  addZone: (zone: Omit<Zone, "id">) => Zone;
  updateZone: (zoneId: string, updates: Partial<Zone>) => void;
  deleteZone: (zoneId: string) => void;
  getValidChildTypes: (parentId: string | null, siteId: string) => ZoneType[];

  // Devices
  devices: Device[];
  selectedDeviceId: string | null;
  selectDevice: (deviceId: string | null) => void;
  getDevicesForSite: (siteId: string) => Device[];
  getDevicesForZone: (zoneId: string, includeChildren?: boolean) => Device[];
  getUnplacedDevices: (siteId: string) => Device[];
  addDevice: (device: Omit<Device, "id">) => Device;
  assignDeviceToZone: (deviceId: string, zoneId: string | null) => void;

  // Metrics
  getMetricsForSite: (siteId: string | null) => {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    totalZones: number;
    unplacedDevices: number;
  };
}

const SiteContext = createContext<SiteContextValue | null>(null);

// Generate mock data with hierarchical zones
function generateMockData() {
  const sites: Site[] = [
    {
      id: "site-1",
      name: "Sydney HQ",
      address: "123 George Street, Sydney NSW 2000",
      region: "APAC",
      type: "Office",
      status: "online",
      devicesCount: 45,
      zonesCount: 12,
      defaultZoneId: "zone-1-default",
      activitySparkline: [120, 145, 132, 156, 148, 135, 142],
      lastEvent: { type: "access", action: "Door unlocked", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    },
    {
      id: "site-2",
      name: "Melbourne Distribution",
      address: "456 Collins Street, Melbourne VIC 3000",
      region: "APAC",
      type: "Warehouse",
      status: "online",
      devicesCount: 28,
      zonesCount: 8,
      defaultZoneId: "zone-2-default",
      activitySparkline: [85, 92, 78, 95, 88, 82, 90],
      lastEvent: { type: "lockers", action: "Locker assigned", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    },
    {
      id: "site-3",
      name: "Brisbane Office",
      address: "789 Queen Street, Brisbane QLD 4000",
      region: "APAC",
      type: "Office",
      status: "online",
      devicesCount: 18,
      zonesCount: 5,
      defaultZoneId: "zone-3-default",
      activitySparkline: [42, 48, 45, 52, 49, 44, 47],
      lastEvent: { type: "rooms", action: "Room booked", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    },
    {
      id: "site-4",
      name: "London Office",
      address: "10 Downing Street, London SW1A 2AA",
      region: "EMEA",
      type: "Office",
      status: "online",
      devicesCount: 32,
      zonesCount: 9,
      defaultZoneId: "zone-4-default",
      activitySparkline: [65, 72, 68, 78, 75, 70, 73],
      lastEvent: { type: "vision", action: "Motion detected", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
    },
    {
      id: "site-5",
      name: "Berlin Warehouse",
      address: "Alexanderplatz 1, 10178 Berlin",
      region: "EMEA",
      type: "Warehouse",
      status: "maintenance",
      devicesCount: 22,
      zonesCount: 6,
      defaultZoneId: "zone-5-default",
      activitySparkline: [55, 58, 52, 48, 35, 12, 8],
      lastEvent: { type: "access", action: "System maintenance", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    },
    {
      id: "site-6",
      name: "New York HQ",
      address: "350 5th Ave, New York, NY 10118",
      region: "Americas",
      type: "Office",
      status: "online",
      devicesCount: 56,
      zonesCount: 14,
      defaultZoneId: "zone-6-default",
      activitySparkline: [180, 195, 172, 205, 188, 175, 192],
      lastEvent: { type: "bookings", action: "Desk reserved", timestamp: new Date(Date.now() - 1000 * 60 * 45) },
    },
    {
      id: "site-7",
      name: "San Francisco Hub",
      address: "1 Market Street, San Francisco, CA 94105",
      region: "Americas",
      type: "Office",
      status: "online",
      devicesCount: 38,
      zonesCount: 10,
      defaultZoneId: "zone-7-default",
      activitySparkline: [95, 102, 88, 112, 105, 98, 108],
      lastEvent: { type: "access", action: "Visitor checked in", timestamp: new Date(Date.now() - 1000 * 60 * 20) },
    },
    {
      id: "site-8",
      name: "Perth Retail",
      address: "100 Murray Street, Perth WA 6000",
      region: "APAC",
      type: "Retail",
      status: "offline",
      devicesCount: 8,
      zonesCount: 3,
      defaultZoneId: "zone-8-default",
      activitySparkline: [25, 28, 22, 30, 15, 0, 0],
      lastEvent: { type: "access", action: "Connection lost", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    },
  ];

  const zones: Zone[] = [
    // Default zones for each site (Common Area)
    { id: "zone-1-default", name: DEFAULT_ZONE_NAME, siteId: "site-1", parentId: null, type: "area", isDefault: true },
    { id: "zone-2-default", name: DEFAULT_ZONE_NAME, siteId: "site-2", parentId: null, type: "area", isDefault: true },
    { id: "zone-3-default", name: DEFAULT_ZONE_NAME, siteId: "site-3", parentId: null, type: "area", isDefault: true },
    { id: "zone-4-default", name: DEFAULT_ZONE_NAME, siteId: "site-4", parentId: null, type: "area", isDefault: true },
    { id: "zone-5-default", name: DEFAULT_ZONE_NAME, siteId: "site-5", parentId: null, type: "area", isDefault: true },
    { id: "zone-6-default", name: DEFAULT_ZONE_NAME, siteId: "site-6", parentId: null, type: "area", isDefault: true },
    { id: "zone-7-default", name: DEFAULT_ZONE_NAME, siteId: "site-7", parentId: null, type: "area", isDefault: true },
    { id: "zone-8-default", name: DEFAULT_ZONE_NAME, siteId: "site-8", parentId: null, type: "area", isDefault: true },

    // Sydney HQ - Hierarchical structure
    // Building (top level)
    { id: "zone-1-building", name: "Main Building", siteId: "site-1", parentId: null, type: "building", description: "Primary office building", color: "#6366f1" },

    // Zones within building
    { id: "zone-1-parking", name: "Parking Garage", siteId: "site-1", parentId: "zone-1-building", type: "zone", description: "Underground parking", color: "#64748b" },

    // Floors within building
    { id: "zone-1-floor1", name: "Level 1", siteId: "site-1", parentId: "zone-1-building", type: "floor", description: "Ground floor - Reception", color: "#22c55e" },
    { id: "zone-1-floor2", name: "Level 2", siteId: "site-1", parentId: "zone-1-building", type: "floor", description: "Open plan office", color: "#3b82f6" },
    { id: "zone-1-floor3", name: "Level 3", siteId: "site-1", parentId: "zone-1-building", type: "floor", description: "Executive floor", color: "#a855f7" },

    // Rooms within Level 1
    { id: "zone-1-reception", name: "Reception", siteId: "site-1", parentId: "zone-1-floor1", type: "room", capacity: 20, color: "#22c55e" },
    { id: "zone-1-lobby", name: "Main Lobby", siteId: "site-1", parentId: "zone-1-floor1", type: "room", capacity: 50, color: "#22c55e" },
    { id: "zone-1-security", name: "Security Office", siteId: "site-1", parentId: "zone-1-floor1", type: "room", capacity: 5, color: "#ef4444" },

    // Rooms within Level 2
    { id: "zone-1-openplan", name: "Open Plan Area", siteId: "site-1", parentId: "zone-1-floor2", type: "area", capacity: 100, color: "#3b82f6" },
    { id: "zone-1-meeting1", name: "Meeting Room A", siteId: "site-1", parentId: "zone-1-floor2", type: "room", capacity: 10, color: "#3b82f6" },
    { id: "zone-1-meeting2", name: "Meeting Room B", siteId: "site-1", parentId: "zone-1-floor2", type: "room", capacity: 8, color: "#3b82f6" },
    { id: "zone-1-server", name: "Server Room", siteId: "site-1", parentId: "zone-1-floor2", type: "room", capacity: 2, color: "#ef4444" },

    // Rooms within Level 3
    { id: "zone-1-exec", name: "Executive Suite", siteId: "site-1", parentId: "zone-1-floor3", type: "room", capacity: 15, color: "#a855f7" },
    { id: "zone-1-boardroom", name: "Boardroom", siteId: "site-1", parentId: "zone-1-floor3", type: "room", capacity: 20, color: "#a855f7" },

    // New York HQ - Hierarchical structure
    { id: "zone-6-tower", name: "Empire Tower", siteId: "site-6", parentId: null, type: "building", description: "Main office tower", color: "#6366f1" },

    // Zones
    { id: "zone-6-lobby", name: "Main Lobby", siteId: "site-6", parentId: "zone-6-tower", type: "zone", color: "#64748b" },

    // Floors
    { id: "zone-6-floor10", name: "Floor 10", siteId: "site-6", parentId: "zone-6-tower", type: "floor", description: "Engineering", color: "#3b82f6" },
    { id: "zone-6-floor11", name: "Floor 11", siteId: "site-6", parentId: "zone-6-tower", type: "floor", description: "Sales", color: "#22c55e" },
    { id: "zone-6-rooftop", name: "Rooftop", siteId: "site-6", parentId: "zone-6-tower", type: "zone", description: "Rooftop access", color: "#f59e0b" },

    // Rooms in Floor 10
    { id: "zone-6-eng-open", name: "Engineering Open Plan", siteId: "site-6", parentId: "zone-6-floor10", type: "area", capacity: 50, color: "#3b82f6" },
    { id: "zone-6-eng-lab", name: "Hardware Lab", siteId: "site-6", parentId: "zone-6-floor10", type: "room", capacity: 10, color: "#3b82f6" },
  ];

  const devices: Device[] = [
    // Sydney HQ devices - now using zoneId
    { id: "dev-1", name: "Main Entrance Lock", type: "digital-lock", siteId: "site-1", zoneId: "zone-1-lobby", status: "online", batteryLevel: 85, lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:01", serialNumber: "ZEZ-DL-001", firmwareVersion: "2.4.1" },
    { id: "dev-2", name: "Reception Reader", type: "access-reader", siteId: "site-1", zoneId: "zone-1-reception", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:02", serialNumber: "ZEZ-AR-001", firmwareVersion: "1.8.3" },
    { id: "dev-3", name: "Level 2 Gateway", type: "gateway", siteId: "site-1", zoneId: "zone-1-floor2", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:03", serialNumber: "ZEZ-GW-001", firmwareVersion: "3.1.0" },
    { id: "dev-4", name: "Server Room Lock", type: "digital-lock", siteId: "site-1", zoneId: "zone-1-server", status: "online", batteryLevel: 92, lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:04", serialNumber: "ZEZ-DL-002", firmwareVersion: "2.4.1" },
    { id: "dev-5", name: "Parking Camera", type: "camera", siteId: "site-1", zoneId: "zone-1-parking", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:05", serialNumber: "ZEZ-CAM-001", firmwareVersion: "1.2.0" },
    { id: "dev-6", name: "Unassigned Sensor 1", type: "sensor", siteId: "site-1", zoneId: null, status: "online", batteryLevel: 45, lastSeen: new Date(Date.now() - 1000 * 60 * 30), macAddress: "AA:BB:CC:DD:EE:06", serialNumber: "ZEZ-SN-001", firmwareVersion: "1.0.5" },
    { id: "dev-7", name: "New Lock (Unplaced)", type: "digital-lock", siteId: "site-1", zoneId: null, status: "offline", batteryLevel: 100, lastSeen: new Date(Date.now() - 1000 * 60 * 60), macAddress: "AA:BB:CC:DD:EE:07", serialNumber: "ZEZ-DL-003", firmwareVersion: "2.4.1" },
    { id: "dev-15", name: "Boardroom Lock", type: "digital-lock", siteId: "site-1", zoneId: "zone-1-boardroom", status: "online", batteryLevel: 95, lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:15", serialNumber: "ZEZ-DL-007", firmwareVersion: "2.4.1" },
    { id: "dev-16", name: "Security Camera", type: "camera", siteId: "site-1", zoneId: "zone-1-security", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:16", serialNumber: "ZEZ-CAM-002", firmwareVersion: "1.2.0" },

    // New York HQ devices
    { id: "dev-8", name: "Lobby Turnstile 1", type: "access-reader", siteId: "site-6", zoneId: "zone-6-lobby", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:08", serialNumber: "ZEZ-AR-002", firmwareVersion: "1.8.3" },
    { id: "dev-9", name: "Lobby Turnstile 2", type: "access-reader", siteId: "site-6", zoneId: "zone-6-lobby", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:09", serialNumber: "ZEZ-AR-003", firmwareVersion: "1.8.3" },
    { id: "dev-10", name: "Engineering Door", type: "digital-lock", siteId: "site-6", zoneId: "zone-6-eng-open", status: "online", batteryLevel: 78, lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:10", serialNumber: "ZEZ-DL-004", firmwareVersion: "2.4.1" },
    { id: "dev-11", name: "Rooftop Access Lock", type: "digital-lock", siteId: "site-6", zoneId: "zone-6-rooftop", status: "offline", batteryLevel: 12, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24), macAddress: "AA:BB:CC:DD:EE:11", serialNumber: "ZEZ-DL-005", firmwareVersion: "2.4.0" },
    { id: "dev-12", name: "Pending Gateway", type: "gateway", siteId: "site-6", zoneId: null, status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:12", serialNumber: "ZEZ-GW-002", firmwareVersion: "3.1.0" },

    // Melbourne devices
    { id: "dev-13", name: "Warehouse Entry", type: "access-reader", siteId: "site-2", zoneId: "zone-2-default", status: "online", lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:13", serialNumber: "ZEZ-AR-004", firmwareVersion: "1.8.3" },
    { id: "dev-14", name: "Loading Dock Lock", type: "digital-lock", siteId: "site-2", zoneId: "zone-2-default", status: "online", batteryLevel: 67, lastSeen: new Date(), macAddress: "AA:BB:CC:DD:EE:14", serialNumber: "ZEZ-DL-006", firmwareVersion: "2.4.1" },
  ];

  return { sites, zones, devices };
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const mockData = useMemo(() => generateMockData(), []);

  const [sites, setSites] = useState<Site[]>(mockData.sites);
  const [zones, setZones] = useState<Zone[]>(mockData.zones);
  const [devices, setDevices] = useState<Device[]>(mockData.devices);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selectedSiteId) || null,
    [sites, selectedSiteId]
  );

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId]
  );

  const selectSite = useCallback((siteId: string | null) => {
    setSelectedSiteId(siteId);
    setSelectedZoneId(null);
    setSelectedDeviceId(null);
  }, []);

  const selectZone = useCallback((zoneId: string | null) => {
    setSelectedZoneId(zoneId);
  }, []);

  const selectDevice = useCallback((deviceId: string | null) => {
    setSelectedDeviceId(deviceId);
  }, []);

  const addSite = useCallback((siteData: Omit<Site, "id" | "defaultZoneId" | "devicesCount" | "zonesCount">) => {
    const siteId = `site-${Date.now()}`;
    const defaultZoneId = `zone-${siteId}-default`;

    const newSite: Site = {
      ...siteData,
      id: siteId,
      defaultZoneId,
      devicesCount: 0,
      zonesCount: 1,
    };

    // Create default "Common Area" zone for the site
    const defaultZone: Zone = {
      id: defaultZoneId,
      name: DEFAULT_ZONE_NAME,
      siteId,
      parentId: null,
      type: DEFAULT_ZONE_TYPE,
      isDefault: true,
    };

    setSites((prev) => [...prev, newSite]);
    setZones((prev) => [...prev, defaultZone]);

    return newSite;
  }, []);

  // Zone functions
  const getZonesForSite = useCallback(
    (siteId: string) => zones.filter((z) => z.siteId === siteId),
    [zones]
  );

  const getChildZones = useCallback(
    (zoneId: string) => zones.filter((z) => z.parentId === zoneId),
    [zones]
  );

  const getRootZones = useCallback(
    (siteId: string) => zones.filter((z) => z.siteId === siteId && z.parentId === null),
    [zones]
  );

  const getZoneHierarchy = useCallback(
    (zoneId: string): Zone[] => {
      const hierarchy: Zone[] = [];
      let currentZone = zones.find((z) => z.id === zoneId);

      while (currentZone) {
        hierarchy.unshift(currentZone);
        currentZone = currentZone.parentId
          ? zones.find((z) => z.id === currentZone!.parentId)
          : undefined;
      }

      return hierarchy;
    },
    [zones]
  );

  const getZoneDepth = useCallback(
    (zoneId: string): number => {
      return getZoneHierarchy(zoneId).length - 1;
    },
    [getZoneHierarchy]
  );

  const getDefaultZone = useCallback(
    (siteId: string) => zones.find((z) => z.siteId === siteId && z.isDefault),
    [zones]
  );

  const getValidChildTypes = useCallback(
    (parentId: string | null, siteId: string): ZoneType[] => {
      if (!parentId) {
        // Top-level can be building, zone, or area
        return ["building", "zone", "floor", "area"];
      }
      const parentZone = zones.find((z) => z.id === parentId);
      if (!parentZone) return [];
      return ZONE_VALID_CHILDREN[parentZone.type];
    },
    [zones]
  );

  const addZone = useCallback((zoneData: Omit<Zone, "id">) => {
    const newZone: Zone = {
      ...zoneData,
      id: `zone-${Date.now()}`,
    };
    setZones((prev) => [...prev, newZone]);

    // Update site zone count
    setSites((prev) =>
      prev.map((site) =>
        site.id === zoneData.siteId
          ? { ...site, zonesCount: site.zonesCount + 1 }
          : site
      )
    );

    return newZone;
  }, []);

  const updateZone = useCallback((zoneId: string, updates: Partial<Zone>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, ...updates } : z))
    );
  }, []);

  const deleteZone = useCallback((zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone || zone.isDefault) return; // Can't delete default zone

    // Get all descendant zones
    const getDescendants = (id: string): string[] => {
      const children = zones.filter((z) => z.parentId === id);
      return children.reduce(
        (acc, child) => [...acc, child.id, ...getDescendants(child.id)],
        [] as string[]
      );
    };

    const descendantIds = getDescendants(zoneId);
    const allZoneIds = [zoneId, ...descendantIds];

    // Move devices in deleted zones to default zone
    const site = sites.find((s) => s.id === zone.siteId);
    if (site) {
      setDevices((prev) =>
        prev.map((d) =>
          allZoneIds.includes(d.zoneId || "")
            ? { ...d, zoneId: site.defaultZoneId }
            : d
        )
      );
    }

    // Remove zones
    setZones((prev) => prev.filter((z) => !allZoneIds.includes(z.id)));

    // Update site zone count
    setSites((prev) =>
      prev.map((s) =>
        s.id === zone.siteId
          ? { ...s, zonesCount: s.zonesCount - allZoneIds.length }
          : s
      )
    );
  }, [zones, sites]);

  // Device functions
  const getDevicesForSite = useCallback(
    (siteId: string) => devices.filter((d) => d.siteId === siteId),
    [devices]
  );

  const getDevicesForZone = useCallback(
    (zoneId: string, includeChildren = false): Device[] => {
      if (!includeChildren) {
        return devices.filter((d) => d.zoneId === zoneId);
      }

      // Get all descendant zone IDs
      const getDescendantIds = (id: string): string[] => {
        const children = zones.filter((z) => z.parentId === id);
        return children.reduce(
          (acc, child) => [...acc, child.id, ...getDescendantIds(child.id)],
          [] as string[]
        );
      };

      const allZoneIds = [zoneId, ...getDescendantIds(zoneId)];
      return devices.filter((d) => d.zoneId && allZoneIds.includes(d.zoneId));
    },
    [devices, zones]
  );

  const getUnplacedDevices = useCallback(
    (siteId: string) => devices.filter((d) => d.siteId === siteId && !d.zoneId),
    [devices]
  );

  const addDevice = useCallback((deviceData: Omit<Device, "id">) => {
    const site = sites.find((s) => s.id === deviceData.siteId);

    // If no zoneId provided, leave as null (unplaced)
    const zoneId = deviceData.zoneId ?? null;

    const newDevice: Device = {
      ...deviceData,
      id: `dev-${Date.now()}`,
      zoneId,
    };

    setDevices((prev) => [...prev, newDevice]);

    // Update site device count
    setSites((prev) =>
      prev.map((s) =>
        s.id === deviceData.siteId
          ? { ...s, devicesCount: s.devicesCount + 1 }
          : s
      )
    );

    return newDevice;
  }, [sites]);

  const assignDeviceToZone = useCallback((deviceId: string, zoneId: string | null) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, zoneId } : d))
    );
  }, []);

  const getMetricsForSite = useCallback(
    (siteId: string | null) => {
      const filteredDevices = siteId
        ? devices.filter((d) => d.siteId === siteId)
        : devices;
      const filteredZones = siteId
        ? zones.filter((z) => z.siteId === siteId)
        : zones;

      return {
        totalDevices: filteredDevices.length,
        onlineDevices: filteredDevices.filter((d) => d.status === "online").length,
        offlineDevices: filteredDevices.filter((d) => d.status === "offline").length,
        totalZones: filteredZones.length,
        unplacedDevices: filteredDevices.filter((d) => !d.zoneId).length,
      };
    },
    [devices, zones]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<SiteContextValue>(
    () => ({
      sites,
      selectedSiteId,
      selectedSite,
      selectSite,
      addSite,
      zones,
      selectedZoneId,
      selectedZone,
      selectZone,
      getZonesForSite,
      getChildZones,
      getRootZones,
      getZoneHierarchy,
      getZoneDepth,
      getDefaultZone,
      addZone,
      updateZone,
      deleteZone,
      getValidChildTypes,
      devices,
      selectedDeviceId,
      selectDevice,
      getDevicesForSite,
      getDevicesForZone,
      getUnplacedDevices,
      addDevice,
      assignDeviceToZone,
      getMetricsForSite,
    }),
    [
      sites,
      selectedSiteId,
      selectedSite,
      selectSite,
      addSite,
      zones,
      selectedZoneId,
      selectedZone,
      selectZone,
      getZonesForSite,
      getChildZones,
      getRootZones,
      getZoneHierarchy,
      getZoneDepth,
      getDefaultZone,
      addZone,
      updateZone,
      deleteZone,
      getValidChildTypes,
      devices,
      selectedDeviceId,
      selectDevice,
      getDevicesForSite,
      getDevicesForZone,
      getUnplacedDevices,
      addDevice,
      assignDeviceToZone,
      getMetricsForSite,
    ]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSiteContext() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSiteContext must be used within a SiteProvider");
  }
  return context;
}
