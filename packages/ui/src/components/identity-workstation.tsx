"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { StatusBadge } from "./status-badge";
import { CredentialIcons } from "./credential-icons";
import { BehavioralSparkline } from "./behavioral-sparkline";
import { WorkstationToolbar } from "./workstation-toolbar";
import { ActivityDrawer, type User } from "./activity-drawer";
import type { ActivityEvent } from "./activity-timeline";
import {
  AccessIcon,
  LockersIcon,
  RoomsIcon,
  BookingsIcon,
  VisionIcon,
} from "./product-icons";

export interface IdentityWorkstationUser extends User {
  credentials: {
    mobile: boolean;
    pin: boolean;
    card: boolean;
    qr?: boolean;
  };
  activitySparkline: number[]; // 7-day activity counts
  lastEvent?: {
    type: "access" | "rooms" | "lockers" | "bookings" | "vision";
    action: string;
    timestamp: Date;
  };
}

export interface IdentityWorkstationProps {
  users: IdentityWorkstationUser[];
  onUserClick?: (userId: string) => void;
  loading?: boolean;
  className?: string;
  // Activity drawer props
  selectedUserId?: string | null;
  activityEvents?: ActivityEvent[];
  activityLoading?: boolean;
  onActivityLoadMore?: () => void;
  activityHasMore?: boolean;
}

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

export function IdentityWorkstation({
  users,
  onUserClick,
  loading = false,
  className,
  selectedUserId,
  activityEvents = [],
  activityLoading = false,
  onActivityLoadMore,
  activityHasMore = false,
}: IdentityWorkstationProps) {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Filter state
  const [filters, setFilters] = React.useState<{
    team?: string;
    role?: string;
    status?: string;
  }>({});

  // Drawer state
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [internalSelectedUserId, setInternalSelectedUserId] = React.useState<string | null>(null);

  // Use controlled selectedUserId if provided, otherwise use internal state
  const effectiveSelectedUserId = selectedUserId ?? internalSelectedUserId;

  // Sync drawer open state with selected user
  React.useEffect(() => {
    if (effectiveSelectedUserId) {
      setDrawerOpen(true);
    }
  }, [effectiveSelectedUserId]);

  // Get unique values for filters
  const teams = React.useMemo(
    () => Array.from(new Set(users.map((u) => u.team))).sort(),
    [users]
  );
  const roles = React.useMemo(
    () => Array.from(new Set(users.map((u) => u.role))).sort(),
    [users]
  );
  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  // Define columns
  const columns = React.useMemo<ColumnDef<IdentityWorkstationUser>[]>(
    () => [
      {
        id: "user",
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-gray-900"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              User
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.avatar} />
              <AvatarFallback className="text-xs font-semibold">
                {row.original.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        ),
        size: 250,
      },
      {
        id: "team",
        accessorKey: "team",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-gray-900"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Team
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        size: 150,
      },
      {
        id: "role",
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-gray-900"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Role
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        size: 150,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => {
          return (
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
          );
        },
        cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
        size: 120,
      },
      {
        id: "credentials",
        header: "Credentials",
        cell: ({ row }) => <CredentialIcons credentials={row.original.credentials} />,
        size: 150,
      },
      {
        id: "activity",
        header: "Activity (7d)",
        cell: ({ row }) => <BehavioralSparkline data={row.original.activitySparkline} />,
        size: 120,
      },
      {
        id: "lastEvent",
        header: ({ column }) => {
          return (
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
          );
        },
        cell: ({ row }) => {
          const event = row.original.lastEvent;
          if (!event) {
            return <span className="text-muted-foreground text-xs">No activity</span>;
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
        size: 200,
      },
    ],
    []
  );

  // Apply custom filters
  const filteredUsers = React.useMemo(() => {
    let result = users;

    if (filters.team) {
      result = result.filter((u) => u.team === filters.team);
    }
    if (filters.role) {
      result = result.filter((u) => u.role === filters.role);
    }
    if (filters.status) {
      result = result.filter((u) => u.status === filters.status);
    }
    if (globalFilter) {
      const query = globalFilter.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.team.toLowerCase().includes(query)
      );
    }

    return result;
  }, [users, filters, globalFilter]);

  // Table instance
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Calculate active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Handle filter change
  const handleFilterChange = (key: string, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setGlobalFilter("");
  };

  // Handle export
  const handleExport = (format: "csv" | "json") => {
    const data = filteredUsers;

    if (format === "csv") {
      const headers = [
        "Name",
        "Email",
        "Team",
        "Role",
        "Status",
        "Mobile",
        "PIN",
        "Card",
        "QR",
        "Last Event",
        "Last Event Time",
      ];
      const rows = data.map((u) => [
        u.name,
        u.email,
        u.team,
        u.role,
        u.status,
        u.credentials.mobile,
        u.credentials.pin,
        u.credentials.card,
        u.credentials.qr || false,
        u.lastEvent?.action || "",
        u.lastEvent?.timestamp.toISOString() || "",
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zezamii-users-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else if (format === "json") {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zezamii-users-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
  };

  // Handle row click
  const handleRowClick = (userId: string) => {
    if (selectedUserId === undefined) {
      // Uncontrolled mode
      setInternalSelectedUserId(userId);
    }
    onUserClick?.(userId);
  };

  // Get selected user
  const selectedUser = users.find((u) => u.id === effectiveSelectedUserId);

  // Available columns for visibility toggle
  const availableColumns = columns.map((col) => ({
    id: col.id as string,
    label: typeof col.header === "string" ? col.header : (col.id as string),
  }));

  return (
    <div className={cn("bg-white rounded-lg border shadow-sm", className)}>
      {/* Toolbar */}
      <WorkstationToolbar
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        filters={filters}
        onFilterChange={handleFilterChange}
        teams={teams}
        roles={roles}
        statuses={statuses}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        availableColumns={availableColumns}
        onExport={handleExport}
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
      />

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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Activity Drawer */}
      {selectedUser && (
        <ActivityDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            if (selectedUserId === undefined) {
              setInternalSelectedUserId(null);
            }
          }}
          user={selectedUser}
          events={activityEvents}
          loading={activityLoading}
          onLoadMore={onActivityLoadMore}
          hasMore={activityHasMore}
        />
      )}
    </div>
  );
}
