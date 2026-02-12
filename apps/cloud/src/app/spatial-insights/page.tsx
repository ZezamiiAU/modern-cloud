"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Lock, Camera, DoorOpen, LayoutGrid, Network } from "lucide-react";
import { cn } from "@repo/ui";
import {
  useSiteContext,
  type Device,
  type Zone,
  type Transaction,
  type TransactionType,
  type TransactionStatus,
} from "@/contexts/site-context";
import { LocationSelector } from "./components/location-selector";
import { ViewSwitcher, type ViewMode } from "./components/view-switcher";
import { AssetInspector } from "./components/asset-inspector";
import { SpaceCard } from "./components/space-card";
import { AddSpaceDialog } from "./components/add-space-dialog";
import { AssignDeviceDialog } from "./components/assign-device-dialog";
import { SpatialCanvas } from "./components/spatial-canvas";

type LayoutMode = "grid" | "canvas";

// ZezamiiSpace interface for Spatial Insights
interface ZezamiiSpace {
  id: string;
  name: string;
  type: "Room" | "Area" | "Zone";
  devices: {
    locks: Device[];
    cameras: Device[];
  };
  latestTransactions: Transaction[];
  zone: Zone;
}

// Generate mock transactions for a space
function generateSpaceTransactions(
  spaceId: string,
  deviceIds: string[]
): Transaction[] {
  const types: TransactionType[] = ["access", "unlock", "lock", "alarm"];
  const statuses: TransactionStatus[] = ["success", "denied", "error"];
  const users = [
    { id: "user-1", name: "John Doe" },
    { id: "user-2", name: "Jane Smith" },
    { id: "user-3", name: "Bob Johnson" },
    { id: "user-4", name: "Alice Williams" },
    { id: "user-5", name: "Charlie Brown" },
  ];

  const transactions: Transaction[] = [];
  const numTransactions = Math.min(
    5,
    Math.max(2, Math.floor(Math.random() * 8))
  );

  for (let i = 0; i < numTransactions; i++) {
    const type = types[Math.floor(Math.random() * types.length)] ?? "access";
    const status =
      Math.random() > 0.2
        ? "success"
        : (statuses[Math.floor(Math.random() * statuses.length)] ?? "success");
    const user = users[Math.floor(Math.random() * users.length)] ?? users[0]!;
    const deviceId =
      deviceIds.length > 0
        ? (deviceIds[Math.floor(Math.random() * deviceIds.length)] ?? spaceId)
        : spaceId;

    transactions.push({
      id: `txn-${spaceId}-${i}`,
      assetId: deviceId,
      type,
      userId: user.id,
      userName: user.name,
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
      status,
      details:
        type === "alarm"
          ? "Motion detected"
          : status === "denied"
            ? "Invalid credentials"
            : undefined,
    });
  }

  return transactions.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

// Generate mock transactions for all zones (used by canvas)
function generateAllTransactions(
  zones: Zone[],
  devices: Device[]
): Transaction[] {
  const allTransactions: Transaction[] = [];

  zones.forEach((zone) => {
    const zoneDevices = devices.filter((d) => d.zoneId === zone.id);
    const deviceIds = zoneDevices.map((d) => d.id);

    // Generate 1-3 recent transactions per zone
    const numTransactions = Math.floor(Math.random() * 3) + 1;
    const types: TransactionType[] = ["access", "unlock", "lock", "alarm"];
    const statuses: TransactionStatus[] = ["success", "denied", "error"];

    for (let i = 0; i < numTransactions; i++) {
      const type = types[Math.floor(Math.random() * types.length)] ?? "access";
      const status = Math.random() > 0.2 ? "success" : (statuses[Math.floor(Math.random() * statuses.length)] ?? "success");
      const deviceId = deviceIds.length > 0 ? (deviceIds[Math.floor(Math.random() * deviceIds.length)] ?? zone.id) : zone.id;

      allTransactions.push({
        id: `txn-${zone.id}-${i}-${Date.now()}`,
        assetId: deviceId,
        type,
        timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 10), // Last 10 minutes
        status,
      });
    }
  });

  return allTransactions;
}

