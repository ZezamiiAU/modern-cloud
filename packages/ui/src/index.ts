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
export { Label } from "./components/label";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/select";
export { Alert, AlertTitle, AlertDescription } from "./components/alert";
export { Spinner } from "./components/spinner";
export { Slider } from "./components/slider";
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./components/collapsible";
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/sheet";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/dropdown-menu";
export { Checkbox } from "./components/checkbox";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/tooltip";

// Layout (server components with client islands)
export { PageShell, type PageShellProps, type NavItem } from "./components/page-shell";
export { Sidebar, type SidebarProps } from "./components/sidebar";
export { ZezamiiSidebar, type ZezamiiSidebarProps } from "./components/zezamii-sidebar";
export { PageHeader, type PageHeaderProps } from "./components/page-header";

// Data Display (server components)
export { StatCard, type StatCardProps } from "./components/stat-card";
export {
  DataTable,
  type DataTableProps,
  type Column,
  type ColumnFormat,
} from "./components/data-table";

// Intelligence Bar
export {
  IntelligenceBar,
  type IntelligenceBarProps,
  type IntelligenceMetric,
  type IntelligenceAction,
} from "./components/intelligence-bar";

// Zezamii Header
export {
  ZezamiiHeader,
  type ZezamiiHeaderProps,
  type HealthPill,
} from "./components/zezamii-header";

// Identity Workstation (client components)
export {
  IdentityWorkstation,
  type IdentityWorkstationProps,
  type IdentityWorkstationUser,
} from "./components/identity-workstation";
export {
  StatusBadge,
  type StatusBadgeProps,
  type StatusVariant,
  type StatusSize,
  type StatusBadgeVariant,
} from "./components/status-badge";
export {
  CredentialIcons,
  type CredentialIconsProps,
  type CredentialType,
} from "./components/credential-icons";
export {
  BehavioralSparkline,
  type BehavioralSparklineProps,
} from "./components/behavioral-sparkline";
export {
  ActivityTimeline,
  type ActivityTimelineProps,
  type ActivityEvent,
  type ProductType,
} from "./components/activity-timeline";
export {
  ActivityDrawer,
  type ActivityDrawerProps,
} from "./components/activity-drawer";
export {
  WorkstationToolbar,
  type WorkstationToolbarProps,
} from "./components/workstation-toolbar";
