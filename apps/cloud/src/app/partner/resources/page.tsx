import Link from "next/link";
import {
  BookOpen,
  Megaphone,
  LifeBuoy,
  Cpu,
  Bell,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import type { PartnerResourceCategory } from "@repo/api";
import { mockPartner, mockResources } from "@/lib/partner/mock-data";
import { PortalHeading, formatDate } from "../_components";

const CATEGORY_META: Record<
  PartnerResourceCategory,
  { label: string; icon: LucideIcon; tint: string }
> = {
  guide: { label: "Guide", icon: BookOpen, tint: "text-sky-600 bg-sky-50" },
  marketing: {
    label: "Marketing",
    icon: Megaphone,
    tint: "text-violet-600 bg-violet-50",
  },
  support: {
    label: "Support",
    icon: LifeBuoy,
    tint: "text-green-600 bg-green-50",
  },
  firmware: {
    label: "Firmware",
    icon: Cpu,
    tint: "text-indigo-600 bg-indigo-50",
  },
  announcement: {
    label: "Announcement",
    icon: Bell,
    tint: "text-amber-600 bg-amber-50",
  },
};

export default function PartnerResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PortalHeading
        title="Resources"
        subtitle={`Guides, firmware and co-branded material for ${mockPartner.name}.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockResources.map((r) => {
          const meta = CATEGORY_META[r.category];
          const Icon = meta.icon;
          return (
            <Link
              key={r.id}
              href={r.url}
              className="group bg-white rounded-lg border shadow-sm p-5 hover:border-sky-300 hover:shadow transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.tint}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-sky-500" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-gray-900">{r.title}</h2>
                {r.coBranded && (
                  <span className="inline-flex rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    Co-branded
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{r.description}</p>
              <p className="text-xs text-gray-400 mt-3">
                {meta.label} • updated {formatDate(r.updatedAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
