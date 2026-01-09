import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Circle,
  Info,
  type LucideIcon
} from "lucide-react";
import { cn } from "../lib/utils";

export type StatusVariant =
  | "success"
  | "failed"
  | "pending"
  | "warning"
  | "active"
  | "inactive"
  | "info"
  | "error";

export type StatusSize = "sm" | "md" | "lg";
export type StatusBadgeVariant = "default" | "dot";

export interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  icon?: boolean;
  size?: StatusSize;
  variant?: StatusBadgeVariant;
  className?: string;
}

const statusConfig: Record<
  StatusVariant,
  {
    label: string;
    color: string;
    icon: LucideIcon;
  }
> = {
  success: {
    label: "SUCCESS",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  failed: {
    label: "FAILED",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  error: {
    label: "ERROR",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  pending: {
    label: "PENDING",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  warning: {
    label: "WARNING",
    color: "bg-orange-100 text-orange-700",
    icon: AlertTriangle,
  },
  active: {
    label: "ACTIVE",
    color: "bg-blue-100 text-blue-700",
    icon: Circle,
  },
  inactive: {
    label: "INACTIVE",
    color: "bg-gray-100 text-gray-700",
    icon: Circle,
  },
  info: {
    label: "INFO",
    color: "bg-cyan-100 text-cyan-700",
    icon: Info,
  },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function StatusBadge({
  status,
  label,
  icon = false,
  size = "md",
  variant = "default",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  if (variant === "dot") {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <span className={cn("h-2 w-2 rounded-full", config.color)} />
        <span className="text-sm">{displayLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {icon && <Icon className={iconSizeClasses[size]} />}
      {displayLabel}
    </span>
  );
}
