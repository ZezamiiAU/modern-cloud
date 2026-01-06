/**
 * Settings Page - Server Component
 *
 * User settings and sign-out.
 */

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import {
  PageHeader,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";

export default async function SettingsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl font-medium">
              {user?.given_name?.charAt(0)}
              {user?.family_name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium">
                {user?.given_name} {user?.family_name}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button variant="outline" asChild>
              <LogoutLink>Sign Out</LogoutLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
