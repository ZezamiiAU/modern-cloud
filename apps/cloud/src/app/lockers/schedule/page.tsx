import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LockersSchedulePage() {
  return (
    <ComingSoon
      productName="Locker Schedules"
      productIcon={Settings}
      productColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
      description="Configure locker access schedules and time-based rules"
      features={[
        "Access time windows",
        "Cleaning schedules",
        "Maintenance windows",
        "Auto-expiration",
        "Rental periods",
        "Holiday calendars",
        "Recurring schedules",
        "Override management",
      ]}
    />
  );
}
