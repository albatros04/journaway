import { desc, eq } from "drizzle-orm";
import { driverProfiles, driverTrips } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("driver");
  if (isErrorResponse(actor)) return actor;
  try {
    const profile = await getOperationsDb().select({ id: driverProfiles.id }).from(driverProfiles).where(eq(driverProfiles.userId, actor.userId)).get();
    if (!profile) return Response.json({ trips: [], profileReady: false });
    const trips = await getOperationsDb().select().from(driverTrips).where(eq(driverTrips.driverProfileId, profile.id)).orderBy(desc(driverTrips.pickupAt));
    return Response.json({ trips, profileReady: true });
  } catch (error) { return jsonError(error); }
}
