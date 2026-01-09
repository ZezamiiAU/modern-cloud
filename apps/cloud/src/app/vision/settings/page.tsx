import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function VisionSettingsPage() {
  return (
    <ComingSoon
      productName="Vision Settings"
      productIcon={Settings}
      productColor="bg-gradient-to-br from-purple-500 to-purple-600"
      description="Configure video surveillance system settings and AI parameters"
      features={[
        "Camera configuration",
        "Stream settings",
        "AI model selection",
        "Detection zones",
        "Alert thresholds",
        "Recording rules",
        "Storage management",
        "Integration settings",
      ]}
    />
  );
}
