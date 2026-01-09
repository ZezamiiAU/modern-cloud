"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../lib/utils";
import {
  AccessIcon,
  LockersIcon,
  RoomsIcon,
  BookingsIcon,
  VisionIcon,
  CloudIcon,
} from "./product-icons";
import { Spinner } from "./spinner";

export type ProductType = "access" | "rooms" | "lockers" | "bookings" | "vision" | "cloud";

export interface ActivityEvent {
  id: string;
  type: ProductType;
  action: string;
  description: string;
  timestamp: Date;
  location?: string;
  device?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const productIconConfig: Record<ProductType, { Icon: React.ElementType; color: string; dotColor: string }> = {
  access: {
    Icon: AccessIcon,
    color: "text-purple-500",
    dotColor: "bg-purple-500",
  },
  rooms: {
    Icon: RoomsIcon,
    color: "text-teal-500",
    dotColor: "bg-teal-500",
  },
  lockers: {
    Icon: LockersIcon,
    color: "text-blue-500",
    dotColor: "bg-blue-500",
  },
  bookings: {
    Icon: BookingsIcon,
    color: "text-indigo-500",
    dotColor: "bg-indigo-500",
  },
  vision: {
    Icon: VisionIcon,
    color: "text-purple-400",
    dotColor: "bg-purple-400",
  },
  cloud: {
    Icon: CloudIcon,
    color: "text-gray-400",
    dotColor: "bg-gray-400",
  },
};

// Group events by date category
function groupEventsByDate(events: ActivityEvent[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: Record<string, ActivityEvent[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    Older: [],
  };

  events.forEach((event) => {
    const eventDate = new Date(event.timestamp);
    if (eventDate >= today) {
      groups.Today.push(event);
    } else if (eventDate >= yesterday) {
      groups.Yesterday.push(event);
    } else if (eventDate >= lastWeek) {
      groups["Last 7 days"].push(event);
    } else {
      groups.Older.push(event);
    }
  });

  // Remove empty groups
  return Object.entries(groups).filter(([_, events]) => events.length > 0);
}

function TimelineItem({ event, isLast }: { event: ActivityEvent; isLast: boolean }) {
  const config = productIconConfig[event.type];
  const Icon = config.Icon;

  return (
    <div className="relative flex gap-3 pb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 w-px h-full bg-gray-200" />
      )}

      {/* Icon and dot */}
      <div className={cn("relative flex items-center justify-center w-6 h-6 rounded-full bg-white border-2", config.dotColor.replace("bg-", "border-"))}>
        <Icon className={cn("w-3 h-3", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-sm text-gray-900">{event.action}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(event.timestamp, { addSuffix: true })}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{event.description}</p>

        {(event.location || event.device) && (
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {event.location && <span>{event.location}</span>}
            {event.location && event.device && <span>•</span>}
            {event.device && <span>{event.device}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityTimeline({
  events,
  loading = false,
  onLoadMore,
  hasMore = false,
  className,
}: ActivityTimelineProps) {
  const groupedEvents = groupEventsByDate(events);

  if (loading && events.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {groupedEvents.map(([groupName, groupEvents]) => (
        <div key={groupName}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {groupName}
          </h3>
          <div>
            {groupEvents.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLast={index === groupEvents.length - 1 && groupName === groupedEvents[groupedEvents.length - 1][0]}
              />
            ))}
          </div>
        </div>
      ))}

      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
