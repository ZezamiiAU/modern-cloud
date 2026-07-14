/**
 * Partner Portal — shared presentational helpers.
 * Underscore prefix keeps this out of the App Router's route table.
 */
import type { DeviceHealth, AccessOutcome } from "@repo/api";

const HEALTH_STYLES: Record<
  DeviceHealth,
  { label: string; className: string }
> = {
  online: { label: "Online", className: "bg-green-100 text-green-700" },
  degraded: { label: "Degraded", className: "bg-amber-100 text-amber-700" },
  offline: { label: "Offline", className: "bg-red-100 text-red-700" },
  maintenance: {
    label: "Maintenance",
    className: "bg-slate-100 text-slate-600",
  },
};

export function HealthPill({ health }: { health: DeviceHealth }) {
  const s = HEALTH_STYLES[health];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

const OUTCOME_STYLES: Record<AccessOutcome, string> = {
  granted: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
  error: "bg-amber-100 text-amber-700",
};

export function OutcomePill({ outcome }: { outcome: AccessOutcome }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${OUTCOME_STYLES[outcome]}`}
    >
      {outcome}
    </span>
  );
}

/** Section title used at the top of each portal page. */
export function PortalHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-1">{subtitle}</p>
    </div>
  );
}

/** Format an ISO timestamp for display without pulling in a date library. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
