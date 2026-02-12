"use client";

import { useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Plus, Shield, Settings, MoreHorizontal, ChevronRight } from "lucide-react";
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

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  permissionSets: string[];
  color: string;
  createdAt: Date;
}

// Mock teams data
const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "IT Department",
    description: "Information technology and systems administration",
    memberCount: 12,
    permissionSets: ["Server Room", "IT Office", "All Floors"],
    color: "#6366f1",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "team-2",
    name: "Security",
    description: "Building security and access control management",
    memberCount: 8,
    permissionSets: ["All Areas", "Security Office", "CCTV Room"],
    color: "#ef4444",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "team-3",
    name: "Operations",
    description: "Day-to-day operations and facility management",
    memberCount: 15,
    permissionSets: ["Common Areas", "Meeting Rooms", "Cafeteria"],
    color: "#22c55e",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "team-4",
    name: "Executive",
    description: "Executive leadership and management",
    memberCount: 5,
    permissionSets: ["Executive Floor", "Boardroom", "All Areas"],
    color: "#a855f7",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "team-5",
    name: "Contractors",
    description: "External contractors with limited access",
    memberCount: 23,
    permissionSets: ["Lobby", "Contractor Area"],
    color: "#f59e0b",
    createdAt: new Date("2024-03-01"),
  },
];

// Memoized team card component
const TeamCard = memo(function TeamCard({
  team,
  onManage,
}: {
  team: Team;
  onManage: (teamId: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${team.color}20` }}
          >
            <Users className="w-5 h-5" style={{ color: team.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500">{team.memberCount} members</p>
          </div>
        </div>
        <button
          onClick={() => onManage(team.id)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">{team.description}</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Permission Sets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {team.permissionSets.map((permission) => (
            <span
              key={permission}
              className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
            >
              {permission}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400" suppressHydrationWarning>
          Created {team.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
        <button
          onClick={() => onManage(team.id)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          Manage
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default function TeamsPage() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return mockTeams;
    const query = searchQuery.toLowerCase();
    return mockTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleManageTeam = useCallback((teamId: string) => {
    alert(`Managing team: ${teamId}`);
  }, []);

  const metrics: IntelligenceMetric[] = useMemo(
    () => [
      {
        id: "total-teams",
        label: "Total Teams",
        value: mockTeams.length,
        icon: Users,
        iconColor: "text-indigo-500",
      },
      {
        id: "total-members",
        label: "Total Members",
        value: mockTeams.reduce((sum, t) => sum + t.memberCount, 0),
        icon: Users,
        iconColor: "text-green-500",
      },
      {
        id: "permission-sets",
        label: "Permission Sets",
        value: new Set(mockTeams.flatMap((t) => t.permissionSets)).size,
        icon: Shield,
        iconColor: "text-purple-500",
      },
    ],
    []
  );

  const actions: IntelligenceAction[] = useMemo(
    () => [
      {
        id: "manage-permissions",
        label: "Permission Sets",
        icon: Settings,
        onClick: () => alert("Permission sets modal coming soon"),
        variant: "outline",
      },
      {
        id: "create-team",
        label: "Create Team",
        icon: Plus,
        onClick: () => alert("Create team modal coming soon"),
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

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} onManage={handleManageTeam} />
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No teams found</h3>
              <p className="text-gray-500">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
