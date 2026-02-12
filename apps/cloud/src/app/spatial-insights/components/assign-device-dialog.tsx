"use client";

import { memo, useMemo } from "react";
import { Lock, Radio, Wifi, Activity, Cpu, Camera, AlertCircle } from "lucide-react";
import { cn, Sheet, SheetContent, SheetHeader, SheetTitle } from "@repo/ui";
import { useSiteContext, type Device } from "@/contexts/site-context";

// Device type icons
const deviceTypeIcons: Record<Device["type"], typeof Lock> = {
  "digital-lock": Lock,
  "access-reader": Radio,
  gateway: Wifi,
  sensor: Activity,
  controller: Cpu,
  camera: Camera,
};

interface AssignDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (deviceId: string) => void;
  siteId: string | null;
  spaceName: string;
}

export const AssignDeviceDialog = memo(function AssignDeviceDialog({
  open,
  onClose,
  onSubmit,
  siteId,
  spaceName,
}: AssignDeviceDialogProps) {
  const { getUnplacedDevices, devices } = useSiteContext();

  // Get unassigned devices for the site
  const unassignedDevices = useMemo(() => {
    if (!siteId) return [];
    return getUnplacedDevices(siteId);
  }, [siteId, getUnplacedDevices]);

  // Get all site devices that could be reassigned
  const allSiteDevices = useMemo(() => {
    if (!siteId) return [];
    return devices.filter((d) => d.siteId === siteId && d.zoneId !== null);
  }, [siteId, devices]);

  const handleSelect = (deviceId: string) => {
    onSubmit(deviceId);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] bg-slate-800 border-slate-700 text-slate-100 p-0"
      >
        <SheetHeader className="p-6 border-b border-slate-700">
          <SheetTitle className="text-slate-100">Assign Device to {spaceName}</SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-4">
          {/* Unassigned Devices Section */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Unassigned Devices
            </h3>
            {unassignedDevices.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {unassignedDevices.map((device) => {
                  const Icon = deviceTypeIcons[device.type] || Cpu;
                  return (
                    <button
                      key={device.id}
                      onClick={() => handleSelect(device.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-transparent hover:border-cyan-500/50 transition-colors text-left"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          device.status === "online" ? "bg-green-500/20" : "bg-slate-600"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", device.status === "online" ? "text-green-400" : "text-slate-400")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-100 truncate">
                          {device.name}
                        </div>
                        <div className="text-xs text-slate-400 capitalize">
                          {device.type.replace("-", " ")}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          device.status === "online" ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-700/30 text-slate-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">No unassigned devices available</span>
              </div>
            )}
          </div>

          {/* Divider */}
          {allSiteDevices.length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-800 px-2 text-slate-500">or reassign from another space</span>
                </div>
              </div>

              {/* Assigned Devices Section */}
              <div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allSiteDevices.slice(0, 5).map((device) => {
                    const Icon = deviceTypeIcons[device.type] || Cpu;
                    return (
                      <button
                        key={device.id}
                        onClick={() => handleSelect(device.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-transparent hover:border-slate-600 transition-colors text-left"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            device.status === "online" ? "bg-cyan-500/20" : "bg-slate-600"
                          )}
                        >
                          <Icon className={cn("w-5 h-5", device.status === "online" ? "text-cyan-400" : "text-slate-400")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-100 truncate">
                            {device.name}
                          </div>
                          <div className="text-xs text-slate-400 capitalize">
                            {device.type.replace("-", " ")} • Currently assigned
                          </div>
                        </div>
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            device.status === "online" ? "bg-green-500" : "bg-red-500"
                          )}
                        />
                      </button>
                    );
                  })}
                  {allSiteDevices.length > 5 && (
                    <div className="text-xs text-slate-500 text-center py-1">
                      +{allSiteDevices.length - 5} more devices
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Cancel Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});
