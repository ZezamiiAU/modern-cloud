import { ClipboardList } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function BookingsBookingsPage() {
  return (
    <ComingSoon
      productName="Bookings Management"
      productIcon={ClipboardList}
      productColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
      description="View and manage all resource bookings and reservations"
      features={[
        "Active bookings list",
        "Booking details",
        "Modification handling",
        "Cancellation processing",
        "Recurring bookings",
        "Booking approvals",
        "Waitlist management",
        "Booking history",
      ]}
    />
  );
}
