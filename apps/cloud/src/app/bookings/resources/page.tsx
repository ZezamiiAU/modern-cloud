import { Package } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BookingsResourcesPage() {
  return (
    <ComingSoon
      productName="Resource Management"
      productIcon={Package}
      productColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
      description="Manage bookable resources, equipment, and spaces"
      features={[
        "Resource catalog",
        "Equipment inventory",
        "Space definitions",
        "Availability rules",
        "Capacity management",
        "Resource attributes",
        "Maintenance scheduling",
        "Usage analytics",
      ]}
    />
  );
}
