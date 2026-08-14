import { Button } from "@/components/ui";
import { PortalAccessRequest } from "@/components/portal-access-request";

export default function DriverAccessDeniedPage() { return <main className="driver-access-denied"><section><p className="eyebrow">Driver access</p><h1>This account is not authorized for the driver portal.</h1><p>Request access with your signed-in Google account. JournAway operations will review the request before any booking or traveller data is exposed.</p><PortalAccessRequest accessType="driver" /><Button href="/" variant="secondary">Back to public site</Button></section></main>; }
