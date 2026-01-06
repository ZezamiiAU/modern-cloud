/**
 * Icon system for Server Components
 *
 * Icons are resolved by name string, avoiding the need to pass
 * React components across the server/client boundary.
 */

import {
  LayoutDashboard,
  Building2,
  Grid3X3,
  Cpu,
  Users,
  KeyRound,
  Activity,
  Settings,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Search,
  type LucideIcon,
} from "lucide-react";

export const iconMap = {
  dashboard: LayoutDashboard,
  building: Building2,
  grid: Grid3X3,
  cpu: Cpu,
  users: Users,
  key: KeyRound,
  activity: Activity,
  settings: Settings,
  unlock: Unlock,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  search: Search,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  className?: string;
}

/**
 * Server-compatible icon component
 * Resolves icon by name string
 */
export function Icon({ name, className }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}

/**
 * Get icon component by name (for client components that need the component directly)
 */
export function getIcon(name: IconName): LucideIcon {
  return iconMap[name];
}
