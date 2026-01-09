"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { ActivityTimeline, type ActivityEvent } from "./activity-timeline";
import { StatusBadge } from "./status-badge";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  team: string;
  role: string;
  status: "active" | "inactive" | "pending";
  activeCoverage?: {
    spacesAllowed: number;
    devicesAllowed: number;
  };
}

export interface ActivityDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User;
  events: ActivityEvent[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function ActivityDrawer({
  open,
  onClose,
  user,
  events,
  loading = false,
  onLoadMore,
  hasMore = false,
  className,
}: ActivityDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className={cn("w-full sm:max-w-[560px] p-0", className)}>
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="border-b border-gray-200 p-6">
            <SheetHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl mb-1">{user.name}</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mb-2">
                    {user.email}
                  </SheetDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{user.team}</span>
                    <span>•</span>
                    <span>{user.role}</span>
                    <span>•</span>
                    <StatusBadge status={user.status} size="sm" />
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Active Coverage */}
            {user.activeCoverage && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Active Coverage
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Spaces</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.activeCoverage.spacesAllowed}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Devices</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.activeCoverage.devicesAllowed}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Activity Timeline
              </h3>
              <ActivityTimeline
                events={events}
                loading={loading}
                onLoadMore={onLoadMore}
                hasMore={hasMore}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
