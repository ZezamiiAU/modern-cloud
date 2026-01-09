/**
 * Events Router - Access events and audit logging
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, lt } from "drizzle-orm";
import { createRouter, publicProcedure, protectedProcedure } from "../trpc";
import { db, passEvents, passes, siteRefs, auditLog } from "../db";

export const eventsRouter = createRouter({
  /**
   * Record a pass event (scan, entry, exit, denied)
   * Public endpoint - devices can record without full auth
   */
  record: publicProcedure
    .input(z.object({
      passId: z.string().uuid(),
      eventType: z.enum(["scanned", "entry", "exit", "denied"]),
      deviceRefId: z.string().uuid().optional(),
      location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        address: z.string().optional(),
      }).optional(),
      metadata: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Verify pass exists
      const pass = await db.query.passes.findFirst({
        where: eq(passes.id, input.passId),
      });

      if (!pass) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pass not found",
        });
      }

      // Create pass event
      const [event] = await db
        .insert(passEvents)
        .values({
          passId: input.passId,
          eventType: input.eventType,
          deviceRefId: input.deviceRefId,
          location: input.location || null,
          metadata: input.metadata || {},
        })
        .returning();

      if (!event) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record event",
        });
      }

      return {
        recorded: true,
        eventId: event.id,
        createdAt: event.createdAt.toISOString(),
      };
    }),

  /**
   * List pass events for a site (protected - requires auth)
   */
  list: protectedProcedure
    .input(z.object({
      siteId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(), // ISO timestamp for pagination
    }))
    .query(async ({ input, _ctx }) => {
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

      // TODO: Verify user has access to this site via membership

      // Build query conditions
      const conditions = [eq(passes.siteRefId, input.siteId)];

      if (input.cursor) {
        const cursorDate = new Date(input.cursor);
        conditions.push(lt(passEvents.createdAt, cursorDate));
      }

      // Query pass events with pass details
      const events = await db.query.passEvents.findMany({
        where: input.cursor
          ? and(...conditions)
          : eq(passes.siteRefId, input.siteId),
        orderBy: desc(passEvents.createdAt),
        limit: input.limit + 1, // Fetch one extra for cursor
        with: {
          pass: {
            columns: {
              code: true,
              passType: true,
              visitorName: true,
              visitorEmail: true,
            },
          },
        },
      });

      // Determine if there are more results
      const hasMore = events.length > input.limit;
      const items = hasMore ? events.slice(0, input.limit) : events;

      // Get next cursor
      const nextCursor = hasMore
        ? items[items.length - 1]?.createdAt.toISOString()
        : undefined;

      return {
        events: items.map((event) => ({
          id: event.id,
          passId: event.passId,
          eventType: event.eventType,
          deviceRefId: event.deviceRefId,
          location: event.location as Record<string, unknown> | null,
          metadata: event.metadata as Record<string, unknown>,
          createdAt: event.createdAt.toISOString(),
          pass: {
            code: event.pass.code,
            passType: event.pass.passType,
            visitorName: event.pass.visitorName,
            visitorEmail: event.pass.visitorEmail,
          },
        })),
        nextCursor,
        hasMore,
      };
    }),

  /**
   * Record audit log entry (for admin actions)
   */
  recordAudit: protectedProcedure
    .input(z.object({
      action: z.string(),
      resourceType: z.string().optional(),
      resourceId: z.string().uuid().optional(),
      metadata: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get org context from user's current org
      const orgRefId = ctx.orgRefId;

      if (!orgRefId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Organization context required",
        });
      }

      // Create audit log entry
      const [entry] = await db
        .insert(auditLog)
        .values({
          orgRefId,
          userId: ctx.user!.id,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          metadata: input.metadata || {},
          ipAddress: null, // TODO: Extract from request headers
          userAgent: null, // TODO: Extract from request headers
        })
        .returning();

      if (!entry) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record audit log",
        });
      }

      return {
        recorded: true,
        auditId: entry.id,
      };
    }),
});