export default function SpatialInsightsPage() {
  const {
    selectedSiteId,
    selectedZoneId,
    devices,
    zones,
    addZone,
    assignDeviceToZone,
  } = useSiteContext();

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("canvas");
  const [viewMode, setViewMode] = useState<ViewMode>("utilization");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [addSpaceOpen, setAddSpaceOpen] = useState(false);
  const [assignDeviceOpen, setAssignDeviceOpen] = useState(false);
  const [selectedSpaceForAssignment, setSelectedSpaceForAssignment] =
    useState<Zone | null>(null);
  const [selectedCanvasNodeId, setSelectedCanvasNodeId] = useState<
    string | null
  >(null);

  // Generate mock transactions for canvas (refreshes periodically for pulse effect)
  const [mockTransactions, setMockTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!selectedSiteId) return;

    // Generate initial transactions
    const siteZones = zones.filter((z) => z.siteId === selectedSiteId);
    setMockTransactions(generateAllTransactions(siteZones, devices));

    // Periodically generate new transactions to simulate real-time activity
    const interval = setInterval(() => {
      setMockTransactions(generateAllTransactions(siteZones, devices));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [selectedSiteId, zones, devices]);

  // Get spaces (rooms/areas) to display based on selection
  const spaces: ZezamiiSpace[] = useMemo(() => {
    if (!selectedSiteId) return [];

    // Filter zones to get rooms and areas for the selected context
    let displayZones: Zone[];

    if (selectedZoneId) {
      const selectedZone = zones.find((z) => z.id === selectedZoneId);
      if (!selectedZone) return [];

      // If selected zone is a room/area, show it
      if (selectedZone.type === "room" || selectedZone.type === "area") {
        displayZones = [selectedZone];
      } else {
        // Get all descendant rooms/areas
        const getChildSpaces = (parentId: string): Zone[] => {
          const children = zones.filter((z) => z.parentId === parentId);
          const spaces: Zone[] = [];
          for (const child of children) {
            if (
              (child.type === "room" || child.type === "area") &&
              !child.isDefault
            ) {
              spaces.push(child);
            }
            spaces.push(...getChildSpaces(child.id));
          }
          return spaces;
        };
        displayZones = getChildSpaces(selectedZoneId);
      }
    } else {
      // Show all rooms/areas for the site
      displayZones = zones.filter(
        (z) =>
          z.siteId === selectedSiteId &&
          (z.type === "room" || z.type === "area") &&
          !z.isDefault
      );
    }

    // Transform zones into ZezamiiSpaces
    return displayZones.map((zone): ZezamiiSpace => {
      const zoneDevices = devices.filter((d) => d.zoneId === zone.id);
      const locks = zoneDevices.filter(
        (d) => d.type === "digital-lock" || d.type === "access-reader"
      );
      const cameras = zoneDevices.filter((d) => d.type === "camera");
      const deviceIds = zoneDevices.map((d) => d.id);

      return {
        id: zone.id,
        name: zone.name,
        type:
          zone.type === "room"
            ? "Room"
            : zone.type === "area"
              ? "Area"
              : "Zone",
        devices: {
          locks,
          cameras,
        },
        latestTransactions: generateSpaceTransactions(zone.id, deviceIds),
        zone,
      };
    });
  }, [zones, devices, selectedSiteId, selectedZoneId]);

  // Get selected asset for inspector
  const selectedAsset = selectedAssetId
    ? (devices.find((d) => d.id === selectedAssetId) ?? null)
    : null;

  const handleAssetClick = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
    setInspectorOpen(true);
  }, []);

  const handleCloseInspector = useCallback(() => {
    setInspectorOpen(false);
  }, []);

  const handleAddSpace = useCallback(() => {
    setAddSpaceOpen(true);
  }, []);

  const handleAssignDevice = useCallback((space: Zone) => {
    setSelectedSpaceForAssignment(space);
    setAssignDeviceOpen(true);
  }, []);

  const handleSpaceCreated = useCallback(
    (name: string, type: "building" | "floor" | "room" | "area", parentId?: string) => {
      if (!selectedSiteId) return;

      addZone({
        name,
        siteId: selectedSiteId,
        parentId: parentId || selectedZoneId || null,
        type,
      });
      setAddSpaceOpen(false);
    },
    [addZone, selectedSiteId, selectedZoneId]
  );

  const handleDeviceAssigned = useCallback(
    (deviceId: string) => {
      if (!selectedSpaceForAssignment) return;
      assignDeviceToZone(deviceId, selectedSpaceForAssignment.id);
      setAssignDeviceOpen(false);
      setSelectedSpaceForAssignment(null);
    },
    [assignDeviceToZone, selectedSpaceForAssignment]
  );

  const handleCanvasNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedCanvasNodeId(nodeId);
  }, []);

  // Get zones for current site (for AddSpaceDialog)
  const siteZones = useMemo(() => {
    if (!selectedSiteId) return [];
    return zones.filter((z) => z.siteId === selectedSiteId);
  }, [zones, selectedSiteId]);

  return (
    <div className="flex flex-col h-full text-slate-100">
      {/* Toolbar */}
      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-slate-100">
              Spatial Insights
            </h1>
            <LocationSelector />
          </div>
          <div className="flex items-center gap-4">
            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg border border-slate-700 p-1">
              <button
                onClick={() => setLayoutMode("canvas")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  layoutMode === "canvas"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-slate-100"
                )}
              >
                <Network className="w-4 h-4" />
                Canvas
              </button>
              <button
                onClick={() => setLayoutMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  layoutMode === "grid"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-slate-100"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
            </div>

            <ViewSwitcher value={viewMode} onChange={setViewMode} />

            {selectedSiteId && layoutMode === "grid" && (
              <button
                onClick={handleAddSpace}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Space
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6">
        {!selectedSiteId ? (
          // Empty state - No site selected
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <DoorOpen className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-200 mb-2">
                Select a Location
              </h2>
              <p className="text-slate-400 mb-6">
                Choose a site from the dropdown above to view and manage your
                spaces. You can drill down into buildings and floors to see
                specific areas.
              </p>
            </div>
          </div>
        ) : layoutMode === "canvas" ? (
          // Canvas View
          <SpatialCanvas
            zones={siteZones}
            devices={devices}
            transactions={mockTransactions}
            selectedSiteId={selectedSiteId}
            selectedZoneId={selectedZoneId}
            onAddSpace={handleAddSpace}
            onNodeSelect={handleCanvasNodeSelect}
            onDeviceClick={handleAssetClick}
          />
        ) : spaces.length === 0 ? (
          // Empty state - No spaces (Grid view)
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <DoorOpen className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-200 mb-2">
                No Spaces Yet
              </h2>
              <p className="text-slate-400 mb-6">
                Create your first space to start monitoring access and security.
                Spaces can be rooms, areas, or zones within your building.
              </p>
              <button
                onClick={handleAddSpace}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Space
              </button>
            </div>
          </div>
        ) : (
          // Space cards grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-auto h-full">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                viewMode={viewMode}
                onAssetClick={handleAssetClick}
                onAssignDevice={() => handleAssignDevice(space.zone)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Asset Inspector */}
      <AssetInspector
        asset={selectedAsset}
        open={inspectorOpen}
        onClose={handleCloseInspector}
      />

      {/* Add Space Dialog */}
      <AddSpaceDialog
        open={addSpaceOpen}
        onClose={() => setAddSpaceOpen(false)}
        onSubmit={handleSpaceCreated}
        zones={siteZones}
        selectedZoneId={selectedZoneId}
      />

      {/* Assign Device Dialog */}
      <AssignDeviceDialog
        open={assignDeviceOpen}
        onClose={() => {
          setAssignDeviceOpen(false);
          setSelectedSpaceForAssignment(null);
        }}
        onSubmit={handleDeviceAssigned}
        siteId={selectedSiteId}
        spaceName={selectedSpaceForAssignment?.name || ""}
      />
    </div>
  );
}
