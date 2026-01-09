/**
 * Public Router - Slug resolution and public configuration
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { createRouter, publicProcedure } from "../trpc";
import { db, _siteSettings, passTypes, deviceRefs } from "../db";

export const publicRouter = createRouter({
  resolveSlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      // First, try to find by site slug
      const site = await db.query.siteRefs.findFirst({
        where: eq(siteRefs.slug, input.slug),
        with: {
          org: true,
        },
      });

      if (site) {
        // Get org settings for additional config
        const settings = await db.query.orgSettings.findFirst({
          where: eq(orgSettings.orgRefId, site.orgRefId),
        });

        return {
          slug: site.slug,
          orgId: site.orgRefId,
          siteId: site.id,
          siteName: site.displayName || site.slug,
          orgName: site.org.displayName || site.org.slug,
          logoUrl: null, // TODO: Add logo support
          timezone: settings?.timezone || "Australia/Sydney",
          features: {
            dayPass: true,
            bookings: false, // TODO: Implement bookings feature flag
          },
        };
      }

      // If not found, try org slug
      const org = await db.query.orgRefs.findFirst({
        where: eq(orgRefs.slug, input.slug),
      });

      if (org) {
        const settings = await db.query.orgSettings.findFirst({
          where: eq(orgSettings.orgRefIdg.id),
        });

        return {
          slug: org.slug,
          orgId: org.id,
          siteId: null,
          siteName: null,
          orgName: org.displayName || org.slug,
          logoUrl: null,
          timezone: settings?.timezone || "Australia/Sydney",
          features: {
            dayPass: true,
            bookings: false,
          },
        };
      }

      // TODO: Check slug history for redirects
      // Note: Implement redirect support once frontend can handle it
      // For now, just return NOT_FOUND

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Slug not found",
      });
    }),

  /**
   * Resolve org/site/device slug path
   *
   * Used for QR code URLs: /p/{orgSlug}/{siteSlug}/{deviceSlug}
   * Device slug is optional - can be site-wide QR
   */
  resolvePathSlugs: publicProcedure
    .input(z.object({
      orgSlug: z.string().min(1),
      siteSlug: z.string().min(1),
      deviceSlug: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Resolve org by slug
      const org = await db.query.orgRefs.findFirst({
        where: eq(orgRefs.slug, input.orgSlug),
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Resolve site by slug within org
      const site = await db.query.siteRefs.findFirst({
        where: and(
          eq(siteRefs.slug, input.siteSlug),
          eq(siteRefs.orgRefIdg.id)
        ),
      });

      if (!site) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Site not found",
        });
      }

      // Optionally resolve device if provided
      let device = null;
      if (input.deviceSlug) {
        device = await db.query.deviceRefs.findFirst({
          where: and(
            eq(deviceRefs.slug, input.deviceSlug),
            eq(deviceRefs.siteRefId, site.id)
          ),
        });

        if (!device) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Device not found",
          });
        }
      }

      // Get org settings
      const settings = await db.query.orgSettings.findFirst({
        where: eq(orgSettings.orgRefIdg.id),
      });

      return {
        org: {
          id: org.id,
          slug: org.slug,
          name: org.displayName || org.slug,
        },
        site: {
          id: site.id,
          slug: site.slug,
          name: site.displayName || site.slug,
        },
        device: device ? {
          id: device.id,
          slug: device.slug,
          name: device.displayName || device.slug,
          type: device.deviceType,
        } : null,
        logoUrl: null, // TODO: Add logo support
        timezone: settings?.timezone || "Australia/Sydney",
        features: {
          dayPass: true,
          bookings: false,
        },
      };
    }),

  getPassTypes: publicProcedure
    .input(z.object({ siteId: z.string() }))
    .query(async ({ input }) => {
      // Verify site exists
      const site = await db.query.siteRefs.findFirst({
        where: eq(siteRefs.id, input.siteId),
      });

      if (!site) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Site not found",
        });
      }

      // Query pass types from database
      const sitePassTypes = await db.query.passTypes.findMany({
        where: and(
          eq(passTypes.siteRefId, input.siteId),
          eq(passTypes.active, true)
        ),
        orderBy: (passTypes, { asc }) => [asc(passTypes.sortOrder), asc(passTypes.name)],
      });

      return sitePassTypes.map((pt) => ({
        id: pt.id,
        name: pt.name,
        description: pt.description || "",
        price_cents: pt.priceCents,
        currency: pt.currency,
        duration_hours: pt.durationHours,
      }));
    }),
});
