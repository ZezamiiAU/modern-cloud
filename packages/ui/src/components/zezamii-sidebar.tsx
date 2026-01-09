"use client";

/**
 * Zezamii Multi-Product Sidebar
 *
 * Features:
 * - Product switcher with auto-detection
 * - Product-specific navigation
 * - Global sections (Cloud, Devices, Insights, Admin)
 * - Collapsible sections
 * - Sidebar collapse/expand
 * - Product-specific colors and active states
 */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Building2,
  Shield,
  Bell,
  Lock,
  CreditCard,
  Wifi,
  Radio,
  Activity,
  FileText,
  BarChart3,
  Settings,
  DollarSign,
  Package,
  Calendar,
  AlertTriangle,
  KeyRound,
  ClipboardList,
  ShieldCheck,
  Car,
  PersonStanding,
  CalendarClock,
  Video,
  Inbox,
  Boxes,
  DoorOpen,
} from "lucide-react";
import {
  CloudIcon,
  AccessIcon,
  LockersIcon,
  RoomsIcon,
  BookingsIcon,
  VisionIcon,
} from "./product-icons";

// Product definitions
type ProductSlug = "cloud" | "access" | "lockers" | "rooms" | "bookings" | "vision";

interface Product {
  slug: ProductSlug;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // Tailwind color class
  defaultRoute: string;
}

const PRODUCTS: Product[] = [
  {
    slug: "cloud",
    name: "Zezamii Cloud",
    icon: CloudIcon,
    color: "text-gray-400",
    defaultRoute: "/dashboard/people",
  },
  {
    slug: "access",
    name: "Zezamii Access",
    icon: AccessIcon,
    color: "text-cyan-500",
    defaultRoute: "/access/permissions",
  },
  {
    slug: "lockers",
    name: "Zezamii Lockers",
    icon: LockersIcon,
    color: "text-emerald-500",
    defaultRoute: "/lockers/manager",
  },
  {
    slug: "rooms",
    name: "Zezamii Rooms",
    icon: RoomsIcon,
    color: "text-orange-500",
    defaultRoute: "/rooms/manager",
  },
  {
    slug: "bookings",
    name: "Zezamii Bookings",
    icon: BookingsIcon,
    color: "text-indigo-400",
    defaultRoute: "/bookings/dashboard",
  },
  {
    slug: "vision",
    name: "Zezamii Vision",
    icon: VisionIcon,
    color: "text-purple-400",
    defaultRoute: "/vision/feeds",
  },
];

// Navigation item types
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultExpanded?: boolean;
}

// Product-specific navigation
const PRODUCT_NAV: Record<ProductSlug, NavItem[]> = {
  cloud: [],
  access: [
    { label: "Permissions", href: "/access/permissions", icon: ShieldCheck },
    { label: "Passes", href: "/access/passes", icon: CreditCard },
    { label: "Schedules", href: "/access/schedules", icon: CalendarClock },
    { label: "Lockdown", href: "/access/lockdown", icon: AlertTriangle },
    { label: "Credentials", href: "/access/credentials", icon: KeyRound },
  ],
  lockers: [
    { label: "Lockers", href: "/lockers/manager", icon: Boxes },
    { label: "People", href: "/lockers/people", icon: Users },
    { label: "Lockers Settings", href: "/lockers/schedule", icon: Settings },
  ],
  rooms: [
    { label: "Rooms", href: "/rooms/manager", icon: DoorOpen },
    { label: "Guests", href: "/rooms/guests", icon: PersonStanding },
    { label: "Reservations", href: "/rooms/reservations", icon: Inbox },
    { label: "Access Control", href: "/rooms/access-control", icon: ShieldCheck },
    { label: "LPR Actions", href: "/rooms/lpr-actions", icon: Car },
  ],
  bookings: [
    { label: "Dashboard", href: "/bookings/dashboard", icon: BarChart3 },
    { label: "Bookings", href: "/bookings/bookings", icon: ClipboardList },
    { label: "Resources", href: "/bookings/resources", icon: Package },
    { label: "Calendar View", href: "/bookings/calendar", icon: Calendar },
  ],
  vision: [
    { label: "Live Feeds", href: "/vision/feeds", icon: Video },
    { label: "AI Alerts", href: "/vision/alerts", icon: Bell },
  ],
};

