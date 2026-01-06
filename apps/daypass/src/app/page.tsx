import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import Link from "next/link";

/**
 * Day Pass Landing Page
 *
 * In production, users arrive here via QR code with a slug parameter.
 * This page is just for direct navigation / testing.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Zezamii Day Pass</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to Zezamii Day Pass. Scan a QR code at a participating
            building to purchase a day pass.
          </p>
          <p className="text-sm text-muted-foreground">
            For testing, visit{" "}
            <Link href="/pass/demo" className="text-primary underline">
              /pass/demo
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
