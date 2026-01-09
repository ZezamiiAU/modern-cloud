import { Shield } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AccessPermissionsPage() {
  return (
    <ComingSoon
      productName="Zezamii Access"
      productIcon={Shield}
      productColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
      description="Advanced access control and permission management across your entire organization"
      features={[
        "Role-based access control (RBAC)",
        "Real-time door control",
        "Access schedules and rules",
        "Multi-site management",
        "Mobile credentials",
        "Visitor management",
        "Lockdown procedures",
        "Integration with hardware",
      ]}
    />
  );
}
