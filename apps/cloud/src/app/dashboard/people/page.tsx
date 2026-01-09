"use client";

import { useState, useMemo } from "react";
import { Users, Clock, Smartphone, UserPlus } from "lucide-react";
import {
  IdentityWorkstation,
  IntelligenceBar,
  type IdentityWorkstationUser,
  type ActivityEvent,
  type IntelligenceMetric,
  type IntelligenceAction,
} from "@repo/ui";

// Tab navigation
const tabs = [
  { id: "people", label: "People" },
  { id: "teams", label: "Teams" },
  { id: "guests", label: "Guests" },
];

// Mock data for demonstration
const mockUsers: IdentityWorkstationUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@zezamii.com",
    avatar: undefined,
    team: "IT",
    role: "Admin",
    status: "active",
    credentials: {
      mobile: true,
      pin: true,
      card: false,
      qr: true,
    },
    activitySparkline: [5, 12, 8, 15, 10, 3, 7],
    lastEvent: {
      type: "access",
      action: "Access granted",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    activeCoverage: {
      spacesAllowed: 14,
      devicesAllowed: 8,
    },
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@zezamii.com",
    team: "Operations",
    role: "Manager",
    status: "active",
    credentials: {
      mobile: true,
      pin: false,
      card: true,
      qr: false,
    },
    activitySparkline: [3, 5, 8, 12, 9, 6, 11],
    lastEvent: {
      type: "rooms",
      action: "Room booked",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    activeCoverage: {
      spacesAllowed: 8,
      devicesAllowed: 5,
    },
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@zezamii.com",
    team: "Security",
    role: "Officer",
    status: "active",
    credentials: {
      mobile: true,
      pin: true,
      card: true,
      qr: true,
    },
    activitySparkline: [18, 22, 15, 20, 24, 19, 21],
    lastEvent: {
      type: "lockers",
      action: "Locker accessed",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    activeCoverage: {
      spacesAllowed: 25,
      devicesAllowed: 15,
    },
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@zezamii.com",
    team: "IT",
    role: "Developer",
    status: "active",
    credentials: {
      mobile: true,
      pin: false,
      card: false,
      qr: true,
    },
    activitySparkline: [2, 4, 3, 5, 6, 4, 3],
    lastEvent: {
      type: "vision",
      action: "Camera accessed",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    activeCoverage: {
      spacesAllowed: 6,
      devicesAllowed: 4,
    },
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@zezamii.com",
    team: "Operations",
    role: "Coordinator",
    status: "inactive",
    credentials: {
      mobile: false,
      pin: true,
      card: true,
      qr: false,
    },
    activitySparkline: [0, 0, 1, 0, 2, 0, 0],
    lastEvent: {
      type: "bookings",
      action: "Booking cancelled",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    activeCoverage: {
      spacesAllowed: 5,
      devicesAllowed: 3,
    },
  },
  {
    id: "6",
    name: "Diana Prince",
    email: "diana.prince@zezamii.com",
    team: "Security",
    role: "Manager",
    status: "active",
    credentials: {
      mobile: true,
      pin: true,
      card: true,
      qr: true,
    },
    activitySparkline: [14, 16, 13, 18, 15, 12, 17],
    lastEvent: {
      type: "access",
      action: "Access revoked",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    activeCoverage: {
      spacesAllowed: 20,
      devicesAllowed: 12,
    },
  },
];

// Mock activity events generator
function generateMockActivity(userId: string): ActivityEvent[] {
  const types: Array<"access" | "rooms" | "lockers" | "bookings" | "vision" | "cloud"> = [
    "access",
    "rooms",
    "lockers",
    "bookings",
    "vision",
    "cloud",
  ];

  const actions = {
    access: ["Access granted", "Access denied", "Access revoked", "Credentials updated"],
    rooms: ["Room booked", "Room released", "Room check-in", "Room check-out"],
    lockers: ["Locker accessed", "Locker assigned", "Locker released", "Locker opened"],
    bookings: ["Booking created", "Booking modified", "Booking cancelled", "Booking confirmed"],
    vision: ["Camera accessed", "Recording started", "Recording stopped", "Alert triggered"],
    cloud: ["Profile updated", "Settings changed", "Password reset", "Login successful"],
  };

  const locations = ["Building A", "Building B", "Floor 3", "Main Entrance", "Parking Lot"];
  const devices = ["Mobile App", "Card Reader 01", "Keypad 05", "Web Portal", "Biometric Scanner"];

  const events: ActivityEvent[] = [];

  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const action = actions[type][Math.floor(Math.random() * actions[type].length)];
    const hoursAgo = Math.floor(Math.random() * 24 * 7); // Random time within last week

    events.push({
      id: `${userId}-event-${i}`,
      type,
      action,
      description: `${action} by user`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo),
      location: Math.random() > 0.5 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
      device: Math.random() > 0.5 ? devices[Math.floor(Math.random() * devices.length)] : undefined,
    });
  }

  // Sort by timestamp descending
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState("people");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setActivityLoading(true);

    // Simulate API call
    setTimeout(() => {
      setActivityEvents(generateMockActivity(userId));
      setActivityLoading(false);
    }, 500);
  };

  // Calculate metrics
  const metrics: IntelligenceMetric[] = useMemo(() => {
    const activeUsers = mockUsers.filter((u) => u.status === "active").length;
    const guestsExpiringToday = 0; // Placeholder for guests expiring today
    const mobileCredentials = mockUsers.filter((u) => u.credentials.mobile).length;
    const mobileSyncSuccess = Math.round((mobileCredentials / mockUsers.length) * 100);

    return [
      {
        id: "active-users",
        label: "Total Active Users",
        value: activeUsers,
        icon: Users,
        iconColor: "text-purple-500",
      },
      {
        id: "guests-expiring",
        label: "Guests Expiring Today",
        value: guestsExpiringToday,
        icon: Clock,
        iconColor: "text-orange-500",
      },
      {
        id: "mobile-sync",
        label: "Mobile Sync Success",
        value: `${mobileSyncSuccess}%`,
        icon: Smartphone,
        iconColor: "text-green-500",
      },
    ];
  }, []);

  // Define actions
  const actions: IntelligenceAction[] = [
    {
      id: "add-guest",
      label: "Add Guest",
      onClick: () => alert("Add Guest modal coming soon"),
      variant: "outline",
    },
    {
      id: "add-user",
      label: "Add User",
      icon: UserPlus,
      onClick: () => alert("Add User modal coming soon"),
      variant: "default",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto">
        {/* Intelligence Bar */}
        <IntelligenceBar metrics={metrics} actions={actions} />

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "people" && (
            <IdentityWorkstation
              users={mockUsers}
              onUserClick={handleUserClick}
              selectedUserId={selectedUserId}
              activityEvents={activityEvents}
              activityLoading={activityLoading}
            />
          )}

          {activeTab === "teams" && (
            <div className="bg-white rounded-lg border p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Teams Management</h2>
              <p className="text-gray-600">
                Team management interface coming soon. Organize people into teams with inherited permissions.
              </p>
            </div>
          )}

          {activeTab === "guests" && (
            <div className="bg-white rounded-lg border p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Guest Management</h2>
              <p className="text-gray-600">
                Guest management interface coming soon. Manage temporary access for visitors and contractors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
