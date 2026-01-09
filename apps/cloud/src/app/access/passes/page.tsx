"use client";

import { useState } from "react";
import { CreditCard, Plus, QrCode } from "lucide-react";
import { IntelligenceBar, type IntelligenceMetric, type IntelligenceAction } from "@repo/ui";
import { PassesTable } from "@/components/passes-table";
import { QRGenerator } from "@/components/qr-generator";

// Tab navigation
const tabs = [
  { id: "passes", label: "Passes", icon: CreditCard },
  { id: "qr-generator", label: "QR Generator", icon: QrCode },
];

export default function AccessPassesPage() {
  const [activeTab, setActiveTab] = useState("passes");

  // Intelligence metrics
  const metrics: IntelligenceMetric[] = [
    {
      id: "active-passes",
      label: "Active Passes",
      value: 247,
      iconColor: "text-cyan-500",
    },
    {
      id: "expires-today",
      label: "Expiring Today",
      value: 12,
      iconColor: "text-orange-500",
    },
    {
      id: "visitor-passes",
      label: "Visitor Passes",
      value: 86,
      iconColor: "text-purple-500",
    },
  ];

  // Actions
  const actions: IntelligenceAction[] = [
    {
      id: "issue-pass",
      label: "Issue Pass",
      icon: Plus,
      onClick: () => alert("Issue pass modal coming soon"),
      variant: "default",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto">
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
                    pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                    ${
                      activeTab === tab.id
                        ? "border-cyan-500 text-cyan-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "passes" && <PassesTable />}
          {activeTab === "qr-generator" && <QRGenerator />}
        </div>
      </div>
    </div>
  );
}
