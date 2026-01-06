import { notFound } from "next/navigation";
import { PassPurchaseFlow } from "./pass-purchase-flow";

interface PageProps {
  params: { slug: string };
}

/**
 * Day Pass Purchase Page
 *
 * Flow:
 * 1. User scans QR → arrives at /pass/[slug]
 * 2. Server resolves slug → site config
 * 3. User sees pass options
 * 4. User selects pass → payment
 * 5. Payment success → pass issued
 *
 * Note: This is a Server Component. Data fetching happens server-side.
 * The PassPurchaseFlow is a Client Component for interactivity.
 */
export default async function PassPage({ params }: PageProps) {
  const { slug } = params;

  // TODO: Fetch site config via tRPC
  // For now, use placeholder data
  const siteConfig = {
    slug,
    siteName: "Demo Building",
    orgName: "Zezamii",
    logoUrl: null,
    features: { dayPass: true, bookings: false },
  };

  if (!siteConfig.features.dayPass) {
    notFound();
  }

  // TODO: Fetch pass types via tRPC
  const passTypes = [
    {
      id: "1",
      name: "Day Pass",
      description: "24-hour access",
      price_cents: 2500,
      duration_hours: 24,
    },
    {
      id: "2",
      name: "Half Day",
      description: "4-hour access",
      price_cents: 1500,
      duration_hours: 4,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <PassPurchaseFlow
          siteName={siteConfig.siteName}
          orgName={siteConfig.orgName}
          passTypes={passTypes}
          slug={slug}
        />
      </div>
    </main>
  );
}
