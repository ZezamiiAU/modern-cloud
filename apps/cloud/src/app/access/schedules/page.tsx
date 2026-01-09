import { CalendarClock } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AccessSchedulesPage() {
  return (
    <ComingSoon
      productName="Access Schedules"
      productIcon={CalendarClock}
      productColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
      description="Time-based access control and scheduling for doors and zones"
      features={[
        "Time zone scheduling",
        "Holiday calendars",
        "Recurring access patterns",
        "Override schedules",
        "Multi-zone timing",
        "After-hours access",
        "Schedule templates",
        "Automated lock/unlock",
      ]}
    />
  );
}
