import { ShieldCheck } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function RoomsAccessControlPage() {
  return (
    <ComingSoon
      productName="Room Access Control"
      productIcon={ShieldCheck}
      productColor="bg-gradient-to-br from-orange-500 to-orange-600"
      description="Control room access and keycard management for guests"
      features={[
        "Keycard issuance",
        "Mobile key delivery",
        "Check-in automation",
        "Check-out automation",
        "Access scheduling",
        "Master key management",
        "Lost key handling",
        "Access logs",
      ]}
    />
  );
}
