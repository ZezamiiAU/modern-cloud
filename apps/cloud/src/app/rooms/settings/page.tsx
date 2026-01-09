import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function RoomsSettingsPage() {
  return (
    <ComingSoon
      productName="Rooms Settings"
      productIcon={Settings}
      productColor="bg-gradient-to-br from-orange-500 to-orange-600"
      description="Configure room management system settings and preferences"
      features={[
        "Room type definitions",
        "Property setup",
        "Rate configuration",
        "Integration settings",
        "Channel management",
        "Housekeeping rules",
        "Notification preferences",
        "API management",
      ]}
    />
  );
}
