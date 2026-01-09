"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui"
import { PaymentForm } from "./payment-form"
import { trpc } from "@/lib/trpc"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!publishableKey) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
}
const stripePromise = loadStripe(publishableKey)

interface PassType {
  id: string
  name: string
  code: string
  description: string | null
  price_cents: number
  duration_minutes: number
  currency?: string
}

interface PassPurchaseFormProps {
  _organizationId: string
  organizationName?: string
  organizationLogo?: string | null
  siteId: string
  siteName?: string
  _deviceId: string
  deviceName?: string
  deviceDescription?: string | null
}

export function PassPurchaseForm({
  _organizationId,
  _organizationName,
  _organizationLogo,
  siteId,
  siteName,
  _deviceId,
  deviceName,
  _deviceDescription,
}: PassPurchaseFormProps) {
  const [passTypes, setPassTypes] = useState<PassType[]>([])
  const [selectedPassTypeId, setSelectedPassTypeId] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load pass types from tRPC
  const { data: passTypesData, isLoading: loadingPassTypes } = trpc.public.getPassTypes.useQuery({
    siteId
  })

  // Create payment mutation
  const createPayment = trpc.daypass.createPaymentIntent.useMutation()

  // Update pass types when data loads
  useEffect(() => {
    if (passTypesData) {
      // Convert hours to minutes for PWA compatibility
      const converted = passTypesData.map(pt => ({
        id: pt.id,
        name: pt.name,
        code: pt.name.toLowerCase().replace(/\s+/g, '-'),
        description: pt.description,
        price_cents: pt.price_cents,
        duration_minutes: pt.duration_hours * 60,
        currency: pt.currency,
      }))
      setPassTypes(converted)
      if (converted.length > 0) {
        setSelectedPassTypeId(converted[0].id)
      }
    }
  }, [passTypesData])

  const selectedPassType = passTypes.find((pt) => pt.id === selectedPassTypeId)

  const currency = selectedPassType?.currency?.toUpperCase() || "AUD"
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)} ${currency}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !name.trim()) {
      alert("Please enter your name")
      return
    }

    if (!email || !email.trim()) {
      alert("Please enter your email address")
      return
    }

    if (!termsAccepted) {
      alert("Please accept the terms and conditions")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const result = await createPayment.mutateAsync({
        siteId,
        passTypeId: selectedPassTypeId,
        name,
        email,
        phone: phone || undefined,
        vehiclePlate: vehiclePlate || undefined,
      })

      if (result.clientSecret) {
        setClientSecret(result.clientSecret)
      } else {
        throw new Error("No client secret received")
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Payment intent error:", error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  if (clientSecret) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-1 pt-2 px-3">
          <CardTitle className="text-lg">Complete Payment</CardTitle>
          {(siteName || deviceName) && (
            <CardDescription className="text-xs">{[deviceName, siteName].filter(Boolean).join(" - ")}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2 pb-2 px-3 max-h-[70vh] overflow-y-auto">
          {selectedPassType && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-1 pt-1.5 px-2">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 pb-1.5 px-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pass Type:</span>
                  <span className="font-medium">{selectedPassType.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {selectedPassType.duration_minutes >= 60
                      ? `${Math.floor(selectedPassType.duration_minutes / 60)} hours`
                      : `${selectedPassType.duration_minutes} minutes`}
                  </span>
                </div>
                {selectedPassType.description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Details:</span>
                    <span className="font-medium text-xs">{selectedPassType.description}</span>
                  </div>
                )}
                <div className="flex justify-between pt-0.5 border-t text-sm">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">
                    {formatPrice(selectedPassType.price_cents)}
                    <span className="text-xs text-muted-foreground ml-1">(incl GST and fees)</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm returnUrl={`${window.location.origin}/success`} customerEmail={email} />
          </Elements>
        </CardContent>
      </Card>
    )
  }

  if (loadingPassTypes) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading pass types...</p>
        </CardContent>
      </Card>
    )
  }

  if (!passTypes.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Pass Types Available</CardTitle>
          <CardDescription>There are no pass types configured for this location.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-1 pt-2 px-3">
        <CardTitle className="text-lg">Purchase Pass</CardTitle>
        {(siteName || deviceName) && (
          <CardDescription className="text-base">{[deviceName, siteName].filter(Boolean).join(" - ")}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="py-1.5 px-3">
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="space-y-0.5">
            <Label htmlFor="name" className="text-sm">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 text-sm"
              required
            />
          </div>

          <div className="space-y-0.5">
            <Label htmlFor="passType" className="text-sm">
              Pass Type
            </Label>
            <Select value={selectedPassTypeId} onValueChange={setSelectedPassTypeId}>
              <SelectTrigger id="passType" className="h-7 text-sm">
                <SelectValue placeholder="Select pass type" />
              </SelectTrigger>
              <SelectContent>
                {passTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {pt.name} - {formatPrice(pt.price_cents)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-0.5">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-7 text-sm"
              required
            />
            <p className="text-xs text-muted-foreground leading-tight">Receive your pass details via email</p>
          </div>

          <div className="space-y-0.5">
            <Label htmlFor="vehiclePlate" className="text-sm">
              Vehicle Rego (Optional)
            </Label>
            <Input
              id="vehiclePlate"
              type="text"
              placeholder="ABC-123"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="uppercase h-7 text-sm"
            />
          </div>

          <div className="space-y-0.5">
            <Label htmlFor="phone" className="text-sm">
              Mobile (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0412 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-7 text-sm"
            />
            <p className="text-xs text-muted-foreground leading-tight">Share pass via SMS from success page</p>
          </div>

          {selectedPassType && (
            <Card className="bg-muted/50 mt-1">
              <CardHeader className="pb-1 pt-1.5 px-2">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 pb-1.5 px-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pass Type:</span>
                  <span className="font-medium">{selectedPassType.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {selectedPassType.duration_minutes >= 60
                      ? `${Math.floor(selectedPassType.duration_minutes / 60)} hours`
                      : `${selectedPassType.duration_minutes} minutes`}
                  </span>
                </div>
                {selectedPassType.description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Details:</span>
                    <span className="font-medium text-xs">{selectedPassType.description}</span>
                  </div>
                )}
                <div className="flex justify-between pt-0.5 border-t text-sm">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">
                    {formatPrice(selectedPassType.price_cents)}
                    <span className="text-xs text-muted-foreground block">incl GST and fees</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-start space-x-1.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-3 w-3"
            />
            <Label htmlFor="terms" className="text-xs font-normal leading-tight">
              I accept the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                terms and conditions
              </a>{" "}
              for pass usage
            </Label>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 mt-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="sm"
            className="w-full mt-1.5 h-8 text-sm bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={isLoading || !selectedPassType}
          >
            {isLoading ? "Processing..." : "Continue to Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


