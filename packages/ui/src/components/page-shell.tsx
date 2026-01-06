/**
 * PageShell - Server Component
 *
 * Layout wrapper with sidebar and header.
 * The Sidebar is a client island for interactivity.
 * Everything else renders on the server.
 */

import * as React from "react";
import { Sidebar, type NavItem } from "./sidebar";
import { Icon } from "./icons";

export type { NavItem } from "./sidebar";

export interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  navItems: NavItem[];
  user?: {
    name: string;
    email: string;
    initials?: string;
  };
  headerTitle?: string;
  showSearch?: boolean;
}

export function PageShell({
  children,
  title,
  subtitle,
  navItems,
  user,
  headerTitle = "Dashboard",
  showSearch = true,
}: PageShellProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Client island for sidebar interactivity */}
      <Sidebar
        title={title}
        subtitle={subtitle}
        navItems={navItems}
        user={user}
      />

      {/* Main area - Server rendered */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{headerTitle}</span>
          </div>
          {showSearch && (
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </header>

        {/* Content - Server rendered */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
