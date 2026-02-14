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
  MapPin,
  Building2,
  Wifi,
  WifiOff,
  Plus,
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
  BehavioralSparkline,
  ActivityTimeline,
  type ActivityEvent,
} from "@repo/ui";
import {
  AccessIcon,
  LockersIcon,
  RoomsIcon,
  BookingsIcon,
  VisionIcon,
} from "@repo/ui/components/product-icons";
import { useSiteContext, type Site } from "@/contexts/site-context";

const productIconMap = {
  access: AccessIcon,
  rooms: RoomsIcon,
  lockers: LockersIcon,
  bookings: BookingsIcon,
  vision: VisionIcon,
};

const productColorMap = {
  access: "text-purple-500",
  rooms: "text-teal-500",
  lockers: "text-blue-500",
  bookings: "text-indigo-500",
  vision: "text-purple-400",
};

const statusColorMap = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  maintenance: "bg-yellow-500",
};

const statusTextMap = {
  online: "Online",
  offline: "Offline",
  maintenance: "Maintenance",
};

function SiteStatusBadge({ status }: { status: Site["status"] }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-2 h-2 rounded-full", statusColorMap[status])} />
      <span
        className={cn(
          "text-xs font-medium uppercase",
          status === "online" && "text-green-700",
          status === "offline" && "text-gray-500",
          status === "maintenance" && "text-yellow-700",
        )}
      >
        {statusTextMap[status]}
      </span>
    </div>
  );
}

