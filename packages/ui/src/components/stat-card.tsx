/**
 * StatCard - Server Component
 *
 * Displays a metric with optional icon and change indicator.
 * Uses icon name strings for server compatibility.
 */

import { cn } from "../lib/utils";
import { Icon, type IconName } from "./icons";

export interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: IconName;
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  change,
  changeType = "positive",
  icon,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-lg border p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          )}
          {change && (
            <p
              className={cn(
                "text-xs mt-0.5",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-red-600",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && <Icon name={icon} className="w-5 h-5 text-muted-foreground" />}
      </div>
    </div>
  );
}