// Product settings navigation
const PRODUCT_SETTINGS: Partial<Record<ProductSlug, NavItem>> = {
  access: { label: "Access Settings", href: "/access/settings", icon: Settings },
  lockers: { label: "Lockers Settings", href: "/lockers/settings", icon: Settings },
  rooms: { label: "Rooms Settings", href: "/rooms/settings", icon: Settings },
  bookings: { label: "Bookings Settings", href: "/bookings/settings", icon: Settings },
  vision: { label: "Vision Settings", href: "/vision/settings", icon: Settings },
};

// Global navigation sections
const GLOBAL_SECTIONS: NavSection[] = [
  {
    title: "Cloud (Global)",
    defaultExpanded: true,
    items: [
      { label: "People", href: "/dashboard/people", icon: Users },
      { label: "Spaces", href: "/cloud/spaces", icon: Building2 },
      { label: "Access Spaces", href: "/cloud/access-spaces", icon: Shield },
      { label: "Alerts", href: "/cloud/alerts", icon: Bell },
    ],
  },
  {
    title: "Devices",
    defaultExpanded: false,
    items: [
      { label: "Digital Locks", href: "/devices/digital-locks", icon: Lock },
      { label: "Access Readers", href: "/devices/access-readers", icon: Radio },
      { label: "Gateways", href: "/devices/gateways", icon: Wifi },
      { label: "Sensors", href: "/devices/sensors", icon: Activity, disabled: true, badge: "Coming Soon" },
      { label: "Controllers", href: "/devices/controllers", icon: Activity, disabled: true, badge: "Coming Soon" },
    ],
  },
  {
    title: "Insights",
    defaultExpanded: false,
    items: [
      { label: "Events", href: "/insights/events", icon: Bell },
      { label: "Audit Trail", href: "/insights/audit-trail", icon: FileText },
      { label: "Insights", href: "/insights", icon: BarChart3 },
    ],
  },
  {
    title: "Admin",
    defaultExpanded: false,
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Billing", href: "/admin/billing", icon: DollarSign },
    ],
  },
];

// Detect current product from pathname
function detectProduct(pathname: string): ProductSlug {
  if (pathname.startsWith("/access")) return "access";
  if (pathname.startsWith("/lockers")) return "lockers";
  if (pathname.startsWith("/rooms")) return "rooms";
  if (pathname.startsWith("/bookings")) return "bookings";
  if (pathname.startsWith("/vision")) return "vision";
  return "cloud";
}

// Get product color class
function getProductColorClass(product: ProductSlug): string {
  const productConfig = PRODUCTS.find(p => p.slug === product);
  return productConfig?.color || "text-gray-600";
}

// Get product accent color for borders and glows
function getProductAccentClass(product: ProductSlug): string {
  const colorMap: Record<ProductSlug, string> = {
    cloud: "border-gray-500 shadow-gray-500/50",
    access: "border-cyan-500 shadow-cyan-500/50",
    lockers: "border-emerald-500 shadow-emerald-500/50",
    rooms: "border-orange-500 shadow-orange-500/50",
    bookings: "border-indigo-500 shadow-indigo-500/50",
    vision: "border-purple-500 shadow-purple-500/50",
  };
  return colorMap[product] || "border-gray-500 shadow-gray-500/50";
}

export interface ZezamiiSidebarProps {
  user?: {
    name: string;
    email: string;
    initials?: string;
  };
  onLogout?: () => void;
}

