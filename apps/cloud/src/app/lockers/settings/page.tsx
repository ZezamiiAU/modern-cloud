import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LockersSettingsPage() {
  return (
    <ComingSoon
      productName="Lockers Settings"
      productIcon={Settings}
      productColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
      description="Configure locker system settings and preferences"
      features={[
        "Locker controller setup",
        "Bank configuration",
        "Size definitions",
        "Pricing rules",
        "Notification settings",
        "Integration options",
        "Backup settings",
        "API configuration",
      ]}
    />
  );
}
