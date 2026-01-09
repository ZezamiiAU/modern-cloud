/**
 * Legacy Router - Controlled access to legacy APIs
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createRouter, protectedProcedure } from "../trpc";
import { db, siteRefs, orgRefs } from "../db";
import * as legacyApi from "../services/legacy-api";

export const legacyRouter = createRouter({
  /**
   * Get devices for a site from legacy system
   */
  getDevices: protectedProcedure
    .input(z.object({ siteId: z.string().uuid() }))
    .query(async ({ input, _ctx }) => {
      // Verify site exists in PostgreSQL
      const site = await db.query.siteRefs.findFirst({
        where: eq(siteRefs.id, input.siteId),
      });

      if (!site) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Site not found",
        });
      }

      // TODO: Verify user has access to this site via membership

      // Check if legacy API is available
      if (!legacyApi.isLegacyApiAvailable()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Legacy API not configured",
        });
      }

      try {
        // Fetch devices from legacy system using external site ID
        const devices = await legacyApi.getLegacyDevices(site.externalSiteId);

        return devices.map((device) => ({
          id: device.id,
          siteId: device.siteId,
          name: device.name,
          type: device.type,
          location: device.location,
          online: device.online,
          lastSeen: device.lastSeen,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch devices from legacy API: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get sites for an organization from legacy system
   */
  getSites: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input, _ctx }) => {
      // Verify org exists in PostgreSQL
      const org = await db.query.orgRefs.findFirst({
        where: eq(orgRefs.id, input.orgId),
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // TODO: Verify user has access to this org via membership

      // Check if legacy API is available
      if (!legacyApi.isLegacyApiAvailable()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Legacy API not configured",
        });
      }

      try {
        // Fetch sites from legacy system using external org ID
        const sites = await legacyApi.getLegacySites(org.externalOrgId);

        return sites.map((site) => ({
          id: site.id,
          orgId: site.orgId,
          name: site.name,
          address: site.address,
          timezone: site.timezone,
          active: site.active,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch sites from legacy API: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Request an unlock for a device via legacy system
   */
  requestUnlock: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      reason: z.string().min(1).max(500),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if legacy API is available
      if (!legacyApi.isLegacyApiAvailable()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Legacy API not configured",
        });
      }

      // Get authenticated user ID
      const userId = ctx.user!.id;

      try {
        // Request unlock via legacy API
        const result = await legacyApi.requestLegacyUnlock({
          deviceId: input.deviceId,
          userId,
          reason: input.reason,
        });

        // TODO: Record unlock attempt in audit log

        return {
          success: result.success,
          message: result.message,
          unlockId: result.unlockId,
          timestamp: result.timestamp,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to request unlock: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});
