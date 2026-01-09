import { type NextRequest, NextResponse } from "next/server"
import * as jose from "jose"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const passId = searchParams.get("passId")
    const code = searchParams.get("code")
    const passType = searchParams.get("passType")
    const validFrom = searchParams.get("validFrom")
    const validTo = searchParams.get("validTo")
    const siteName = searchParams.get("siteName")
    const vehiclePlate = searchParams.get("vehiclePlate")

    const GOOGLE_WALLET_SA_JSON = process.env.GOOGLE_WALLET_SA_JSON
    const ISSUER_ID = process.env.WALLET_ISSUER_ID
    const CLASS_ID = process.env.WALLET_CLASS_ID
    const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3001"

    if (!GOOGLE_WALLET_SA_JSON || !ISSUER_ID || !CLASS_ID) {
      return NextResponse.json(
        {
          error: "Google Wallet not configured",
          details: "Missing required environment variables",
        },
        { status: 500 }
      )
    }

    let svc: unknown
    try {
      svc = JSON.parse(GOOGLE_WALLET_SA_JSON)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Google Wallet configuration error",
          details: "Invalid service account JSON",
        },
        { status: 500 }
      )
    }

    const userId = (passId || "user-001").toLowerCase().replace(/[^a-z0-9_-]/g, "_")
    const objectId = `${ISSUER_ID}.${userId}`.toLowerCase()

    const fmt = (iso?: string) => {
      if (!iso) return "N/A"
      const date = new Date(iso)
      return date.toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    }

    const instructions = code
      ? `Enter this PIN at the keypad at ${siteName || "the access point"} to gain access. Valid until ${fmt(validTo)}.`
      : "Contact support for your PIN."

    const genericObject = {
      id: objectId,
      classId: CLASS_ID,
      cardTitle: {
        defaultValue: {
          language: "en-US",
          value: "Access Pass",
        },
      },
      header: {
        defaultValue: {
          language: "en-US",
          value: "Your Access PIN",
        },
      },
      heroImage: {
        sourceUri: { uri: "https://www.zezamii.com/images/zezamii-banner.png" },
      },
      logo: {
        sourceUri: { uri: "https://www.zezamii.com/images/zezamii-logo-horizontal.png" },
      },
      hexBackgroundColor: "#1F2937",
      state: "ACTIVE",
      textModulesData: [
        ...(code
          ? [
              {
                id: "pin",
                header: "YOUR ACCESS PIN",
                body: code,
              },
            ]
          : []),
        {
          id: "access_point",
          header: "Location",
          body: siteName || "Access Point",
        },
        {
          id: "pass_type",
          header: "Pass Type",
          body: passType || "Day Pass",
        },
        ...(validFrom
          ? [
              {
                id: "valid_from",
                header: "Valid From",
                body: fmt(validFrom),
              },
            ]
          : []),
        ...(validTo
          ? [
              {
                id: "valid_to",
                header: "Valid Until",
                body: fmt(validTo),
              },
            ]
          : []),
        ...(vehiclePlate
          ? [
              {
                id: "vehicle",
                header: "Vehicle",
                body: vehiclePlate,
              },
            ]
          : []),
        {
          id: "instructions",
          header: "Instructions",
          body: instructions,
        },
      ],
      linksModuleData: {
        uris: [
          { id: "support", uri: "https://zezamii.com/support", description: "Help & Support" },
        ],
      },
    }

    const genericClass = {
      id: CLASS_ID,
      classTemplateInfo: {
        cardTemplateOverride: {
          cardRowTemplateInfos: [
            {
              oneItem: {
                item: {
                  firstValue: {
                    fields: [{ fieldPath: "object.textModulesData['pin']" }],
                  },
                },
              },
            },
            {
              twoItems: {
                startItem: {
                  firstValue: {
                    fields: [{ fieldPath: "object.textModulesData['access_point']" }],
                  },
                },
                endItem: {
                  firstValue: {
                    fields: [{ fieldPath: "object.textModulesData['pass_type']" }],
                  },
                },
              },
            },
            {
              twoItems: {
                startItem: {
                  firstValue: {
                    fields: [{ fieldPath: "object.textModulesData['valid_from']" }],
                  },
                },
                endItem: {
                  firstValue: {
                    fields: [{ fieldPath: "object.textModulesData['valid_to']" }],
                  },
                },
              },
            },
            {
              oneItem: {
                item: {
                  firstValue: {
                    fields: [{ fieldPath: "object.textModulesData['instructions']" }],
                  },
                },
              },
            },
          ],
        },
      },
    }

    const requestOrigin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/")
    const origins = [APP_ORIGIN]

    if (requestOrigin && requestOrigin !== APP_ORIGIN) {
      if (requestOrigin.includes("vercel.app") || requestOrigin.includes("localhost")) {
        origins.push(requestOrigin)
      }
    }

    const payload = {
      iss: svc.client_email,
      aud: "google",
      typ: "savetowallet",
      origins: origins,
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericClasses: [genericClass],
        genericObjects: [genericObject],
      },
    }

    const privateKey = await jose.importPKCS8(svc.private_key, "RS256")

    const token = await new jose.SignJWT(payload as unknown)
      .setProtectedHeader({
        alg: "RS256",
        kid: svc.private_key_id,
        typ: "JWT",
      })
      .sign(privateKey)

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({
      saveUrl,
      objectId,
    })
  } catch (error) {
    console.error("Google Wallet error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate Google Wallet pass",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
