import { HotelStaysDashboard } from "@/components/operations-portals";

export default function HotelPartnerDashboard() {
  return <div className="hotel-portal-content">
    <section className="hotel-portal-intro"><p className="eyebrow">Partner stays</p><h1>Your guest stays, in one place.</h1><p>Only bookings for properties linked to your authenticated partner account appear here.</p></section>
    <HotelStaysDashboard />
  </div>;
}
