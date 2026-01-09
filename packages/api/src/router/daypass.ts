/**
 * Day Pass Router - Payment and pass issuance
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { createRouter, publicProcedure } from "../trpc";
import { db, passes, siteRefs, passTypes } from "../db";
import * as stripeService from "../services/stripe";
import { generatePassCode } from "../services/pass-codes";

export const daypassRouter = createRouter({
  createPaymentIntent: publicProcedure
    .input(z.object({
      siteId: z.string(),
      passTypeId: z.string(),
      email: z.string().email(),
      name: z.string().min(1),
      phone: z.string().optional(),
      vehiclePlate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Validate site exists
      const site = await db.query.siteRefs.findFirst({
        where: eq(siteRefs.id, input.siteId),
      });

      if (!site) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Site not found",
        });
      }

      // Fetch pass type from database
      const passType = await db.query.passTypes.findFirst({
        where: and(
          eq(passTypes.id, input.passTypeId),
          eq(passTypes.siteRefId, input.siteId),
          eq(passTypes.active, true)
        ),
      });

      if (!passType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pass type not found or inactive",
        });
      }

      // Create Stripe payment intent
      const result = await stripeService.createPaymentIntent({
        amount: passType.priceCents,
        currency: passType.currency,
        metadata: {
          siteId: input.siteId,
          passTypeId: input.passTypeId,
          email: input.email,
          name: input.name,
          phone: input.phone || "",
          vehiclePlate: input.vehiclePlate || "",
        },
      });

      return {
        clientSecret: result.clientSecret,
        amount: result.amount,
        currency: result.currency,
        paymentIntentId: result.paymentIntentId,
      };
    }),

  issuePass: publicProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ input, _ctx }) => {
      // Verify payment was successful
      const isPaymentSuccessful = await stripeService.verifyPayment(
        input.paymentIntentId
      );

      if (!isPaymentSuccessful) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment not completed",
        });
      }

      // Retrieve payment intent to get metadata
      const paymentIntent = await stripeService.getPaymentIntent(
        input.paymentIntentId
      );

      const metadata = paymentIntent.metadata;
      if (!metadata.siteId || !metadata.passTypeId || !metadata.email || !metadata.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payment metadata",
        });
      }

      // Get site and org info
      const site = await db.query.siteRefs.findFirst({
        where: eq(siteRefs.id, metadata.siteId),
        with: {
          org: true,
        },
      });

      if (!site) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Site not found",
        });
      }

      // Get pass type configuration for duration
      const passTypeConfig = await db.query.passTypes.findFirst({
        where: eq(passTypes.id, metadata.passTypeId),
      });

      if (!passTypeConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pass type configuration not found",
        });
      }

      // Calculate validity period from pass type
      const validFrom = new Date();
      const validTo = new Date(
        validFrom.getTime() + passTypeConfig.durationHours * 60 * 60 * 1000
      );

      // Generate unique pass code
      const code = generatePassCode();

      // Create pass in database
      const [newPass] = await db
        .insert(passes)
        .values({
          orgRefId: site.orgRefId,
          siteRefId: site.id,
          passTypeId: metadata.passTypeId,
          code,
          passType: "visitor",
          status: "active",
          validFrom,
          validTo,
          visitorName: metadata.name,
          visitorEmail: metadata.email,
          visitorPhone: metadata.phone || null,
          vehiclePlate: metadata.vehiclePlate || null,
          stripePaymentIntentId: input.paymentIntentId,
          metadata: {
            passTypeName: passTypeConfig.name,
            amountPaid: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        })
        .returning();

      if (!newPass) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create pass",
        });
      }

      return {
        passId: newPass.id,
        code: newPass.code,
        validFrom: newPass.validFrom?.toISOString() || validFrom.toISOString(),
        expiresAt: newPass.validTo?.toISOString() || validTo.toISOString(),
        passType: passTypeConfig.name,
        siteName: site.displayName || site.slug,
      };
    }),

  validatePass: publicProcedure
    .input(z.object({
      code: z.string(),
      orgRefId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Find pass by code
      const pass = await db.query.passes.findFirst({
        where: input.orgRefId
          ? and(
              eq(passes.code, input.code),
              eq(passes.orgRefId, input.orgRefId)
            )
          : eq(passes.code, input.code),
        with: {
          site: true,
          org: true,
        },
      });

      if (!pass) {
        return {
          valid: false,
          reason: `Pass ${input.code} not found`
        };
      }

      // Check if pass is active
      if (pass.status !== "active") {
        return {
          valid: false,
          reason: `Pass is ${pass.status}`
        };
      }

      // Check if pass is within valid time range
      const now = new Date();
      if (pass.validFrom && now < pass.validFrom) {
        return {
          valid: false,
          reason: "Pass not yet valid"
        };
      }

      if (pass.validTo && now > pass.validTo) {
        return {
          valid: false,
          reason: "Pass has expired"
        };
      }

      return {
        valid: true,
        pass: {
          id: pass.id,
          code: pass.code,
          passType: pass.passType,
          visitorName: pass.visitorName,
          visitorEmail: pass.visitorEmail,
          validFrom: pass.validFrom?.toISOString(),
          validTo: pass.validTo?.toISOString(),
          siteName: pass.site?.displayName || pass.site?.slug || "Unknown",
          orgName: pass.org?.displayName || pass.org?.slug || "Unknown",
        },
      };
    }),

  getPassByPaymentIntent: publicProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .query(async ({ input }) => {
      // Find pass by Stripe payment intent ID
      const pass = await db.query.passes.findFirst({
        where: eq(passes.stripePaymentIntentId, input.paymentIntentId),
        with: {
          site: true,
          org: true,
          passTypeConfig: true,
        },
      });

      if (!pass) {
        // Check if payment exists but pass not yet created
        const paymentIntent = await stripeService.getPaymentIntent(input.paymentIntentId);

        if (paymentIntent.status === "succeeded") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Payment succeeded but pass not created. Please contact support.",
          });
        }

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pass not found for this payment",
        });
      }

      return {
        id: pass.id,
        code: pass.code,
        passType: pass.passTypeConfig?.name || pass.passType,
        validFrom: pass.validFrom?.toISOString(),
        validTo: pass.validTo?.toISOString(),
        visitorName: pass.visitorName,
        visitorEmail: pass.visitorEmail,
        visitorPhone: pass.visitorPhone,
        vehiclePlate: pass.vehiclePlate,
        siteName: pass.site?.displayName || pass.site?.slug || "Unknown",
        orgName: pass.org?.displayName || pass.org?.slug || "Unknown",
        status: pass.status,
      };
    }),

  syncPayment: publicProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ input }) => {
      // Check if pass already exists
      const existingPass = await db.query.passes.findFirst({
        where: eq(passes.stripePaymentIntentId, input.paymentIntentId),
      });

      if (existingPass) {
        return {
          success: true,
          message: "Pass already exists",
          passId: existingPass.id,
        };
      }

      // Verify payment status with Stripe
      const paymentIntent = await stripeService.getPaymentIntent(input.paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Payment status is ${paymentIntent.status}`,
        });
      }

      // Get metadata from payment intent
      const metadata = paymentIntent.metadata;
      if (!metadata.siteId || !metadata.passTypeId || !metadata.email || !metadata.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid payment metadata",
        });
      }

      // Get site and org info
      const site = await db.query.siteRefs.findFirst({
        where: eq(siteRefs.id, metadata.siteId),
        with: {
          org: true,
        },
      });

      if (!site) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Site not found",
        });
      }

      // Get pass type configuration
      const passTypeConfig = await db.query.passTypes.findFirst({
        where: eq(passTypes.id, metadata.passTypeId),
      });

      if (!passTypeConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pass type configuration not found",
        });
      }

      // Calculate validity period
      const validFrom = new Date();
      const validTo = new Date(
        validFrom.getTime() + passTypeConfig.durationHours * 60 * 60 * 1000
      );

      // Generate unique pass code
      const code = generatePassCode();

      // Create pass in database
      const [newPass] = await db
        .insert(passes)
        .values({
          orgRefId: site.orgRefId,
          siteRefId: site.id,
          passTypeId: metadata.passTypeId,
          code,
          passType: "visitor",
          status: "active",
          validFrom,
          validTo,
          visitorName: metadata.name,
          visitorEmail: metadata.email,
          visitorPhone: metadata.phone || null,
          vehiclePlate: metadata.vehiclePlate || null,
          stripePaymentIntentId: input.paymentIntentId,
          metadata: {
            passTypeName: passTypeConfig.name,
            amountPaid: paymentIntent.amount,
            currency: paymentIntent.currency,
            syncedManually: true,
          },
        })
        .returning();

      if (!newPass) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create pass",
        });
      }

      return {
        success: true,
        message: "Pass created successfully",
        passId: newPass.id,
        code: newPass.code,
      };
    }),
});
