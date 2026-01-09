import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function VisionAlertsPage() {
  return (
    <ComingSoon
      productName="AI Alerts"
      productIcon={Bell}
      productColor="bg-gradient-to-br from-purple-500 to-purple-600"
      description="AI-powered security alerts and intelligent notifications"
      features={[
        "Smart motion detection",
        "Person detection",
        "Vehicle detection",
        "Loitering alerts",
        "Perimeter breach",
        "Object removal detection",
        "Crowd detection",
        "Custom AI rules",
      ]}
    />
  );
}
