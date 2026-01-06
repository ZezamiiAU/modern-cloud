/**
 * Dashboard Page - Server Component
 *
 * Renders stats and activity table.
 * All data could come from tRPC server-side in production.
 */

import {
  PageHeader,
  StatCard,
  DataTable,
  type Column,
} from "@repo/ui";

const stats = [
  {
    label: "Sites",
    value: "12",
    sublabel: "Active locations",
    change: "+2 this month",
    icon: "building" as const,
  },
  {
    label: "Spaces",
    value: "48",
    sublabel: "Managed areas",
    change: "+5 this month",
    icon: "grid" as const,
  },
  {
    label: "Devices",
    value: "156",
    sublabel: "Connected devices",
    change: "+8 this month",
    icon: "cpu" as const,
  },
  {
    label: "Unlocks",
    value: "2,847",
    sublabel: "Last 24 hours",
    change: "+12% from yesterday",
    icon: "unlock" as const,
  },
];

interface ActivityEvent {
  time: string;
  site: string;
  space: string;
  device: string;
  result: "success" | "failed";
}

const recentActivity: ActivityEvent[] = [
  { time: "2 mins ago", site: "HQ Building A", space: "Executive Floor", device: "Door-EF-201", result: "success" },
  { time: "5 mins ago", site: "HQ Building B", space: "Server Room", device: "Door-SR-101", result: "success" },
  { time: "8 mins ago", site: "Remote Office", space: "Main Entrance", device: "Gate-ME-001", result: "failed" },
  { time: "12 mins ago", site: "HQ Building A", space: "Conference Room", device: "Door-CR-305", result: "success" },
  { time: "15 mins ago", site: "Warehouse", space: "Loading Bay", device: "Gate-LB-002", result: "success" },
  { time: "18 mins ago", site: "HQ Building C", space: "R&D Lab", device: "Door-RD-401", result: "success" },
  { time: "22 mins ago", site: "Remote Office", space: "Parking", device: "Gate-PK-001", result: "failed" },
  { time: "25 mins ago", site: "HQ Building A", space: "Lobby", device: "Door-LB-100", result: "success" },
];

const columns: Column<ActivityEvent>[] = [
  { key: "time", header: "Time", format: "muted" },
  { key: "site", header: "Site" },
  { key: "space", header: "Space" },
  { key: "device", header: "Device", format: "mono" },
  { key: "result", header: "Result", format: "status" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your access management system"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <DataTable
        title="Recent Activity"
        description="Latest unlock events across all sites"
        columns={columns}
        data={recentActivity}
      />
    </div>
  );
}
