import { HotelPropertyManager } from "@/components/operations-portals";

export default function HotelPartnerProfilePage() {
  return <div className="hotel-portal-content">
    <section className="hotel-portal-intro"><p className="eyebrow">Property profile</p><h1>Your property details.</h1><p>Create or update your linked property and maintain room inventory for the booking operations team.</p></section>
    <HotelPropertyManager />
  </div>;
}
