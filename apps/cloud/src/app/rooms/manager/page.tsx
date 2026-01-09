import { DoorOpen } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function RoomsManagerPage() {
  return (
    <ComingSoon
      productName="Zezamii Rooms"
      productIcon={DoorOpen}
      productColor="bg-gradient-to-br from-orange-500 to-orange-600"
      description="Hotel-style room management with access control and guest services"
      features={[
        "Digital room keys",
        "Guest check-in/check-out",
        "Room reservations",
        "Access control integration",
        "LPR (License Plate Recognition)",
        "Guest portal",
        "Housekeeping management",
        "Room status tracking",
      ]}
    />
  );
}
