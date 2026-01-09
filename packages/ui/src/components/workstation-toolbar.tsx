"use client";

import * as React from "react";
import { Search, Download, Eye, X, Filter } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface WorkstationToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters: {
    team?: string;
    role?: string;
    status?: string;
  };
  onFilterChange: (key: string, value: string | null) => void;

  // Filter options
  teams: string[];
  roles: string[];
  statuses: Array<{ value: string; label: string }>;

  // Column Visibility
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columns: Record<string, boolean>) => void;
  availableColumns: Array<{ id: string; label: string }>;

  // Export
  onExport: (format: "csv" | "json") => void;
  exportLoading?: boolean;

  // Filter count
  activeFilterCount: number;
  onClearFilters: () => void;

  className?: string;
}

export function WorkstationToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search by name, email, or team...",
  filters,
  onFilterChange,
  teams,
  roles,
  statuses,
  columnVisibility,
  onColumnVisibilityChange,
  availableColumns,
  onExport,
  exportLoading = false,
  activeFilterCount,
  onClearFilters,
  className,
}: WorkstationToolbarProps) {
  const [searchDebounce, setSearchDebounce] = React.useState(searchValue);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchDebounce);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDebounce, onSearchChange]);

  // Sync external search value changes
  React.useEffect(() => {
    setSearchDebounce(searchValue);
  }, [searchValue]);

  const toggleColumnVisibility = (columnId: string) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    });
  };

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="px-6 py-4 space-y-4">
        {/* Main toolbar row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
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
            value={filters.team || "all"}
            onValueChange={(value) =>
              onFilterChange("team", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.role || "all"}
            onValueChange={(value) =>
              onFilterChange("role", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFilterChange("status", value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
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
              <Button variant="outline" size="sm" disabled={exportLoading}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("json")}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active filters row */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear all
            </Button>

            {/* Individual filter chips */}
            <div className="flex items-center gap-2">
              {filters.team && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-medium">{filters.team}</span>
                  <button
                    onClick={() => onFilterChange("team", null)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.role && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{filters.role}</span>
                  <button
                    onClick={() => onFilterChange("role", null)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {filters.status && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{filters.status}</span>
                  <button
                    onClick={() => onFilterChange("status", null)}
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
  );
}
