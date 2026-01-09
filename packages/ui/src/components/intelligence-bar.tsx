import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import type { LucideIcon } from "lucide-react";

export interface IntelligenceMetric {
  id: string;
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  tooltip?: string;
}

export interface IntelligenceAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  onClick: () => void;
  disabled?: boolean;
}

export interface IntelligenceBarProps {
  metrics: IntelligenceMetric[];
  actions?: IntelligenceAction[];
  className?: string;
}

export function IntelligenceBar({
  metrics,
  actions = [],
  className,
}: IntelligenceBarProps) {
  return (
    <div
      className={cn(
        "bg-white border-b border-gray-200 px-6 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Metrics */}
        <div className="flex items-center gap-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className="flex items-center gap-2"
                title={metric.tooltip}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      metric.iconColor || "text-gray-500"
                    )}
                  />
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600">{metric.label}:</span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      metric.valueColor || "text-gray-900"
                    )}
                  >
                    {metric.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
