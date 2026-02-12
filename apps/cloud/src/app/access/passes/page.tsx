"use client";

import { useState, memo } from "react";
import dynamic from "next/dynamic";
import { CreditCard, Plus, QrCode, Loader2 } from "lucide-react";
import { IntelligenceBar, type IntelligenceMetric, type IntelligenceAction } from "@repo/ui";
import { PassesTable } from "@/components/passes-table";

// Lazy load QRGenerator - it's heavy due to qr-code-styling library
const QRGenerator = dynamic(
  () => import("@/components/qr-generator").then((mod) => ({ default: mod.QRGenerator })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false,
  }
);

// Tab navigation - static, defined outside component
const tabs = [
  { id: "passes", label: "Passes", icon: CreditCard },
  { id: "qr-generator", label: "QR Generator", icon: QrCode },
] as const;

// Memoized tab button
const TabButton = memo(function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: (typeof tabs)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`
        pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
        ${
          isActive
            ? "border-cyan-500 text-cyan-600"
            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </button>
  );
});

// Static metrics - defined outside component
const METRICS: IntelligenceMetric[] = [
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

// Static actions - defined outside component
const ACTIONS: IntelligenceAction[] = [
  {
    id: "issue-pass",
    label: "Issue Pass",
    icon: Plus,
    onClick: () => alert("Issue pass modal coming soon"),
    variant: "default",
  },
];

export default function AccessPassesPage() {
  const [activeTab, setActiveTab] = useState<string>("passes");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1800px] mx-auto">
        {/* Intelligence Bar */}
        <IntelligenceBar metrics={METRICS} actions={ACTIONS} />

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
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
