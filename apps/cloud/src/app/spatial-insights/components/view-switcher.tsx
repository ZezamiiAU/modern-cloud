"use client";

import { memo } from "react";
import { Activity, Shield, Heart } from "lucide-react";
import { cn } from "@repo/ui";

export type ViewMode = "utilization" | "security" | "health";

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { id: ViewMode; label: string; icon: typeof Activity }[] = [
  { id: "utilization", label: "Utilization", icon: Activity },
  { id: "security", label: "Security", icon: Shield },
  { id: "health", label: "Health", icon: Heart },
];

export const ViewSwitcher = memo(function ViewSwitcher({
  value,
  onChange,
}: ViewSwitcherProps) {
  return (
    <div className="flex items-center bg-slate-800 rounded-lg p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
});
