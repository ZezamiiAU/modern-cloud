import { Battery, BatteryWarning } from "lucide-react";
import { mockDevices } from "@/lib/partner/mock-data";
import { HealthPill, PortalHeading, formatDateTime } from "../_components";

export default function PartnerDevicesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PortalHeading
        title="Locks & Devices"
        subtitle="Health and firmware for every lock you've installed, across all customers."
      />

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 font-semibold">Device</th>
                <th className="px-4 py-3 font-semibold">Customer / Site</th>
                <th className="px-4 py-3 font-semibold">Health</th>
                <th className="px-4 py-3 font-semibold">Battery</th>
                <th className="px-4 py-3 font-semibold">Firmware</th>
                <th className="px-4 py-3 font-semibold">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockDevices.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      {d.deviceType} • {d.externalDeviceId}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{d.orgName}</p>
                    <p className="text-xs text-gray-500">{d.siteName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <HealthPill health={d.health} />
                  </td>
                  <td className="px-4 py-3">
                    <BatteryCell percent={d.batteryPercent} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.firmwareVersion}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(d.lastSeenAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BatteryCell({ percent }: { percent: number | null }) {
  if (percent === null) {
    return <span className="text-xs text-gray-400">Mains</span>;
  }
  const low = percent <= 20;
  const Icon = low ? BatteryWarning : Battery;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${low ? "text-red-600" : "text-gray-700"}`}
    >
      <Icon className="w-4 h-4" />
      {percent}%
    </span>
  );
}
