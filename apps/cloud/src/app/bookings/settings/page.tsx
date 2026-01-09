import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BookingsSettingsPage() {
  return (
    <ComingSoon
      productName="Bookings Settings"
      productIcon={Settings}
      productColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
      description="Configure booking system settings and preferences"
      features={[
        "Booking rules",
        "Approval workflows",
        "Time slot configuration",
        "Cancellation policies",
        "Notification settings",
        "Calendar integration",
        "Pricing rules",
        "API configuration",
      ]}
    />
  );
}
