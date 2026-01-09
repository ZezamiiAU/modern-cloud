/**
 * Admin Router
 *
 * Endpoints for administrative operations like QR code generation
 */

import { createRouter, publicProcedure } from "../trpc"
import { db } from "../db"
import { deviceRefs, siteRefs, orgRefs } from "../db/schema"
import { eq } from "drizzle-orm"

export const adminRouter = createRouter({
  /**
   * Get all devices with their org and site refs for QR code generation
   */
  getDevicesWithRefs: publicProcedure.query(async () => {
    const devices = await db
      .select({
        deviceRef: deviceRefs,
        siteRef: siteRefs,
        orgRef: orgRefs,
      })
      .from(deviceRefs)
      .innerJoin(siteRefs, eq(deviceRefs.siteRefId, siteRefs.id))
      .innerJoin(orgRefs, eq(deviceRefs.orgRefId, orgRefs.id))

    return devices
  }),
})
