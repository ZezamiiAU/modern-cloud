"use client"

import { QRGeneratorClient } from "./qr-generator-client"

export default function QRGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Access Pass - QR Code Generator</h1>
          <p className="text-sm text-muted-foreground">
            Generate QR codes for access points to print and place at gates/doors
          </p>
        </div>
      </header>
      <QRGeneratorClient />
    </div>
  )
}
