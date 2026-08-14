import { Button } from "@/components/ui";
import { PortalAccessRequest } from "@/components/portal-access-request";

export default function HotelPartnerAccessDeniedPage() {
  return <main className="hotel-portal-access-denied"><section><p className="eyebrow">Partner access</p><h1>This account is not authorized for the hotel partner portal.</h1><p>Request access with your signed-in Google account. Once approved, JournAway operations will assign the hotel properties you may manage.</p><PortalAccessRequest accessType="hotel" /><Button href="/" variant="secondary">Back to public site</Button></section></main>;
}
