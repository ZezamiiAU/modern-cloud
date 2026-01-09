import { Video } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function VisionFeedsPage() {
  return (
    <ComingSoon
      productName="Zezamii Vision"
      productIcon={Video}
      productColor="bg-gradient-to-br from-purple-500 to-purple-600"
      description="AI-powered video surveillance and analytics platform"
      features={[
        "Live camera feeds",
        "AI-powered alerts",
        "Motion detection",
        "Facial recognition",
        "License plate recognition",
        "Event recording",
        "Analytics dashboard",
        "Multi-site monitoring",
      ]}
    />
  );
}
