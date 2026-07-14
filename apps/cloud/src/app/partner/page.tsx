import Link from "next/link";
import {
  Building2,
  Lock,
  ShieldCheck,
  MapPin,
  ChevronRight,
} from "lucide-react";
import {
  mockPartner,
  mockInstallations,
  mockDevices,
} from "@/lib/partner/mock-data";
import { PortalHeading, formatDate } from "./_components";

export default function PartnerOverviewPage() {
  const totalDevices = mockInstallations.reduce((n, i) => n + i.deviceCount, 0);
  const healthyDevices = mockInstallations.reduce(
    (n, i) => n + i.healthyDeviceCount,
    0,
  );
  const customerOrgs = new Set(mockInstallations.map((i) => i.orgRefId)).size;
  const attention = mockDevices.filter(
    (d) => d.health === "offline" || d.health === "degraded",
  );

  const stats = [
    {
      label: "Customer organizations",
      value: customerOrgs,
      icon: Building2,
      tint: "text-sky-600 bg-sky-50",
    },
    {
      label: "Installed sites",
      value: mockInstallations.length,
      icon: MapPin,
      tint: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Locks deployed",
      value: totalDevices,
      icon: Lock,
      tint: "text-violet-600 bg-violet-50",
    },
    {
      label: "Healthy",
      value: `${Math.round((healthyDevices / totalDevices) * 100)}%`,
      icon: ShieldCheck,
      tint: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PortalHeading
        title={`${mockPartner.name} — Partner Portal`}
        subtitle="Every site and lock you've installed, across all of your customers."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-lg border p-5 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.tint}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-semibold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Needs attention */}
      {attention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-sm font-semibold text-amber-800">
            {attention.length} device{attention.length > 1 ? "s" : ""} need
            attention
          </p>
          <p className="text-sm text-amber-700 mt-0.5">
            {attention.map((d) => `${d.name} (${d.siteName})`).join(", ")}.{" "}
            <Link href="/partner/devices" className="underline font-medium">
              View devices
            </Link>
          </p>
        </div>
      )}

      {/* Installations by customer */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Installed sites</h2>
        <Link
          href="/partner/activity"
          className="text-sm text-sky-600 hover:text-sky-700 font-medium"
        >
          Recent activity →
        </Link>
      </div>
      <div className="bg-white rounded-lg border shadow-sm divide-y">
        {mockInstallations.map((inst) => (
          <div
            key={inst.id}
            className="flex items-center gap-4 p-4 hover:bg-gray-50"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {inst.siteName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {inst.orgName}
                {inst.location ? ` • ${inst.location}` : ""} • installed{" "}
                {formatDate(inst.installedAt)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-gray-900">
                {inst.healthyDeviceCount}/{inst.deviceCount} healthy
              </p>
              <p className="text-xs text-gray-500">locks</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
