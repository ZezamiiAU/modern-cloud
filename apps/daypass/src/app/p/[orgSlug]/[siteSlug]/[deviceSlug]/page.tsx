"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@repo/ui"
import { PassPurchaseForm } from "@/components/pass-purchase-form"
import { trpc } from "@/lib/trpc"

interface PageProps {
  params: {
    orgSlug: string
    siteSlug: string
    deviceSlug: string
  }
}

export default function DevicePassPage({ params }: PageProps) {
  const { orgSlug, siteSlug, deviceSlug } = params
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)

  // Resolve slugs to get org/site/device info
  const { data: context, isLoading, error } = trpc.public.resolvePathSlugs.useQuery({
    orgSlug,
    siteSlug,
    deviceSlug,
  })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </main>
    )
  }

  if (error || !context) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Point Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This location could not be found. Please check the QR code or contact support.
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!showPurchaseForm) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="absolute top-[15%]">
          <div className="text-white text-4xl font-bold">
            Zezamii Pass
          </div>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Location Info */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Day Pass</h1>
            <p className="text-xl text-slate-300">{context.device?.name || "Access Point"}</p>
            <p className="text-lg text-slate-400">{context.site.name}</p>
            {context.org && (
              <p className="text-sm text-slate-500">{context.org.name}</p>
            )}
          </div>

          {/* Buy Pass Button */}
          <Button
            onClick={() => setShowPurchaseForm(true)}
            className="w-full h-14 text-lg bg-brand text-brand-foreground hover:bg-brand/90"
            size="lg"
          >
            Buy Pass
          </Button>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-8 text-center text-slate-400 text-sm">
          Powered by Zezamii
        </footer>
      </main>
    )
  }

  // Show purchase form
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PassPurchaseForm
          organizationId={context.org?.id || ""}
          organizationName={context.org?.name}
          siteId={context.site.id}
          siteName={context.site.name}
          deviceId={context.device?.id || context.site.id}
          deviceName={context.device?.name}
        />
      </div>
    </main>
  )
}
