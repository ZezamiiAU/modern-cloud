"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import QRCodeStyling from "qr-code-styling"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui"
import { Copy, QrCode, MapPin, Hash } from "lucide-react"
import { trpc } from "@/lib/trpc"

interface Device {
  id: string
  slug: string
  name: string
  orgId: string
  orgName: string
  orgSlug: string
  siteId: string
  siteName: string
  siteSlug: string
}

export function QRGeneratorClient() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [qrCode, setQRCode] = useState<QRCodeStyling | null>(null)
  const [qrSettings, setQRSettings] = useState({
    size: 500,
    errorCorrection: "M" as "L" | "M" | "Q" | "H",
  })
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [selectedSiteId, setSelectedSiteId] = useState("all")
  const [pwaBaseUrl, setPwaBaseUrl] = useState("http://localhost:3001")
  const qrRef = useRef<HTMLDivElement>(null)

  // Fetch devices with refs using tRPC
  const { data: devicesData, isLoading } = trpc.admin.getDevicesWithRefs.useQuery(
    undefined,
    { enabled: true }
  )

  const devices: Device[] = useMemo(() => {
    if (!devicesData) return []
    return devicesData.map((d) => ({
      id: d.deviceRef.id,
      slug: d.deviceRef.slug,
      name: d.deviceRef.displayName || d.deviceRef.slug,
      orgId: d.orgRef.id,
      orgName: d.orgRef.displayName || d.orgRef.slug,
      orgSlug: d.orgRef.slug,
      siteId: d.siteRef.id,
      siteName: d.siteRef.displayName || d.siteRef.slug,
      siteSlug: d.siteRef.slug,
    }))
  }, [devicesData])

  const organisations = useMemo(() => {
    const uniqueOrgs = new Map<string, { id: string; name: string; slug: string }>()
    devices.forEach((device) => {
      if (device.orgId && device.orgName) {
        uniqueOrgs.set(device.orgId, {
          id: device.orgId,
          name: device.orgName,
          slug: device.orgSlug,
        })
      }
    })
    return Array.from(uniqueOrgs.values())
  }, [devices])

  const sites = useMemo(() => {
    const uniqueSites = new Map<string, { id: string; name: string; slug: string }>()
    devices.forEach((device) => {
      if (device.siteId && device.siteName) {
        uniqueSites.set(device.siteId, {
          id: device.siteId,
          name: device.siteName,
          slug: device.siteSlug,
        })
      }
    })
    return Array.from(uniqueSites.values())
  }, [devices])

  const filteredDevices = selectedOrgId
    ? devices.filter(
        (d) =>
          d.orgId === selectedOrgId &&
          (!selectedSiteId || selectedSiteId === "all" || d.siteId === selectedSiteId)
      )
    : []

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const generateQRCode = (device: Device) => {
    const qrUrl = `${pwaBaseUrl}/p/${device.orgSlug}/${device.siteSlug}/${device.slug}`
    const qr = new QRCodeStyling({
      width: qrSettings.size,
      height: qrSettings.size,
      type: "svg",
      data: qrUrl,
      errorCorrectionLevel: qrSettings.errorCorrection,
      margin: 5,
      dotsOptions: {
        color: "#000000",
      },
      backgroundOptions: {
        color: "#FFFFFF",
      },
    })
    setQRCode(qr)
  }

  useEffect(() => {
    if (selectedDevice) {
      generateQRCode(selectedDevice)
    }
  }, [selectedDevice, qrSettings, pwaBaseUrl])

  useEffect(() => {
    if (qrCode && qrRef.current) {
      qrRef.current.innerHTML = ""
      qrCode.append(qrRef.current)
    }
  }, [qrCode])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading devices...</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 container mx-auto px-4 py-6">
      {/* Left Sidebar - Device Selection */}
      <div className="w-80 space-y-4 overflow-y-auto border-r pr-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Select Device</h2>

          <div className="space-y-3">
            <div>
              <Label htmlFor="org-filter">Organisation</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger id="org-filter">
                  <SelectValue placeholder="Select an organisation" />
                </SelectTrigger>
                <SelectContent>
                  {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="site-filter">Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger id="site-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {!selectedOrgId && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Please select an organisation to view devices
            </p>
          )}
          {filteredDevices.length === 0 && selectedOrgId !== "" && (
            <p className="text-sm text-muted-foreground text-center py-4">No devices found</p>
          )}
          {filteredDevices.map((device) => (
            <Button
              key={device.id}
              variant={selectedDevice?.id === device.id ? "default" : "ghost"}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <span className="font-medium text-sm">{device.name}</span>
                <span className="text-xs text-muted-foreground">
                  {device.siteName} • {device.orgName}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Middle Panel - Device Details and QR Code */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {!selectedDevice && (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <QrCode className="size-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a Device</h3>
              <p className="text-sm text-muted-foreground">
                Choose a device from the left to generate its QR code
              </p>
            </CardContent>
          </Card>
        )}

        {selectedDevice && (
          <>
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xl">{selectedDevice.name}</CardTitle>
                <CardDescription>
                  {selectedDevice.orgName} / {selectedDevice.siteName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="p-2 rounded-md bg-background">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-0.5">Device Slug</div>
                      <code className="text-sm font-mono truncate block">{selectedDevice.slug}</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="p-2 rounded-md bg-background">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-0.5">Org Slug</div>
                      <code className="text-sm font-mono truncate block">{selectedDevice.orgSlug}</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="p-2 rounded-md bg-background">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-0.5">Site Slug</div>
                      <code className="text-sm font-mono truncate block">{selectedDevice.siteSlug}</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="p-2 rounded-md bg-background">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-0.5">Device ID</div>
                      <code className="text-xs font-mono truncate block">{selectedDevice.id}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={() => copyToClipboard(selectedDevice.id)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="qr-url" className="text-sm mb-2 block">QR Code URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono bg-muted/50 p-2 rounded border truncate">
                      {`${pwaBaseUrl}/p/${selectedDevice.orgSlug}/${selectedDevice.siteSlug}/${selectedDevice.slug}`}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={() =>
                        copyToClipboard(
                          `${pwaBaseUrl}/p/${selectedDevice.orgSlug}/${selectedDevice.siteSlug}/${selectedDevice.slug}`
                        )
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Preview</CardTitle>
                <CardDescription>Scan this code to open the pass purchase page</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div ref={qrRef} className="flex justify-center" />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (qrCode) {
                        qrCode.download({
                          name: `${selectedDevice.orgSlug}-${selectedDevice.siteSlug}-${selectedDevice.slug}.svg`,
                          extension: "svg",
                        })
                      }
                    }}
                  >
                    Download SVG
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (qrCode) {
                        qrCode.download({
                          name: `${selectedDevice.orgSlug}-${selectedDevice.siteSlug}-${selectedDevice.slug}.png`,
                          extension: "png",
                        })
                      }
                    }}
                  >
                    Download PNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-64 space-y-4 border-l pl-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pwa-url">PWA Base URL</Label>
            <Input
              id="pwa-url"
              type="text"
              value={pwaBaseUrl}
              onChange={(e) => setPwaBaseUrl(e.target.value)}
              placeholder="http://localhost:3001"
            />
            <p className="text-xs text-muted-foreground">The URL where your daypass PWA is hosted</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-size">Size ({qrSettings.size}px)</Label>
            <Slider
              id="qr-size"
              defaultValue={[qrSettings.size]}
              max={800}
              min={200}
              step={100}
              onValueChange={(v) => {
                setQRSettings((prev) => ({ ...prev, size: v[0] }))
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="error-correction">Error Correction</Label>
            <Select
              value={qrSettings.errorCorrection}
              onValueChange={(v: any) => {
                setQRSettings((prev) => ({ ...prev, errorCorrection: v }))
              }}
            >
              <SelectTrigger id="error-correction">
                <SelectValue placeholder="Select error correction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Higher levels allow more damage/obstruction</p>
          </div>
        </div>
      </div>
    </div>
  )
}
