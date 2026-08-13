import { Button } from "@/components/ui";

export default function AdminAccessDeniedPage() { return <main className="admin-access-denied"><section><p className="eyebrow">Admin access</p><h1>This account is not authorized for JournAway operations.</h1><p>Admin access is limited to identities configured by the platform owner. No operational data has been exposed.</p><Button href="/">Back to public site</Button></section></main>; }
