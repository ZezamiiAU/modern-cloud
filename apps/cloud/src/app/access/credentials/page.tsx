import { KeyRound } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function AccessCredentialsPage() {
  return (
    <ComingSoon
      productName="Access Credentials"
      productIcon={KeyRound}
      productColor="bg-gradient-to-br from-cyan-500 to-cyan-600"
      description="Manage keycards, fobs, mobile credentials, and biometric access"
      features={[
        "Keycard management",
        "Mobile credentials",
        "Biometric enrollment",
        "PIN code management",
        "Credential provisioning",
        "Lost/stolen reporting",
        "Credential revocation",
        "Multi-factor authentication",
      ]}
    />
  );
}
