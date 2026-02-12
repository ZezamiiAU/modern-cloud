"use client";

import * as React from "react";
import {
  Search,
  Zap,
  HelpCircle,
  ChevronDown,
  Building2,
} from "lucide-react";
import { cn } from "../lib/utils";

export interface ZezamiiHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onSearch?: (query: string) => void;
  organizationName?: string;
  userName?: string;
  onOrganizationChange?: () => void;
  className?: string;
}

export const ZezamiiHeader = React.memo(function ZezamiiHeader({
  breadcrumbs = [],
  onSearch,
  organizationName = "Organization",
  onOrganizationChange,
  className,
}: ZezamiiHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      onSearch?.(e.target.value);
    },
    [onSearch]
  );

  return (
    <header
      className={cn(
        "h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white",
        className,
      )}
    >
      {/* Left Section: Breadcrumbs */}
      <div className="flex items-center gap-6">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.label}>
                {index > 0 && <span className="text-gray-400">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Center Section: Command Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search Zezamii... Ctrl + K"
            className={cn(
              "w-full h-9 pl-10 pr-20 rounded-lg border text-sm transition-all",
              "bg-white/50 placeholder:text-gray-400",
              isSearchFocused
                ? "border-purple-500 ring-2 ring-purple-500/20 bg-white"
                : "border-gray-200 hover:border-gray-300",
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section: Utility Group */}
      <div className="flex items-center gap-2">
        {/* Actions */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Quick Actions"
        >
          <Zap className="w-4 h-4" />
          <span>Actions</span>
        </button>

        {/* Support - Icon Only */}
        <button
          className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Organization Switcher */}
        <button
          onClick={onOrganizationChange}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <span className="hidden lg:inline">{organizationName}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </header>
  );
});
