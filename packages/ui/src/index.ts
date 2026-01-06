// Utilities
export { cn } from "./lib/utils";

// Icons (server-compatible)
export { Icon, iconMap, getIcon, type IconName } from "./components/icons";

// Primitives
export { Button, buttonVariants, type ButtonProps } from "./components/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/card";
export { Input, type InputProps } from "./components/input";

// Layout (server components with client islands)
export { PageShell, type PageShellProps, type NavItem } from "./components/page-shell";
export { Sidebar, type SidebarProps } from "./components/sidebar";
export { PageHeader, type PageHeaderProps } from "./components/page-header";

// Data Display (server components)
export { StatCard, type StatCardProps } from "./components/stat-card";
export {
  DataTable,
  StatusBadge,
  type DataTableProps,
  type Column,
  type ColumnFormat,
  type StatusBadgeProps,
} from "./components/data-table";
