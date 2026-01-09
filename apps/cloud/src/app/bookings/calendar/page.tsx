import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BookingsCalendarPage() {
  return (
    <ComingSoon
      productName="Calendar View"
      productIcon={Calendar}
      productColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
      description="Visual calendar view of all bookings and resource availability"
      features={[
        "Day/week/month views",
        "Resource timeline",
        "Drag-and-drop booking",
        "Conflict detection",
        "Availability overview",
        "Multi-resource view",
        "Color coding",
        "Quick booking",
      ]}
    />
  );
}
