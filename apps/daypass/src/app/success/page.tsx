"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui"
import { Button } from "@repo/ui"
import { Alert, AlertDescription } from "@repo/ui"
import { trpc } from "@/lib/trpc"
import { format } from "date-fns"
import { MessageSquare, Wallet } from "lucide-react"

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get("payment_intent")

  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Query pass by payment intent
  const { data: pass, isLoading, error, refetch } = trpc.daypass.getPassByPaymentIntent.useQuery(
    { paymentIntentId: paymentIntentId || "" },
    { enabled: !!paymentIntentId, retry: false }
  )

  // Sync payment mutation for retry logic
  const syncPayment = trpc.daypass.syncPayment.useMutation()

  // Retry logic if pass not found (webhook delay)
  useEffect(() => {
    if (error && paymentIntentId && retryCount < 3) {
      const timer = setTimeout(async () => {
        try {
          await syncPayment.mutateAsync({ paymentIntentId })
          refetch()
        } catch (err) {
          // Will retry again
        }
        setRetryCount(prev => prev + 1)
      }, 2000 * (retryCount + 1)) // 2s, 4s, 6s

      return () => clearTimeout(timer)
    }
  }, [error, paymentIntentId, retryCount, syncPayment, refetch])

  const copyToClipboard = () => {
    if (pass?.code) {
      navigator.clipboard.writeText(pass.code)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    }
  }

  const handleShareSMS = () => {
    if (!pass) return

    const message = `Your Access Pass:
Location: ${pass.siteName}
PIN: ${pass.code}
Valid until: ${formatDateTime(pass.validTo)}

Enter this PIN at the keypad to access.`

    const smsUrl = `sms:?&body=${encodeURIComponent(message)}`
    window.location.href = smsUrl
  }

  const handleAddToWallet = async () => {
    if (!pass) return

    try {
      const params = new URLSearchParams({
        passId: pass.id || "",
        code: pass.code || "",
        passType: pass.passType || "",
        validFrom: pass.validFrom || "",
        validTo: pass.validTo || "",
        siteName: pass.siteName || "",
        vehiclePlate: pass.vehiclePlate || "",
      })

      const response = await fetch(`/api/wallet/google?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        alert(
          data.error || "Unable to add to Google Wallet. Please try again later."
        )
        return
      }

      if (data.saveUrl) {
        window.location.href = data.saveUrl
      } else {
        alert("Unable to generate Google Wallet pass")
      }
    } catch (error) {
      console.error("Google Wallet error:", error)
      alert("Unable to add to Google Wallet at this time")
    }
  }

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
    } catch {
      return dateString
    }
  }

  if (!paymentIntentId) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">No Payment Information</CardTitle>
            <CardDescription>Please check your payment confirmation email.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (isLoading || syncPayment.isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">
              {syncPayment.isLoading ? "Processing payment..." : "Loading your pass..."}
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">Retry attempt {retryCount}/3</p>
            )}
          </CardContent>
        </Card>
      </main>
    )
  }

  if (error || !pass) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to Load Pass</CardTitle>
            <CardDescription>
              {retryCount >= 3
                ? "Please contact support@zezamii.com with your payment confirmation."
                : "Retrying..."}
            </CardDescription>
          </CardHeader>
          {retryCount >= 3 && (
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Payment ID: {paymentIntentId}
                  <br />
                  Please save this for support.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">Pass Issued Successfully!</CardTitle>
          <CardDescription>Your pass is ready to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pass Code Display */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg text-white text-center">
            <p className="text-xs uppercase tracking-wide opacity-80 mb-2">Your Pass Code</p>
            <p className="text-3xl font-mono font-bold mb-3">{pass.code}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              {copiedToClipboard ? "Copied!" : "Copy Code"}
            </Button>
          </div>

          {/* Pass Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{pass.siteName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pass Type:</span>
              <span className="font-medium">{pass.passType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valid From:</span>
              <span className="font-medium">{formatDateTime(pass.validFrom)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valid Until:</span>
              <span className="font-medium">{formatDateTime(pass.validTo)}</span>
            </div>
            {pass.vehiclePlate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-medium uppercase">{pass.vehiclePlate}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Next Steps:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Save or screenshot this pass code</li>
                <li>Enter the code at the building entrance</li>
                <li>Check your email for confirmation</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Share and Wallet Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleShareSMS}
              className="w-full bg-transparent text-sm h-9"
            >
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Share via SMS
            </Button>
            <Button
              variant="outline"
              onClick={handleAddToWallet}
              className="w-full bg-transparent text-sm h-9"
            >
              <Wallet className="mr-1.5 h-4 w-4" />
              Add to Wallet
            </Button>
          </div>

          {/* Email Confirmation */}
          {pass.visitorEmail && (
            <p className="text-sm text-muted-foreground text-center">
              A confirmation has been sent to <strong>{pass.visitorEmail}</strong>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}


export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your pass...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}