export function ZezamiiSidebar({ user, onLogout }: ZezamiiSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    GLOBAL_SECTIONS.forEach(section => {
      initial[section.title] = section.defaultExpanded ?? false;
    });
    return initial;
  });

  const pathname = usePathname();
  const currentProduct = detectProduct(pathname);
  const currentProductConfig = PRODUCTS.find(p => p.slug === currentProduct);
  const productNavItems = PRODUCT_NAV[currentProduct];
  const productSettings = PRODUCT_SETTINGS[currentProduct];

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={cn(
        "bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 h-screen",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Product Switcher */}
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <button
            onClick={() => !collapsed && setProductDropdownOpen(!productDropdownOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg border-2 transition-all",
              "hover:bg-slate-800",
              getProductAccentClass(currentProduct),
              collapsed && "justify-center p-2"
            )}
            style={{
              boxShadow: collapsed ? "none" : `0 0 12px ${getProductAccentClass(currentProduct).split(" ")[1]}`,
            }}
          >
            {currentProductConfig && (
              <currentProductConfig.icon className={cn("w-5 h-5 shrink-0", currentProductConfig.color)} />
            )}
            {!collapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">{currentProductConfig?.name}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", productDropdownOpen && "rotate-180")} />
              </>
            )}
          </button>

          {/* Product Dropdown */}
          {productDropdownOpen && !collapsed && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              {PRODUCTS.map(product => (
                <Link
                  key={product.slug}
                  href={product.defaultRoute}
                  prefetch={true}
                  onClick={() => setProductDropdownOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors",
                    product.slug === currentProduct && "bg-slate-700"
                  )}
                >
                  <product.icon className={cn("w-4 h-4", product.color)} />
                  <span className="text-sm text-white">{product.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Product-Specific Navigation */}
        {productNavItems.length > 0 && (
          <>
            {productNavItems.map(item => (
              <NavItemComponent
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                product={currentProduct}
              />
            ))}
            {!collapsed && <div className="border-t border-slate-700 my-2" />}
          </>
        )}

        {/* Product Settings */}
        {productSettings && (
          <>
            {!collapsed && <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase">Settings</div>}
            <NavItemComponent
              item={productSettings}
              pathname={pathname}
              collapsed={collapsed}
              product={currentProduct}
            />
            {!collapsed && <div className="border-t border-slate-700 my-2" />}
          </>
        )}

        {/* Global Sections */}
        {GLOBAL_SECTIONS.map(section => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase hover:text-white transition-colors"
              >
                <span>{section.title}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", expandedSections[section.title] && "rotate-180")} />
              </button>
            )}
            {(collapsed || expandedSections[section.title]) && (
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    product="cloud"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700">
        {/* User */}
        {user && (
          <div className="p-3 border-b border-slate-700 relative">
            <button
              onClick={() => !collapsed && setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "w-full flex items-center gap-2 hover:bg-slate-800 rounded-md p-1 -m-1 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user.initials || user.name.slice(0, 2).toUpperCase()}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
                </>
              )}
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors text-left rounded-lg"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
                  <span className="text-sm text-white">Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full p-3 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}

// Navigation Item Component
interface NavItemComponentProps {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  product: ProductSlug;
}

function NavItemComponent({ item, pathname, collapsed, product }: NavItemComponentProps) {
  const isActive = pathname === item.href;
  const IconComponent = item.icon;
  const productColor = getProductColorClass(product);

  if (item.disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm opacity-50 cursor-not-allowed",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.label : undefined}
      >
        <IconComponent className="w-4 h-4 text-slate-500 shrink-0" />
        {!collapsed && (
          <>
            <span className="text-slate-500 flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{item.badge}</span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all relative",
        isActive
          ? `bg-slate-800 text-white font-semibold border-l-3 ${productColor}`
          : "text-slate-300 hover:bg-slate-800 hover:text-white",
        collapsed && "justify-center px-2"
      )}
      style={
        isActive
          ? {
              borderLeftWidth: "3px",
              borderLeftColor: productColor.replace("text-", ""),
              boxShadow: `0 0 8px ${productColor.replace("text-", "").split("-")[0]}-500/30`,
            }
          : undefined
      }
    >
      <IconComponent className={cn("w-4 h-4 shrink-0", isActive && productColor)} />
      {!collapsed && <span className="flex-1">{item.label}</span>}
    </Link>
  );
}

