/**
 * Zezamii Product Icons
 * Custom SVG icons for each product in the Zezamii platform
 */

import * as React from "react";
import { cn } from "../lib/utils";

interface IconProps {
  className?: string;
}

export function RoomsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      {/* Suitcase/Bag icon */}
      <path
        d="M12 5C12 3.89543 11.1046 3 10 3H14C14.8954 3 16 3.89543 16 5V6H8V5C8 3.89543 8.89543 3 10 3H14Z"
        fill="currentColor"
        opacity="0.3"
      />
      <rect x="4" y="6" width="16" height="14" rx="2" fill="currentColor" />
      <rect x="6.5" y="9" width="1.5" height="8" rx="0.75" fill="#000" opacity="0.2" />
      <rect x="16" y="9" width="1.5" height="8" rx="0.75" fill="#000" opacity="0.2" />
    </svg>
  );
}

export function LockersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      {/* Three lockers side by side */}
      <rect x="3" y="4" width="5.5" height="16" rx="1" fill="currentColor" />
      <rect x="9.25" y="4" width="5.5" height="16" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="15.5" y="4" width="5.5" height="16" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="4.75" y="9" width="0.8" height="6" rx="0.4" fill="#000" opacity="0.3" />
      <rect x="11" y="9" width="0.8" height="6" rx="0.4" fill="#000" opacity="0.3" />
      <rect x="17.25" y="9" width="0.8" height="6" rx="0.4" fill="#000" opacity="0.3" />
    </svg>
  );
}

export function VisionIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      {/* Eye icon */}
      <ellipse cx="12" cy="12" rx="9" ry="6" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="#fff" />
    </svg>
  );
}

export function BookingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      {/* Stacked bars/layers icon */}
      <rect x="5" y="4" width="14" height="3" rx="1.5" fill="currentColor" />
      <rect x="7" y="8.5" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="7" y="13" width="10" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="5" y="17.5" width="14" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function AccessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      {/* Two people with checkmarks */}
      <circle cx="8" cy="7" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="16" cy="7" r="2.5" fill="currentColor" opacity="0.3" />
      <path
        d="M4 17C4 14.2386 6.23858 12 9 12C9.33 12 9.66 12.03 9.98 12.08"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M14.02 12.08C14.34 12.03 14.67 12 15 12C17.7614 12 20 14.2386 20 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path d="M7 15L9 17L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 15L17 17L21 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("w-5 h-5", className)}>
      {/* Zezamii stacked bars logo */}
      <rect x="6" y="4" width="12" height="3" rx="1.5" fill="currentColor" />
      <rect x="8" y="8.5" width="8" height="3" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="8" y="13" width="8" height="3" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="6" y="17.5" width="12" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}
