import { PersonStanding } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function RoomsGuestsPage() {
  return (
    <ComingSoon
      productName="Guest Management"
      productIcon={PersonStanding}
      productColor="bg-gradient-to-br from-orange-500 to-orange-600"
      description="Manage guest check-ins, profiles, and stay information"
      features={[
        "Guest profiles",
        "Check-in/out management",
        "Stay history",
        "Preference tracking",
        "Guest services",
        "Communication logs",
        "Special requests",
        "VIP management",
      ]}
    />
  );
}
