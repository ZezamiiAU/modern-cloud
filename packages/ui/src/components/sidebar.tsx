"use client";

/**
 * Sidebar - Client Component
 *
 * This is the ONLY client component in the shell.
 * It handles the collapse state interaction.
 */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Icon, type IconName } from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export interface SidebarProps {
  title?: string;
  subtitle?: string;
  navItems: NavItem[];
  user?: {
    name: string;
    email: string;
    initials?: string;
  };
}

export function Sidebar({ title, subtitle, navItems, user }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
            Z
          </div>
          {!collapsed && title && (
            <div className="overflow-hidden">
              <p className="font-semibold text-sm">{title}</p>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon name={item.icon} className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="w-4 h-4" />
      </button>

      {/* User */}
      {user && (
        <div className="p-3 border-t border-slate-700">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs shrink-0">
              {user.initials || user.name.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
