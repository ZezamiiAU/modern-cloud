import { Car } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function RoomsLPRActionsPage() {
  return (
    <ComingSoon
      productName="LPR Actions"
      productIcon={Car}
      productColor="bg-gradient-to-br from-orange-500 to-orange-600"
      description="License Plate Recognition actions for parking and vehicle management"
      features={[
        "License plate scanning",
        "Guest vehicle registration",
        "Parking space allocation",
        "Valet management",
        "Vehicle tracking",
        "Parking violations",
        "Guest vehicle alerts",
        "Automated gate control",
      ]}
    />
  );
}
