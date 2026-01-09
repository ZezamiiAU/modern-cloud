import { Inbox } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function RoomsReservationsPage() {
  return (
    <ComingSoon
      productName="Room Reservations"
      productIcon={Inbox}
      productColor="bg-gradient-to-br from-orange-500 to-orange-600"
      description="View and manage all room reservations and bookings"
      features={[
        "Reservation calendar",
        "Booking management",
        "Availability checking",
        "Modification handling",
        "Cancellation processing",
        "Group bookings",
        "Rate management",
        "Overbooking control",
      ]}
    />
  );
}
