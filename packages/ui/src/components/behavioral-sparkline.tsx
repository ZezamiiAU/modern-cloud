"use client";

import * as React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "../lib/utils";

export interface BehavioralSparklineProps {
  data: number[]; // 7 data points for last 7 days
  width?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  className?: string;
}

interface ChartDataPoint {
  value: number;
  day: string;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BehavioralSparkline({
  data,
  width,
  height = 24,
  color = "#3b82f6", // blue-500
  showTooltip = true,
  className,
}: BehavioralSparklineProps) {
  // Transform data into format Recharts expects
  const chartData: ChartDataPoint[] = data.map((value, index) => ({
    value,
    day: dayLabels[index] || `Day ${index + 1}`,
  }));

  // Calculate color intensity based on max value
  const maxValue = Math.max(...data, 1); // Prevent division by zero
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length;

  // Determine color intensity
  const getStrokeColor = () => {
    if (avgValue > maxValue * 0.7) return color; // High activity
    if (avgValue > maxValue * 0.4) return color; // Medium activity
    return "#94a3b8"; // Low activity - gray
  };

  return (
    <div
      className={cn("inline-block", className)}
      style={{ width: width || 80, height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-md bg-popover px-2 py-1 text-xs shadow-md border">
                      <p className="font-medium">{payload[0].payload.day}</p>
                      <p className="text-muted-foreground">
                        {payload[0].value} events
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={getStrokeColor()}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
