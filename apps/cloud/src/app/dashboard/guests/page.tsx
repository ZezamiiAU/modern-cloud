"use client";

import { useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import {
  IntelligenceBar,
  cn,
  type IntelligenceMetric,
  type IntelligenceAction,
} from "@repo/ui";

// Tab navigation - links to separate pages
const tabs = [
  { id: "people", label: "People", href: "/dashboard/people" },
  { id: "teams", label: "Teams", href: "/dashboard/teams" },
  { id: "guests", label: "Guests", href: "/dashboard/guests" },
] as const;

// Memoized tab link
const TabLink = memo(function TabLink({
  tab,
  isActive,
}: {
  tab: (typeof tabs)[number];
  isActive: boolean;
}) {
  return (
    <Link
      href={tab.href}
      className={cn(
        "pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
        isActive
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
      )}
    >
      {tab.label}
    </Link>
  );
});

type GuestStatus = "active" | "pending" | "expired" | "revoked";

interface Guest {
  id: string;
  name: string;
  email: string;
  company: string;
  host: string;
  purpose: string;
  status: GuestStatus;
  checkIn: Date;
  checkOut: Date;
  accessAreas: string[];
}

// Mock guests data
const mockGuests: Guest[] = [
  {
    id: "guest-1",
    name: "Michael Chen",
    email: "michael.chen@acme.com",
    company: "Acme Corp",
    host: "John Doe",
    purpose: "Client Meeting",
    status: "active",
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 1000 * 60 * 60 * 4),
    accessAreas: ["Lobby", "Meeting Room A", "Cafeteria"],
  },
  {
    id: "guest-2",
    name: "Sarah Johnson",
    email: "sarah.j@techstart.io",
    company: "TechStart",
    host: "Jane Smith",
    purpose: "Interview",
    status: "pending",
    checkIn: new Date(Date.now() + 1000 * 60 * 60 * 2),
    checkOut: new Date(Date.now() + 1000 * 60 * 60 * 5),
    accessAreas: ["Lobby", "HR Office"],
  },
  {
    id: "guest-3",
    name: "David Park",
    email: "dpark@contractor.net",
    company: "Park Contractors",
    host: "Bob Johnson",
    purpose: "Maintenance",
    status: "active",
    checkIn: new Date(Date.now() - 1000 * 60 * 60 * 2),
    checkOut: new Date(Date.now() + 1000 * 60 * 60 * 6),
    accessAreas: ["Lobby", "Server Room", "IT Office"],
  },
  {
    id: "guest-4",
    name: "Emily Watson",
    email: "emily@vendor.com",
    company: "Vendor Solutions",
    host: "Alice Williams",
    purpose: "Product Demo",
    status: "expired",
    checkIn: new Date(Date.now() - 1000 * 60 * 60 * 24),
    checkOut: new Date(Date.now() - 1000 * 60 * 60 * 20),
    accessAreas: ["Lobby", "Conference Room"],
  },
  {
    id: "guest-5",
    name: "James Wilson",
    email: "jwilson@audit.co",
    company: "Audit Co",
    host: "Diana Prince",
    purpose: "Annual Audit",
    status: "pending",
    checkIn: new Date(Date.now() + 1000 * 60 * 60 * 24),
    checkOut: new Date(Date.now() + 1000 * 60 * 60 * 32),
    accessAreas: ["Lobby", "Finance Office", "Executive Floor"],
  },
];

const statusConfig: Record<GuestStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  active: { label: "Active", color: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle },
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-50", icon: Clock },
  expired: { label: "Expired", color: "text-gray-700", bgColor: "bg-gray-100", icon: XCircle },
  revoked: { label: "Revoked", color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

// Memoized guest row component
const GuestRow = memo(function GuestRow({
  guest,
  onAction,
}: {
  guest: Guest;
  onAction: (guestId: string, action: string) => void;
}) {
  const config = statusConfig[guest.status];
  const StatusIcon = config.icon;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-700">
            {guest.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-medium text-gray-900">{guest.name}</p>
            <p className="text-sm text-gray-500">{guest.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{guest.company}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">{guest.host}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">{guest.purpose}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm" suppressHydrationWarning>
          <p className="text-gray-700" suppressHydrationWarning>
            {guest.checkIn.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-gray-500 text-xs" suppressHydrationWarning>
            {guest.checkIn.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {guest.accessAreas.slice(0, 2).map((area) => (
            <span
              key={area}
              className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600"
            >
              {area}
            </span>
          ))}
          {guest.accessAreas.length > 2 && (
            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
              +{guest.accessAreas.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onAction(guest.id, "manage")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

export default function GuestsPage() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GuestStatus | "all">("all");

  const filteredGuests = useMemo(() => {
    return mockGuests.filter((guest) => {
      const matchesSearch =
        !searchQuery ||
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || guest.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleGuestAction = useCallback((guestId: string, action: string) => {
    alert(`Action "${action}" on guest: ${guestId}`);
  }, []);

  const metrics: IntelligenceMetric[] = useMemo(() => {
    const active = mockGuests.filter((g) => g.status === "active").length;
    const pending = mockGuests.filter((g) => g.status === "pending").length;
    const today = mockGuests.filter((g) => {
      const checkIn = g.checkIn;
      const now = new Date();
      return checkIn.toDateString() === now.toDateString();
    }).length;

    return [
      {
        id: "active-guests",
        label: "Active Now",
        value: active,
        icon: CheckCircle,
        iconColor: "text-green-500",
      },
      {
        id: "pending-guests",
        label: "Pending Check-in",
        value: pending,
        icon: Clock,
        iconColor: "text-yellow-500",
      },
      {
        id: "today-guests",
        label: "Expected Today",
        value: today,
        icon: Calendar,
        iconColor: "text-indigo-500",
      },
    ];
  }, []);

  const actions: IntelligenceAction[] = useMemo(
    () => [
      {
        id: "send-invites",
        label: "Send Invites",
        icon: Mail,
        onClick: () => alert("Send invites modal coming soon"),
        variant: "outline",
      },
      {
        id: "add-guest",
        label: "Add Guest",
        icon: UserPlus,
        onClick: () => alert("Add guest modal coming soon"),
        variant: "default",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto">
        <IntelligenceBar metrics={metrics} actions={actions} />

        <div className="px-6 pt-4">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <TabLink
                  key={tab.id}
                  tab={tab}
                  isActive={pathname === tab.href}
                />
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GuestStatus | "all")}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          {/* Guests Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <GuestRow key={guest.id} guest={guest} onAction={handleGuestAction} />
                ))}
              </tbody>
            </table>

            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No guests found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
