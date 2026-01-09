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
import { Card, CardContent } from "@repo/ui";
import { Cloud, Users, Building2, Shield, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const { isAuthenticated } = getKindeServerSession();

  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Zezamii Cloud</h1>
              <p className="text-sm text-slate-300">Multi-Product Platform</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Know Your People,<br />Know Your Spaces
            </h2>
            <p className="text-lg text-slate-300 max-w-md">
              Unified platform for managing access control, spaces, lockers, rooms, bookings, and vision across your organization.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">People Management</h3>
                <p className="text-sm text-slate-300">Identity, credentials, and activity tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Space Control</h3>
                <p className="text-sm text-slate-300">Rooms, lockers, and booking management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Access Security</h3>
                <p className="text-sm text-slate-300">Enterprise-grade permissions and monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-slate-400">
          <p>© 2026 Zezamii. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Zezamii Cloud</h1>
              <p className="text-sm text-slate-300">Know Your People, Know Your Spaces</p>
            </div>
          </div>

          <Card className="border-slate-700 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Zezamii</h2>
                <p className="text-sm text-slate-600">
                  Sign in to access your administration dashboard
                </p>
              </div>

              {/* Login Button */}
              <LoginLink className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 h-12 px-6 w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20C20 16.13 16.42 13 12 13C7.58 13 4 16.13 4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign In
              </LoginLink>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-500">New to Zezamii?</span>
                </div>
              </div>

              {/* Register Button */}
              <RegisterLink className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-12 px-6 w-full">
                Create an Account
              </RegisterLink>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-cyan-900">
                    <p className="font-semibold mb-1">Multiple sign-in options available</p>
                    <p className="text-cyan-700">Email/password and Google social login (if enabled)</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <p className="text-xs text-center text-slate-500 mt-6">
                By continuing, you agree to our{" "}
                <a href="#" className="text-cyan-600 hover:text-cyan-700 underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-cyan-600 hover:text-cyan-700 underline">Privacy Policy</a>
              </p>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Shield className="w-4 h-4" />
            <span>Secured by Kinde Authentication</span>
          </div>
        </div>
      </div>
    </main>
  );
}
