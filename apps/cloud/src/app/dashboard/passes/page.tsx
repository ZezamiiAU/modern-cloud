/**
 * Passes Management Page
 *
 * Admin interface for:
 * - Managing pass types (pricing, duration)
 * - Viewing active passes
 * - Generating QR codes for sites
 */

import { PageHeader } from "@repo/ui";

export default async function PassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Access & Passes"
        description="Manage pass types, view active passes, and generate QR codes for your sites"
      />

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pass Types</h3>
          <p className="text-sm text-muted-foreground">
            Configure pass types for each site with custom pricing and durations.
          </p>

          {/* TODO: Add tabs for Pass Types, Active Passes, and QR Generator */}
          <div className="text-center py-12 text-muted-foreground">
            Pass management UI coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
