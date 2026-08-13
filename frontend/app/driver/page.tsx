import { DriverTripsDashboard } from "@/components/operations-portals";

export default function DriverDashboard() { return <div className="driver-content"><section className="driver-intro"><p className="eyebrow">My trips</p><h1>Your assigned journeys.</h1><p>View only trips assigned to your authenticated driver profile and progress them through backend-validated status changes.</p></section><DriverTripsDashboard /></div>; }
