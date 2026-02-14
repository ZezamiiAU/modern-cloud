"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Eye,
  X,
  Filter,
  Plus,
  Battery,
  BatteryLow,
  BatteryWarning,
  Lock,
  Radio,
  Router,
  Gauge,
  Cpu,
  Camera,
  MapPin,
} from "lucide-react";
import {
  cn,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Label,
} from "@repo/ui";
import {
  useSiteContext,
  type Device,
  ZONE_TYPE_LABELS,
} from "@/contexts/site-context";

const deviceTypeIcons: Record<
  Device["type"],
  React.ComponentType<{ className?: string }>
> = {
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

function DeviceTypeIcon({
  type,
  className,
}: {
  type: Device["type"];
  className?: string;
}) {
  const Icon = deviceTypeIcons[type];
  return <Icon className={className} />;
}

function BatteryIndicator({ level }: { level?: number }) {
  if (level === undefined)
    return <span className="text-xs text-muted-foreground">N/A</span>;

  const Icon = level > 50 ? Battery : level > 20 ? BatteryWarning : BatteryLow;
  const colorClass =
    level > 50
      ? "text-green-500"
      : level > 20
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="flex items-center gap-1">
      <Icon className={cn("h-4 w-4", colorClass)} />
      <span className={cn("text-xs font-medium", colorClass)}>{level}%</span>
    </div>
  );
}

function StatusIndicator({ status }: { status: Device["status"] }) {
  return (
    <div className="flex items-center gap-2">
      {status === "online" ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700 uppercase">
            Online
          </span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs font-medium text-gray-500 uppercase">
            Offline
          </span>
        </>
      )}
    </div>
  );
}

