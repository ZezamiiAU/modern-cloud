import { Package } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function LockersManagerPage() {
  return (
    <ComingSoon
      productName="Zezamii Lockers"
      productIcon={Package}
      productColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
      description="Smart locker management for secure storage and asset tracking"
      features={[
        "Digital locker assignments",
        "Automated allocation",
        "Usage analytics",
        "Mobile locker access",
        "Package delivery integration",
        "Locker availability tracking",
        "Booking and reservations",
        "Audit trails",
      ]}
    />
  );
}
