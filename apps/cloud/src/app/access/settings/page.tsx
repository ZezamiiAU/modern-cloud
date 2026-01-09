import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AccessSettingsPage() {
  return (
    <ComingSoon
      productName="Access Settings"
      productIcon={Settings}
      productColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
      description="Configure access control system settings and preferences"
      features={[
        "Door controller setup",
        "Reader configuration",
        "System preferences",
        "Integration settings",
        "Notification rules",
        "Backup & restore",
        "Audit log settings",
        "API management",
      ]}
    />
  );
}
