import { Button } from "@/components/ui";

export default function DriverAccessDeniedPage() { return <main className="driver-access-denied"><section><p className="eyebrow">Driver access</p><h1>This account is not authorized for the driver portal.</h1><p>Only identities configured by JournAway operations can access driver routes. No booking or traveller data has been exposed.</p><Button href="/">Back to public site</Button></section></main>; }
