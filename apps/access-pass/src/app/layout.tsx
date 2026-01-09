import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TRPCProvider } from "@/lib/trpc-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Access Pass - QR Code Generator",
  description: "Generate QR codes for access points",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
