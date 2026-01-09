import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BookingsDashboardPage() {
  return (
    <ComingSoon
      productName="Zezamii Bookings"
      productIcon={Calendar}
      productColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
      description="Resource booking and scheduling platform for spaces and equipment"
      features={[
        "Meeting room bookings",
        "Equipment reservations",
        "Calendar integration",
        "Booking analytics",
        "Automated check-in",
        "Usage reports",
        "Conflict resolution",
        "Resource availability",
      ]}
    />
  );
}
