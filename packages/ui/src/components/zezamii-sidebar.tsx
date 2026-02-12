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
  Bell,
  CreditCard,
  Wifi,
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
  MapPin,
  Layers,
  Radar,
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
type ProductSlug =
  | "cloud"
  | "access"
  | "lockers"
  | "rooms"
  | "bookings"
  | "vision";

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
  children?: NavItem[];
}

interface NavSection {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
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
    {
      label: "Access Control",
      href: "/rooms/access-control",
      icon: ShieldCheck,
    },
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
  access: {
    label: "Access Settings",
    href: "/access/settings",
    icon: Settings,
  },
  lockers: {
    label: "Lockers Settings",
    href: "/lockers/settings",
    icon: Settings,
  },
  rooms: { label: "Rooms Settings", href: "/rooms/settings", icon: Settings },
  bookings: {
    label: "Bookings Settings",
    href: "/bookings/settings",
    icon: Settings,
  },
  vision: {
    label: "Vision Settings",
    href: "/vision/settings",
    icon: Settings,
  },
};

// Global navigation sections
const GLOBAL_SECTIONS: NavSection[] = [
  {
    title: "People",
    icon: Users,
    defaultExpanded: false,
    items: [
      { label: "People", href: "/dashboard/people", icon: Users },
      { label: "Teams", href: "/dashboard/teams", icon: Users },
      { label: "Guests", href: "/dashboard/guests", icon: PersonStanding },
    ],
  },
  {
    title: "Spaces",
    icon: MapPin,
    defaultExpanded: false,
    items: [
      { label: "Sites", href: "/spaces/sites", icon: MapPin },
      { label: "Floor Plan", href: "/spaces/floorplan", icon: Layers },
      { label: "Devices", href: "/spaces/devices", icon: Wifi },
      { label: "Spatial Insights", href: "/spatial-insights", icon: Radar },
    ],
  },
  {
    title: "Admin",
    icon: Settings,
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
  const productConfig = PRODUCTS.find((p) => p.slug === product);
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

export const ZezamiiSidebar = React.memo(function ZezamiiSidebar({ user, onLogout }: ZezamiiSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    GLOBAL_SECTIONS.forEach((section) => {
      initial[section.title] = section.defaultExpanded ?? false;
    });
    return initial;
  });

  const pathname = usePathname();

  // Memoize computed values to prevent recalculation on every render
  const currentProduct = React.useMemo(() => detectProduct(pathname), [pathname]);
  const currentProductConfig = React.useMemo(
    () => PRODUCTS.find((p) => p.slug === currentProduct),
    [currentProduct]
  );
  const productNavItems = PRODUCT_NAV[currentProduct];
  const productSettings = PRODUCT_SETTINGS[currentProduct];

  // Memoize toggle function
  const toggleSection = React.useCallback((title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  // Memoize collapse toggle
  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  // Memoize product dropdown toggle
  const toggleProductDropdown = React.useCallback(() => {
    setProductDropdownOpen((prev) => !prev);
  }, []);

  // Memoize user menu toggle
  const toggleUserMenu = React.useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  // Memoize close handlers
  const closeProductDropdown = React.useCallback(() => {
    setProductDropdownOpen(false);
  }, []);

  const closeUserMenuAndLogout = React.useCallback(() => {
    setUserMenuOpen(false);
    onLogout?.();
  }, [onLogout]);

  // Memoize accent class
  const productAccentClass = React.useMemo(
    () => getProductAccentClass(currentProduct),
    [currentProduct]
  );

  return (
    <aside
      className={cn(
        "bg-slate-900 text-white flex flex-col shrink-0 transition-[width] duration-200 h-screen",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Product Switcher */}
      <div className="p-3 border-b border-slate-700">
        <div className="relative">
          <button
            onClick={collapsed ? undefined : toggleProductDropdown}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg border-2 transition-colors",
              "hover:bg-slate-800",
              productAccentClass,
              collapsed && "justify-center p-2",
            )}
          >
            {currentProductConfig && (
              <currentProductConfig.icon
                className={cn("w-5 h-5 shrink-0", currentProductConfig.color)}
              />
            )}
            {!collapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-white">
                    {currentProductConfig?.name}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform",
                    productDropdownOpen && "rotate-180",
                  )}
                />
              </>
            )}
          </button>

          {/* Product Dropdown */}
          {productDropdownOpen && !collapsed && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              {PRODUCTS.map((product) => (
                <Link
                  key={product.slug}
                  href={product.defaultRoute}
                  prefetch={true}
                  onClick={closeProductDropdown}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors",
                    product.slug === currentProduct && "bg-slate-700",
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
            {productNavItems.map((item) => (
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
            {!collapsed && (
              <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
                Settings
              </div>
            )}
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
        {GLOBAL_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
                    expandedSections[section.title]
                      ? "text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {SectionIcon && (
                    <SectionIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="flex-1 text-left font-medium">{section.title}</span>
                  <span className="text-xs text-slate-500 mr-1">{section.items.length}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-transform",
                      expandedSections[section.title] && "rotate-180",
                    )}
                  />
                </button>
              )}
              {(collapsed || expandedSections[section.title]) && (
                <div className="space-y-0.5 ml-6 border-l border-slate-700 pl-2">
                  {section.items.map((item) => (
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
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700">
        {/* User */}
        {user && (
          <div className="p-3 border-b border-slate-700 relative">
            <button
              onClick={collapsed ? undefined : toggleUserMenu}
              className={cn(
                "w-full flex items-center gap-2 hover:bg-slate-800 rounded-md p-1 -m-1 transition-colors",
                collapsed && "justify-center",
              )}
            >
              <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user.initials || user.name.slice(0, 2).toUpperCase()}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </>
              )}
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={closeUserMenuAndLogout}
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
          onClick={toggleCollapsed}
          className="w-full p-3 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
});

// Navigation Item Component
interface NavItemComponentProps {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  product: ProductSlug;
  depth?: number;
}

// Custom comparison - only re-render if active state changes or other props change
function navItemPropsAreEqual(
  prevProps: NavItemComponentProps,
  nextProps: NavItemComponentProps
): boolean {
  // Check if collapsed or product changed
  if (prevProps.collapsed !== nextProps.collapsed) return false;
  if (prevProps.product !== nextProps.product) return false;
  if (prevProps.depth !== nextProps.depth) return false;
  if (prevProps.item !== nextProps.item) return false;

  // Only re-render if isActive state changed
  const prevIsActive = prevProps.pathname === prevProps.item.href;
  const nextIsActive = nextProps.pathname === nextProps.item.href;
  if (prevIsActive !== nextIsActive) return false;

  // Check if any child's active state changed
  const prevChildActive = prevProps.item.children?.some(
    (child) => prevProps.pathname === child.href
  );
  const nextChildActive = nextProps.item.children?.some(
    (child) => nextProps.pathname === child.href
  );
  if (prevChildActive !== nextChildActive) return false;

  return true;
}

const NavItemComponent = React.memo(function NavItemComponent({
  item,
  pathname,
  collapsed,
  product,
  depth = 0,
}: NavItemComponentProps) {
  const [expanded, setExpanded] = React.useState(false);

  // Memoize computed values
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = React.useMemo(
    () => hasChildren && item.children?.some((child) => pathname === child.href),
    [hasChildren, item.children, pathname]
  );
  const IconComponent = item.icon;
  const productColor = React.useMemo(() => getProductColorClass(product), [product]);

  // Memoize toggle handler
  const toggleExpanded = React.useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (isChildActive) {
      setExpanded(true);
    }
  }, [isChildActive]);

  if (item.disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm opacity-50 cursor-not-allowed",
          collapsed && "justify-center px-2",
          depth > 0 && "pl-8",
        )}
        title={collapsed ? item.label : undefined}
      >
        <IconComponent className="w-4 h-4 text-slate-500 shrink-0" />
        {!collapsed && (
          <>
            <span className="text-slate-500 flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  // Item with children (expandable)
  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={toggleExpanded}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors relative",
            isActive || isChildActive
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-800 hover:text-white",
          )}
        >
          <IconComponent
            className={cn(
              "w-4 h-4 shrink-0",
              (isActive || isChildActive) && productColor,
            )}
          />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
        {expanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.href}
                item={child}
                pathname={pathname}
                collapsed={collapsed}
                product={product}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      prefetch={true}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors relative",
        isActive
          ? "bg-slate-800 text-white font-semibold border-l-[3px] border-l-current"
          : "text-slate-300 hover:bg-slate-800 hover:text-white",
        isActive && productColor,
        collapsed && "justify-center px-2",
        depth > 0 && !collapsed && "pl-8",
      )}
    >
      <IconComponent
        className={cn("w-4 h-4 shrink-0", isActive && productColor)}
      />
      {!collapsed && <span className="flex-1">{item.label}</span>}
    </Link>
  );
}, navItemPropsAreEqual);
