/**
 * Landing Page - Server Component
 *
 * Shows sign-in if not authenticated.
 * Redirects to dashboard if already authenticated.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export default async function HomePage() {
  const { isAuthenticated } = getKindeServerSession();

  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-xl mx-auto mb-4">
            Z
          </div>
          <CardTitle>Zezamii Cloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Administration dashboard for managing your Zezamii deployment.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <LoginLink>Sign In</LoginLink>
            </Button>
            <Button variant="outline" asChild>
              <RegisterLink>Create Account</RegisterLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
