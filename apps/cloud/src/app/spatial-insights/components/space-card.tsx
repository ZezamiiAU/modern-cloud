"use client";

import { memo, useMemo } from "react";
import {
  Lock,
  Camera,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  DoorOpen,
} from "lucide-react";
import { cn } from "@repo/ui";
import type { Device, Transaction, TransactionType } from "@/contexts/site-context";
import type { ViewMode } from "./view-switcher";

interface ZezamiiSpace {
  id: string;
  name: string;
  type: "Room" | "Area" | "Zone";
  devices: {
    locks: Device[];
    cameras: Device[];
  };
  latestTransactions: Transaction[];
}

interface SpaceCardProps {
  space: ZezamiiSpace;
  viewMode: ViewMode;
  onAssetClick: (assetId: string) => void;
  onAssignDevice: () => void;
}

const transactionLabels: Record<TransactionType, string> = {
  access: "Access",
  unlock: "Unlocked",
  lock: "Locked",
  alarm: "Alarm",
  maintenance: "Maintenance",
};

const statusIcons = {
  success: CheckCircle,
  denied: XCircle,
  error: AlertTriangle,
};

const statusColors = {
  success: "text-green-400",
  denied: "text-red-400",
  error: "text-yellow-400",
};

export const SpaceCard = memo(function SpaceCard({
  space,
  viewMode,
  onAssetClick,
  onAssignDevice,
}: SpaceCardProps) {
  const { locks, cameras } = space.devices;
  const allDevices = [...locks, ...cameras];
  const onlineDevices = allDevices.filter((d) => d.status === "online").length;
  const totalDevices = allDevices.length;

  // Calculate health status for the card
  const healthStatus = useMemo(() => {
    if (totalDevices === 0) return "empty";
    if (onlineDevices === totalDevices) return "healthy";
    if (onlineDevices === 0) return "critical";
    return "warning";
  }, [onlineDevices, totalDevices]);

  // Card styling based on view mode
  const cardStyle = useMemo(() => {
    if (viewMode === "health") {
      if (healthStatus === "healthy") return "border-green-500/30 bg-green-500/5";
      if (healthStatus === "warning") return "border-yellow-500/30 bg-yellow-500/5";
      if (healthStatus === "critical") return "border-red-500/30 bg-red-500/5";
      return "border-slate-700 bg-slate-800/50";
    }
    if (viewMode === "security") {
      const hasRecentActivity = space.latestTransactions.some(
        (t) => Date.now() - t.timestamp.getTime() < 1000 * 60 * 30
      );
      if (hasRecentActivity) return "border-cyan-500/30 bg-cyan-500/5";
      return "border-slate-700 bg-slate-800/50";
    }
    // Utilization view (default)
    return "border-slate-700 bg-slate-800/50 hover:border-slate-600";
  }, [viewMode, healthStatus, space.latestTransactions]);

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 transition-all",
        cardStyle
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-100">{space.name}</h3>
          <span className="text-xs text-slate-400">{space.type}</span>
        </div>
        <div className="flex items-center gap-2">
          {locks.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-xs">{locks.length}</span>
            </div>
          )}
          {cameras.length > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <Camera className="w-3.5 h-3.5" />
              <span className="text-xs">{cameras.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Devices Section */}
      {allDevices.length > 0 ? (
        <div className="space-y-2 mb-4">
          {allDevices.slice(0, 3).map((device) => (
            <button
              key={device.id}
              onClick={() => onAssetClick(device.id)}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors text-left"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  device.status === "online" ? "bg-green-500/20" : "bg-red-500/20"
                )}
              >
                {device.type === "camera" ? (
                  <Camera className={cn("w-3 h-3", device.status === "online" ? "text-green-400" : "text-red-400")} />
                ) : (
                  <Lock className={cn("w-3 h-3", device.status === "online" ? "text-green-400" : "text-red-400")} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 truncate">{device.name}</div>
                <div className="text-xs text-slate-500">
                  {device.batteryLevel !== undefined ? `${device.batteryLevel}%` : device.status}
                </div>
              </div>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  device.status === "online" ? "bg-green-500" : "bg-red-500"
                )}
              />
            </button>
          ))}
          {allDevices.length > 3 && (
            <div className="text-xs text-slate-500 text-center py-1">
              +{allDevices.length - 3} more devices
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 mb-4 bg-slate-700/20 rounded-lg">
          <DoorOpen className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 mb-3">No devices assigned</p>
          <button
            onClick={onAssignDevice}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-md transition-colors"
          >
            <Plus className="w-3 h-3" />
            Assign Device
          </button>
        </div>
      )}

      {/* Transaction Feed */}
      <div className="border-t border-slate-700 pt-3">
        <h4 className="text-xs font-medium text-slate-400 mb-2">Recent Activity</h4>
        {space.latestTransactions.length > 0 ? (
          <div className="space-y-2">
            {space.latestTransactions.slice(0, 3).map((txn) => {
              const StatusIcon = statusIcons[txn.status];
              return (
                <div
                  key={txn.id}
                  className="flex items-start gap-2 text-xs"
                >
                  <StatusIcon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", statusColors[txn.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-200 font-medium">
                        {transactionLabels[txn.type]}
                      </span>
                      <span className="text-slate-500 shrink-0" suppressHydrationWarning>
                        {formatTimeAgo(txn.timestamp)}
                      </span>
                    </div>
                    {txn.userName && (
                      <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                        <User className="w-3 h-3" />
                        <span className="truncate">{txn.userName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-2">No recent activity</p>
        )}
      </div>

      {/* Footer Actions */}
      {allDevices.length > 0 && (
        <div className="border-t border-slate-700 pt-3 mt-3">
          <button
            onClick={onAssignDevice}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Assign Device
          </button>
        </div>
      )}
    </div>
  );
});

// Helper function to format relative time
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