export default function DevicesPage() {
  const {
    devices,
    sites,
    zones,
    selectedSiteId,
    selectedDeviceId,
    selectDevice,
    getDevicesForSite,
    getZonesForSite,
    addDevice,
    assignDeviceToZone,
  } = useSiteContext();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [searchDebounce, setSearchDebounce] = React.useState("");
  const [filters, setFilters] = React.useState<{
    type?: string;
    status?: string;
    zone?: string;
  }>({});

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedDeviceForDrawer, setSelectedDeviceForDrawer] =
    React.useState<Device | null>(null);

  const [addDeviceModalOpen, setAddDeviceModalOpen] = React.useState(false);
  const [newDeviceForm, setNewDeviceForm] = React.useState({
    name: "",
    type: "digital-lock" as Device["type"],
    siteId: "",
    zoneId: "",
    macAddress: "",
    serialNumber: "",
  });

  // Auto-select first site if none selected
  React.useEffect(() => {
    const firstSite = sites[0];
    if (!newDeviceForm.siteId && firstSite) {
      setNewDeviceForm((prev) => ({
        ...prev,
        siteId: selectedSiteId || firstSite.id,
      }));
    }
  }, [sites, selectedSiteId, newDeviceForm.siteId]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchDebounce);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  // Highlight selected device from map
  React.useEffect(() => {
    if (selectedDeviceId) {
      const device = devices.find((d) => d.id === selectedDeviceId);
      if (device) {
        setSelectedDeviceForDrawer(device);
        setDrawerOpen(true);
      }
    }
  }, [selectedDeviceId, devices]);

  const deviceTypes = Object.entries(deviceTypeLabels).map(
    ([value, label]) => ({ value, label }),
  );
  const statuses = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
  ];

  // Get zones for filtering
  const availableZones = React.useMemo(() => {
    if (selectedSiteId) {
      return getZonesForSite(selectedSiteId);
    }
    return zones;
  }, [selectedSiteId, zones, getZonesForSite]);

  // Get zone name by ID
  const getZoneName = React.useCallback(
    (zoneId: string | null) => {
      if (!zoneId) return "Unassigned";
      const zone = zones.find((z) => z.id === zoneId);
      return zone?.name || "Unknown";
    },
    [zones],
  );

  // Get zone with type for display
  const getZoneDisplay = React.useCallback(
    (zoneId: string | null) => {
      if (!zoneId) return { name: "Unassigned", type: null };
      const zone = zones.find((z) => z.id === zoneId);
      return zone
        ? { name: zone.name, type: zone.type }
        : { name: "Unknown", type: null };
    },
    [zones],
  );

  // Get site name by ID
  const getSiteName = React.useCallback(
    (siteId: string) => {
      const site = sites.find((s) => s.id === siteId);
      return site?.name || "Unknown";
    },
    [sites],
  );

  const columns = React.useMemo<ColumnDef<Device>[]>(
    () => [
      {
        id: "device",
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Device
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <DeviceTypeIcon
                type={row.original.type}
                className="h-4 w-4 text-blue-600"
              />
            </div>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">
                {deviceTypeLabels[row.original.type]}
              </div>
            </div>
          </div>
        ),
        size: 250,
      },
      {
        id: "site",
        accessorKey: "siteId",
        header: "Site",
        cell: ({ row }) => (
          <span className="text-sm">{getSiteName(row.original.siteId)}</span>
        ),
        size: 150,
      },
      {
        id: "zone",
        accessorKey: "zoneId",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Zone
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const zoneInfo = getZoneDisplay(row.original.zoneId);
          const isUnassigned = !row.original.zoneId;
          return (
            <div className="flex items-center gap-1">
              {isUnassigned && <MapPin className="h-3 w-3 text-orange-500" />}
              <span
                className={cn(
                  "text-sm",
                  isUnassigned && "text-orange-600 font-medium",
                )}
              >
                {zoneInfo.name}
              </span>
              {zoneInfo.type && (
                <span className="text-xs text-muted-foreground">
                  ({ZONE_TYPE_LABELS[zoneInfo.type]})
                </span>
              )}
            </div>
          );
        },
        size: 180,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => <StatusIndicator status={row.original.status} />,
        size: 100,
      },
      {
        id: "battery",
        accessorKey: "batteryLevel",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Battery
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <BatteryIndicator level={row.original.batteryLevel} />
        ),
        size: 100,
      },
      {
        id: "lastSeen",
        accessorKey: "lastSeen",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Seen
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(row.original.lastSeen, { addSuffix: true })}
          </span>
        ),
        sortingFn: (a, b) =>
          a.original.lastSeen.getTime() - b.original.lastSeen.getTime(),
        size: 130,
      },
      {
        id: "serial",
        accessorKey: "serialNumber",
        header: "Serial",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.serialNumber}
          </span>
        ),
        size: 120,
      },
      {
        id: "firmware",
        accessorKey: "firmwareVersion",
        header: "Firmware",
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {row.original.firmwareVersion}
          </span>
        ),
        size: 100,
      },
    ],
    [getSiteName, getZoneDisplay],
  );

  // Filter devices
  const filteredDevices = React.useMemo(() => {
    let result = selectedSiteId ? getDevicesForSite(selectedSiteId) : devices;

    if (filters.type) {
      result = result.filter((d) => d.type === filters.type);
    }
    if (filters.status) {
      result = result.filter((d) => d.status === filters.status);
    }
    if (filters.zone === "unassigned") {
      result = result.filter((d) => !d.zoneId);
    } else if (filters.zone) {
      result = result.filter((d) => d.zoneId === filters.zone);
    }
    if (globalFilter) {
      const query = globalFilter.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.serialNumber.toLowerCase().includes(query) ||
          d.macAddress.toLowerCase().includes(query),
      );
    }

    return result;
  }, [devices, selectedSiteId, filters, globalFilter, getDevicesForSite]);

  const table = useReactTable({
    data: filteredDevices,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setGlobalFilter("");
    setSearchDebounce("");
  };

  const handleExport = (format: "csv" | "json") => {
    const data = filteredDevices;

    if (format === "csv") {
      const headers = [
        "Name",
        "Type",
        "Site",
        "Zone",
        "Status",
        "Battery",
        "Serial",
        "MAC",
        "Firmware",
      ];
      const rows = data.map((d) => [
        d.name,
        deviceTypeLabels[d.type],
        getSiteName(d.siteId),
        getZoneName(d.zoneId),
        d.status,
        d.batteryLevel ?? "N/A",
        d.serialNumber,
        d.macAddress,
        d.firmwareVersion,
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zezamii-devices-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else if (format === "json") {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zezamii-devices-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
  };

  const handleRowClick = (device: Device) => {
    setSelectedDeviceForDrawer(device);
    selectDevice(device.id);
    setDrawerOpen(true);
  };

  const handleAddDevice = () => {
    if (
      !newDeviceForm.name ||
      !newDeviceForm.siteId ||
      !newDeviceForm.serialNumber
    )
      return;

    addDevice({
      name: newDeviceForm.name,
      type: newDeviceForm.type,
      siteId: newDeviceForm.siteId,
      zoneId: newDeviceForm.zoneId || null,
      status: "offline",
      lastSeen: new Date(),
      macAddress:
        newDeviceForm.macAddress ||
        `AA:BB:CC:${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      serialNumber: newDeviceForm.serialNumber,
      firmwareVersion: "1.0.0",
    });

    setNewDeviceForm({
      name: "",
      type: "digital-lock",
      siteId: selectedSiteId || sites[0]?.id || "",
      zoneId: "",
      macAddress: "",
      serialNumber: "",
    });
    setAddDeviceModalOpen(false);
  };

  const handleAssignZone = (zoneId: string | null) => {
    if (selectedDeviceForDrawer) {
      assignDeviceToZone(selectedDeviceForDrawer.id, zoneId);
      setSelectedDeviceForDrawer({ ...selectedDeviceForDrawer, zoneId });
    }
  };

  const availableColumns = columns.map((col) => ({
    id: col.id as string,
    label: typeof col.header === "string" ? col.header : (col.id as string),
  }));

  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility({
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    });
  };

  // Zones for the device's site in the drawer
  const drawerZones = React.useMemo(() => {
    if (!selectedDeviceForDrawer) return [];
    return getZonesForSite(selectedDeviceForDrawer.siteId);
  }, [selectedDeviceForDrawer, getZonesForSite]);

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, serial, or MAC..."
                  value={searchDebounce}
                  onChange={(e) => setSearchDebounce(e.target.value)}
                  className="pl-9"
                />
                {searchDebounce && (
                  <button
                    onClick={() => setSearchDebounce("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  handleFilterChange("type", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.zone || "all"}
                onValueChange={(value) =>
                  handleFilterChange("zone", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {availableZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Column Visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={columnVisibility[column.id] !== false}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Device Button */}
              <Button onClick={() => setAddDeviceModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>

            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                  active
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No devices found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors cursor-pointer",
                      selectedDeviceId === row.original.id && "bg-indigo-50",
                    )}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Detail Drawer */}
      {selectedDeviceForDrawer && (
        <Sheet
          open={drawerOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDrawerOpen(false);
              selectDevice(null);
            }
          }}
        >
          <SheetContent side="right" className="w-full sm:max-w-[480px]">
            <SheetHeader>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DeviceTypeIcon
                    type={selectedDeviceForDrawer.type}
                    className="h-6 w-6 text-blue-600"
                  />
                </div>
                <div className="flex-1">
                  <SheetTitle>{selectedDeviceForDrawer.name}</SheetTitle>
                  <SheetDescription>
                    {deviceTypeLabels[selectedDeviceForDrawer.type]}
                  </SheetDescription>
                </div>
                <StatusIndicator status={selectedDeviceForDrawer.status} />
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Device Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Device Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Serial Number
                    </p>
                    <p className="font-mono">
                      {selectedDeviceForDrawer.serialNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">MAC Address</p>
                    <p className="font-mono">
                      {selectedDeviceForDrawer.macAddress}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">Firmware</p>
                    <p className="font-mono">
                      {selectedDeviceForDrawer.firmwareVersion}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground">Battery</p>
                    <BatteryIndicator
                      level={selectedDeviceForDrawer.batteryLevel}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Location</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Site: </span>
                    <span className="font-medium">
                      {getSiteName(selectedDeviceForDrawer.siteId)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Assigned Zone</Label>
                    <Select
                      value={selectedDeviceForDrawer.zoneId || "unassigned"}
                      onValueChange={(value) =>
                        handleAssignZone(value === "unassigned" ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {drawerZones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name} ({ZONE_TYPE_LABELS[zone.type]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!selectedDeviceForDrawer.zoneId && (
                      <p className="text-xs text-orange-600">
                        This device is not assigned to a zone. Assign it to
                        appear on the floor plan.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Last Seen */}
              <div className="text-sm text-muted-foreground">
                Last seen:{" "}
                {formatDistanceToNow(selectedDeviceForDrawer.lastSeen, {
                  addSuffix: true,
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Add Device Modal */}
      <Sheet open={addDeviceModalOpen} onOpenChange={setAddDeviceModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Add New Device</SheetTitle>
            <SheetDescription>
              Register a new device to the system. You can assign it to a space
              now or later.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Device Name *</Label>
              <Input
                placeholder="e.g., Main Entrance Lock"
                value={newDeviceForm.name}
                onChange={(e) =>
                  setNewDeviceForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Device Type *</Label>
              <Select
                value={newDeviceForm.type}
                onValueChange={(value) =>
                  setNewDeviceForm((prev) => ({
                    ...prev,
                    type: value as Device["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serial Number *</Label>
              <Input
                placeholder="e.g., ZEZ-DL-001"
                value={newDeviceForm.serialNumber}
                onChange={(e) =>
                  setNewDeviceForm((prev) => ({
                    ...prev,
                    serialNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>MAC Address</Label>
              <Input
                placeholder="e.g., AA:BB:CC:DD:EE:FF"
                value={newDeviceForm.macAddress}
                onChange={(e) =>
                  setNewDeviceForm((prev) => ({
                    ...prev,
                    macAddress: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Site *</Label>
              <Select
                value={newDeviceForm.siteId}
                onValueChange={(value) =>
                  setNewDeviceForm((prev) => ({
                    ...prev,
                    siteId: value,
                    zoneId: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zone (Optional)</Label>
              <Select
                value={newDeviceForm.zoneId || "none"}
                onValueChange={(value) =>
                  setNewDeviceForm((prev) => ({
                    ...prev,
                    zoneId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Assign Later (Unplaced)</SelectItem>
                  {newDeviceForm.siteId &&
                    getZonesForSite(newDeviceForm.siteId).map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name} ({ZONE_TYPE_LABELS[zone.type]})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If not assigned, the device will appear in the Unplaced Devices
                sidebar.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAddDeviceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddDevice}
                disabled={
                  !newDeviceForm.name ||
                  !newDeviceForm.siteId ||
                  !newDeviceForm.serialNumber
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
