import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LockersPeoplePage() {
  return (
    <ComingSoon
      productName="Locker Assignments"
      productIcon={Users}
      productColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
      description="Manage locker assignments and user allocations"
      features={[
        "User locker assignments",
        "Shared locker management",
        "Assignment history",
        "Auto-assignment rules",
        "Transfer management",
        "Waitlist handling",
        "Usage analytics",
        "Occupancy tracking",
      ]}
    />
  );
}
