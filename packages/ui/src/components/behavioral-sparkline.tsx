"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface BehavioralSparklineProps {
  data: number[]; // 7 data points for last 7 days
  width?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  className?: string;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Lightweight SVG sparkline - no recharts dependency
export const BehavioralSparkline = React.memo(function BehavioralSparkline({
  data,
  width = 80,
  height = 24,
  color = "#3b82f6",
  showTooltip = true,
  className,
}: BehavioralSparklineProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Calculate path and normalized values
  const { path, points, strokeColor } = React.useMemo(() => {
    if (data.length === 0) return { path: "", points: [], strokeColor: "#94a3b8" };

    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;
    const avgValue = data.reduce((a, b) => a + b, 0) / data.length;

    // Determine stroke color based on activity
    const stroke = avgValue > maxValue * 0.4 ? color : "#94a3b8";

    // Calculate points
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pts = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
      return { x, y, value };
    });

    // Create SVG path
    const pathData = pts
      .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(" ");

    return { path: pathData, points: pts, strokeColor: stroke };
  }, [data, width, height, color]);

  return (
    <div
      className={cn("inline-block relative", className)}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Main line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Invisible hit areas for tooltip */}
        {showTooltip &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={6}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(index)}
            />
          ))}

        {/* Visible dot on hover */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <circle
            cx={points[hoveredIndex].x}
            cy={points[hoveredIndex].y}
            r={3}
            fill={strokeColor}
          />
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-50 rounded-md bg-popover px-2 py-1 text-xs shadow-md border pointer-events-none"
          style={{
            left: points[hoveredIndex].x,
            top: -28,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-medium">{dayLabels[hoveredIndex] || `Day ${hoveredIndex + 1}`}</p>
          <p className="text-muted-foreground">{points[hoveredIndex].value} events</p>
        </div>
      )}
    </div>
  );
});
