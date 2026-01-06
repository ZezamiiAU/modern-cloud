/**
 * DataTable - Server Component
 *
 * For server rendering, uses simple column definitions with built-in formatters.
 * For complex custom rendering, wrap in a client component.
 */

import * as React from "react";
import { cn } from "../lib/utils";

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------ */

export type ColumnFormat = "text" | "mono" | "muted" | "status";

export interface Column<T> {
  key: keyof T;
  header: string;
  format?: ColumnFormat;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  description?: string;
  className?: string;
}

/* ------------------------------------------------------------------
   StatusBadge - Server Component
------------------------------------------------------------------ */

export interface StatusBadgeProps {
  status: "success" | "failed" | "pending" | "warning";
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    warning: "bg-orange-100 text-orange-700",
  };

  const defaultLabels = {
    success: "SUCCESS",
    failed: "FAILED",
    pending: "PENDING",
    warning: "WARNING",
  };

  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 text-xs font-medium rounded",
        styles[status]
      )}
    >
      {label || defaultLabels[status]}
    </span>
  );
}

/* ------------------------------------------------------------------
   Cell Formatter
------------------------------------------------------------------ */

function formatCell<T>(value: T[keyof T], format?: ColumnFormat): React.ReactNode {
  const strValue = String(value);

  switch (format) {
    case "mono":
      return <span className="font-mono text-xs text-muted-foreground">{strValue}</span>;
    case "muted":
      return <span className="text-muted-foreground">{strValue}</span>;
    case "status":
      return <StatusBadge status={strValue as StatusBadgeProps["status"]} />;
    default:
      return strValue;
  }
}

/* ------------------------------------------------------------------
   DataTable Component
------------------------------------------------------------------ */

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  title,
  description,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm", className)}>
      {(title || description) && (
        <div className="p-5 border-b">
          {title && <h2 className="font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn("px-5 py-3 text-sm", col.className)}
                  >
                    {formatCell(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
