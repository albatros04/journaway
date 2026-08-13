import { Button } from "@/components/ui";

export default function HotelPartnerAccessDeniedPage() {
  return <main className="hotel-portal-access-denied"><section><p className="eyebrow">Partner access</p><h1>This account is not authorized for the hotel partner portal.</h1><p>Only identities configured by JournAway operations can access partner routes. No hotel, guest or booking data has been exposed.</p><Button href="/">Back to public site</Button></section></main>;
}
