import { mockAccessEvents } from "@/lib/partner/mock-data";
import { OutcomePill, PortalHeading, formatDateTime } from "../_components";

function eventLabel(eventType: string): string {
  return eventType.replace(/_/g, " ");
}

export default function PartnerActivityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PortalHeading
        title="Access Activity"
        subtitle="Unlocks, denials and alerts from the sites where you've installed locks."
      />

      <div className="bg-white rounded-lg border shadow-sm divide-y">
        {mockAccessEvents.map((e) => (
          <div key={e.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 capitalize">
                {eventLabel(e.eventType)}
                <span className="font-normal text-gray-500">
                  {" "}
                  • {e.deviceName}
                </span>
              </p>
              <p className="text-sm text-gray-500 truncate">
                {e.orgName} — {e.siteName}
                {e.actorName ? ` • ${e.actorName}` : ""}
              </p>
            </div>
            <OutcomePill outcome={e.outcome} />
            <span className="text-sm text-gray-400 shrink-0 w-28 text-right">
              {formatDateTime(e.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
