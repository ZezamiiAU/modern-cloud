"use client";

import { memo, useState, useMemo } from "react";
import {
  X,
  Lock,
  Radio,
  Wifi,
  Activity,
  Camera,
  Cpu,
  Battery,
  Signal,
  Clock,
  MapPin,
  Settings,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn, Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui";
import type { Device, Transaction, TransactionType, TransactionStatus } from "@/contexts/site-context";

// Device type icons
const deviceTypeIcons: Record<Device["type"], typeof Lock> = {
  "digital-lock": Lock,
  "access-reader": Radio,
  gateway: Wifi,
  sensor: Activity,
  controller: Cpu,
  camera: Camera,
};

// Transaction type labels
const transactionTypeLabels: Record<TransactionType, string> = {
  access: "Access",
  unlock: "Unlock",
  lock: "Lock",
  alarm: "Alarm",
  maintenance: "Maintenance",
};

// Generate mock transactions for a device
function generateMockTransactions(deviceId: string): Transaction[] {
  const types: TransactionType[] = ["access", "unlock", "lock", "alarm", "maintenance"];
  const statuses: TransactionStatus[] = ["success", "denied", "error"];
  const users = [
    { id: "user-1", name: "John Doe" },
    { id: "user-2", name: "Jane Smith" },
    { id: "user-3", name: "Bob Johnson" },
    { id: "user-4", name: "Alice Williams" },
  ];

  const transactions: Transaction[] = [];
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)] ?? "access";
    const status = i < 7 ? "success" : (statuses[Math.floor(Math.random() * statuses.length)] ?? "success");
    const user = users[Math.floor(Math.random() * users.length)] ?? { id: "user-1", name: "John Doe" };

    transactions.push({
      id: `txn-${deviceId}-${i}`,
      assetId: deviceId,
      type,
      userId: user.id,
      userName: user.name,
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7),
      status,
      details: type === "alarm" ? "Motion detected" : undefined,
    });
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

type TabId = "overview" | "activity" | "config";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "config", label: "Config" },
];

interface AssetInspectorProps {
  asset: Device | null;
  open: boolean;
  onClose: () => void;
}

export const AssetInspector = memo(function AssetInspector({
  asset,
  open,
  onClose,
}: AssetInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const transactions = useMemo(() => {
    if (!asset) return [];
    return generateMockTransactions(asset.id);
  }, [asset?.id]);

  if (!asset) return null;

  const Icon = deviceTypeIcons[asset.type] || Cpu;
  const isOnline = asset.status === "online";

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] bg-slate-800 border-slate-700 text-slate-100 p-0"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  isOnline ? "bg-cyan-500/20" : "bg-red-500/20"
                )}
              >
                <Icon className={cn("w-6 h-6", isOnline ? "text-cyan-400" : "text-red-400")} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{asset.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      isOnline
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{asset.type.replace("-", " ")}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto" style={{ height: "calc(100vh - 220px)" }}>
          {activeTab === "overview" && (
            <OverviewTab asset={asset} />
          )}
          {activeTab === "activity" && (
            <ActivityTab transactions={transactions} />
          )}
          {activeTab === "config" && (
            <ConfigTab asset={asset} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

// Overview Tab
const OverviewTab = memo(function OverviewTab({ asset }: { asset: Device }) {
  return (
    <div className="space-y-6">
      {/* Health Status */}
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Health Status</h3>
        <div className="grid grid-cols-2 gap-4">
          {asset.batteryLevel !== undefined && (
            <div className="flex items-center gap-3">
              <Battery className={cn(
                "w-5 h-5",
                asset.batteryLevel > 50 ? "text-green-400" :
                  asset.batteryLevel > 20 ? "text-yellow-400" : "text-red-400"
              )} />
              <div>
                <div className="text-sm text-slate-400">Battery</div>
                <div className="text-lg font-semibold text-slate-100">{asset.batteryLevel}%</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Signal className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-sm text-slate-400">Signal</div>
              <div className="text-lg font-semibold text-slate-100">Strong</div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Device Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Serial Number</span>
            <span className="text-slate-100 font-mono text-sm">{asset.serialNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">MAC Address</span>
            <span className="text-slate-100 font-mono text-sm">{asset.macAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Firmware</span>
            <span className="text-slate-100">{asset.firmwareVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Seen</span>
            <span className="text-slate-100" suppressHydrationWarning>
              {asset.lastSeen.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Location</h3>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-slate-400" />
          <div>
            <div className="text-slate-100">Zone: {asset.zoneId || "Unassigned"}</div>
            <div className="text-sm text-slate-400">Site: {asset.siteId}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Activity Tab
const ActivityTab = memo(function ActivityTab({
  transactions,
}: {
  transactions: Transaction[];
}) {
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

  return (
    <div className="space-y-3">
      {transactions.map((txn) => {
        const StatusIcon = statusIcons[txn.status];
        return (
          <div
            key={txn.id}
            className="bg-slate-700/30 rounded-lg p-3 flex items-start gap-3"
          >
            <StatusIcon className={cn("w-5 h-5 mt-0.5", statusColors[txn.status])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-100">
                  {transactionTypeLabels[txn.type]}
                </span>
                <span className="text-xs text-slate-400" suppressHydrationWarning>
                  {txn.timestamp.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {txn.userName && (
                <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
                  <User className="w-3 h-3" />
                  <span>{txn.userName}</span>
                </div>
              )}
              {txn.details && (
                <div className="text-sm text-slate-400 mt-1">{txn.details}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Config Tab
const ConfigTab = memo(function ConfigTab({ asset }: { asset: Device }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-100">Auto-lock</div>
              <div className="text-sm text-slate-400">Lock after 30 seconds</div>
            </div>
            <div className="w-12 h-6 bg-cyan-500 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-100">Sound alerts</div>
              <div className="text-sm text-slate-400">Beep on access</div>
            </div>
            <div className="w-12 h-6 bg-slate-600 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-700/30 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Actions</h3>
        <div className="space-y-2">
          <button className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-100 transition-colors text-left flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </button>
          <button className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-100 transition-colors text-left flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Run Diagnostics
          </button>
          <button className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors text-left flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Reset Device
          </button>
        </div>
      </div>
    </div>
  );
});
