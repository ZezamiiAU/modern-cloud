"use client";

import { SiteProvider } from "@/contexts/site-context";

export function SiteProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SiteProvider>{children}</SiteProvider>;
}