// Mock activity events generator
function generateMockActivity(siteId: string): ActivityEvent[] {
  const types: Array<
    "access" | "rooms" | "lockers" | "bookings" | "vision" | "cloud"
  > = ["access", "rooms", "lockers", "bookings", "vision", "cloud"];

  const actions = {
    access: [
      "Door unlocked",
      "Door locked",
      "Access denied",
      "Visitor checked in",
    ],
    rooms: ["Room booked", "Room released", "Meeting started", "Meeting ended"],
    lockers: [
      "Locker accessed",
      "Locker assigned",
      "Locker released",
      "Item stored",
    ],
    bookings: [
      "Desk reserved",
      "Desk released",
      "Parking booked",
      "Resource allocated",
    ],
    vision: [
      "Motion detected",
      "Camera online",
      "Recording started",
      "Alert triggered",
    ],
    cloud: [
      "Config updated",
      "Firmware upgraded",
      "Device synced",
      "Backup completed",
    ],
  };

  const zones = [
    "Main Entrance",
    "Floor 1",
    "Floor 2",
    "Parking",
    "Reception",
    "Server Room",
  ];
  const devices = [
    "Door Controller 01",
    "Card Reader 05",
    "Camera 12",
    "Locker Panel A",
    "Kiosk 3",
  ];

  const events: ActivityEvent[] = [];

  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)] ?? "access";
    const typeActions = actions[type];
    const action =
      typeActions[Math.floor(Math.random() * typeActions.length)] ??
      "Access granted";
    const hoursAgo = Math.floor(Math.random() * 24 * 7);

    events.push({
      id: `${siteId}-event-${i}`,
      type,
      action,
      description: `${action} at site`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo),
      location:
        Math.random() > 0.5
          ? zones[Math.floor(Math.random() * zones.length)]
          : undefined,
      device:
        Math.random() > 0.5
          ? devices[Math.floor(Math.random() * devices.length)]
          : undefined,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default function SitesPage() {
  const { sites, selectedSiteId, addSite } = useSiteContext();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [searchDebounce, setSearchDebounce] = React.useState("");
  const [filters, setFilters] = React.useState<{
    region?: string;
    type?: string;
    status?: string;
  }>({});

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedSiteForDrawer, setSelectedSiteForDrawer] =
    React.useState<Site | null>(null);
  const [activityEvents, setActivityEvents] = React.useState<ActivityEvent[]>(
    [],
  );
  const [activityLoading, setActivityLoading] = React.useState(false);

  const [addSiteModalOpen, setAddSiteModalOpen] = React.useState(false);
  const [newSiteForm, setNewSiteForm] = React.useState({
    name: "",
    address: "",
    region: "APAC",
    type: "Office",
  });

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchDebounce);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const regions = React.useMemo(
    () => Array.from(new Set(sites.map((s) => s.region))).sort(),
    [sites],
  );
  const types = React.useMemo(
    () => Array.from(new Set(sites.map((s) => s.type))).sort(),
    [sites],
  );
  const statuses = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const columns = React.useMemo<ColumnDef<Site>[]>(
    () => [
      {
        id: "site",
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Site
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
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {row.original.address}
              </div>
            </div>
          </div>
        ),
        size: 280,
      },
      {
        id: "region",
        accessorKey: "region",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Region
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        size: 120,
      },
      {
        id: "type",
        accessorKey: "type",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        size: 100,
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
        cell: ({ row }) => <SiteStatusBadge status={row.original.status} />,
        size: 120,
      },
      {
        id: "devices",
        accessorKey: "devicesCount",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Devices
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
          <div className="flex items-center gap-2">
            {row.original.status === "online" ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-medium">{row.original.devicesCount}</span>
          </div>
        ),
        size: 100,
      },
      {
        id: "zones",
        accessorKey: "zonesCount",
        header: "Zones",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.zonesCount}</span>
        ),
        size: 80,
      },
      {
        id: "activity",
        header: "Activity (7d)",
        cell: ({ row }) => (
          <BehavioralSparkline data={row.original.activitySparkline} />
        ),
        size: 120,
      },
      {
        id: "lastEvent",
        header: ({ column }) => (
          <button
            className="flex items-center gap-2 hover:text-gray-900"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Event
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
          const event = row.original.lastEvent;
          if (!event) {
            return (
              <span className="text-muted-foreground text-xs">No activity</span>
            );
          }

          const Icon = productIconMap[event.type];
          const colorClass = productColorMap[event.type];

          return (
            <div className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4", colorClass)} />
              <div>
                <div className="text-xs font-medium">{event.action}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </div>
              </div>
            </div>
          );
        },
        sortingFn: (a, b) => {
          const aTime = a.original.lastEvent?.timestamp.getTime() || 0;
          const bTime = b.original.lastEvent?.timestamp.getTime() || 0;
          return aTime - bTime;
        },
        size: 180,
      },
    ],
    [],
  );

  // Filter sites based on selected site context and local filters
  const filteredSites = React.useMemo(() => {
    let result = selectedSiteId
      ? sites.filter((s) => s.id === selectedSiteId)
      : sites;

    if (filters.region) {
      result = result.filter((s) => s.region === filters.region);
    }
    if (filters.type) {
      result = result.filter((s) => s.type === filters.type);
    }
    if (filters.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (globalFilter) {
      const query = globalFilter.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.region.toLowerCase().includes(query),
      );
    }

    return result;
  }, [sites, selectedSiteId, filters, globalFilter]);

  const table = useReactTable({
    data: filteredSites,
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
    const data = filteredSites;

    if (format === "csv") {
      const headers = [
        "Name",
        "Address",
        "Region",
        "Type",
        "Status",
        "Devices",
        "Zones",
      ];
      const rows = data.map((s) => [
        s.name,
        s.address,
        s.region,
        s.type,
        s.status,
        s.devicesCount,
        s.zonesCount,
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zezamii-sites-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else if (format === "json") {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zezamii-sites-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
  };

  const handleRowClick = (site: Site) => {
    setSelectedSiteForDrawer(site);
    setActivityLoading(true);
    setDrawerOpen(true);

    // Simulate API call
    setTimeout(() => {
      setActivityEvents(generateMockActivity(site.id));
      setActivityLoading(false);
    }, 500);
  };

  const handleAddSite = () => {
    if (!newSiteForm.name || !newSiteForm.address) return;

    addSite({
      name: newSiteForm.name,
      address: newSiteForm.address,
      region: newSiteForm.region,
      type: newSiteForm.type,
      status: "online",
      activitySparkline: [0, 0, 0, 0, 0, 0, 0],
    });

    setNewSiteForm({ name: "", address: "", region: "APAC", type: "Office" });
    setAddSiteModalOpen(false);
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
                  placeholder="Search by name, address, or region..."
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
                value={filters.region || "all"}
                onValueChange={(value) =>
                  handleFilterChange("region", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.type || "all"}
                onValueChange={(value) =>
                  handleFilterChange("type", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                <SelectTrigger className="w-[150px]">
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

              {/* Add Site Button */}
              <Button onClick={() => setAddSiteModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Site
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

                <div className="flex items-center gap-2">
                  {filters.region && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                      <span className="text-muted-foreground">Region:</span>
                      <span className="font-medium">{filters.region}</span>
                      <button
                        onClick={() => handleFilterChange("region", null)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.type && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{filters.type}</span>
                      <button
                        onClick={() => handleFilterChange("type", null)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.status && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium capitalize">
                        {filters.status}
                      </span>
                      <button
                        onClick={() => handleFilterChange("status", null)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
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
                    No sites found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
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

      {/* Site Detail Drawer */}
      {selectedSiteForDrawer && (
        <Sheet
          open={drawerOpen}
          onOpenChange={(open) => !open && setDrawerOpen(false)}
        >
          <SheetContent side="right" className="w-full sm:max-w-[560px] p-0">
            <div className="flex flex-col h-full">
              <div className="border-b border-gray-200 p-6">
                <SheetHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <SheetTitle className="text-xl mb-1">
                        {selectedSiteForDrawer.name}
                      </SheetTitle>
                      <SheetDescription className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedSiteForDrawer.address}
                      </SheetDescription>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{selectedSiteForDrawer.region}</span>
                        <span>•</span>
                        <span>{selectedSiteForDrawer.type}</span>
                        <span>•</span>
                        <SiteStatusBadge
                          status={selectedSiteForDrawer.status}
                        />
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Site Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Devices
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedSiteForDrawer.devicesCount}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Zones
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedSiteForDrawer.zonesCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Activity Timeline
                  </h3>
                  <ActivityTimeline
                    events={activityEvents}
                    loading={activityLoading}
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Add Site Modal */}
      <Sheet open={addSiteModalOpen} onOpenChange={setAddSiteModalOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>Add New Site</SheetTitle>
            <SheetDescription>
              Create a new site to manage devices and zones. A default
              &quot;Common Area&quot; zone will be automatically created.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name *</label>
              <Input
                placeholder="e.g., Sydney Headquarters"
                value={newSiteForm.name}
                onChange={(e) =>
                  setNewSiteForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address *</label>
              <Input
                placeholder="e.g., 123 George Street, Sydney NSW 2000"
                value={newSiteForm.address}
                onChange={(e) =>
                  setNewSiteForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select
                value={newSiteForm.region}
                onValueChange={(value) =>
                  setNewSiteForm((prev) => ({ ...prev, region: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APAC">APAC</SelectItem>
                  <SelectItem value="EMEA">EMEA</SelectItem>
                  <SelectItem value="Americas">Americas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Site Type</label>
              <Select
                value={newSiteForm.type}
                onValueChange={(value) =>
                  setNewSiteForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Data Center">Data Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAddSiteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddSite}
                disabled={!newSiteForm.name || !newSiteForm.address}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Site
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
