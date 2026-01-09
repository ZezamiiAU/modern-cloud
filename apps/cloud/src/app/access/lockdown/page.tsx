import { AlertTriangle } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AccessLockdownPage() {
  return (
    <ComingSoon
      productName="Emergency Lockdown"
      productIcon={AlertTriangle}
      productColor="bg-gradient-to-br from-red-500 to-red-600"
      description="Emergency lockdown protocols and security response management"
      features={[
        "One-click lockdown",
        "Zone-based lockdown",
        "Emergency protocols",
        "Lockdown notifications",
        "All-clear procedures",
        "Drill scheduling",
        "Incident logging",
        "Response coordination",
      ]}
    />
  );
}
