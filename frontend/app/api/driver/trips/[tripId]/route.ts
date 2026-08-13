import { and, eq } from "drizzle-orm";
import { driverProfiles, driverTrips } from "../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

const nextStatuses = { assigned: ["en_route", "cancelled"], en_route: ["completed", "cancelled"], completed: [], cancelled: [] } as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const actor = await requireApiActor("driver");
  if (isErrorResponse(actor)) return actor;
  try {
    const { tripId } = await params;
    const body = await request.json() as { status?: string };
    const [profile] = await getOperationsDb().select({ id: driverProfiles.id }).from(driverProfiles).where(eq(driverProfiles.userId, actor.userId)).limit(1);
    if (!profile) return Response.json({ error: "Create a driver profile before updating trips." }, { status: 409 });
    const [trip] = await getOperationsDb().select().from(driverTrips).where(and(eq(driverTrips.id, tripId), eq(driverTrips.driverProfileId, profile.id))).limit(1);
    if (!trip) return Response.json({ error: "Trip not found." }, { status: 404 });
    if (!body.status || !nextStatuses[trip.status].includes(body.status as never)) return Response.json({ error: "That trip status transition is not allowed." }, { status: 400 });
    const [updatedTrip] = await getOperationsDb().update(driverTrips).set({ status: body.status as "en_route" | "completed" | "cancelled", updatedAt: new Date().toISOString() }).where(eq(driverTrips.id, trip.id)).returning();
    return Response.json({ trip: updatedTrip });
  } catch (error) { return jsonError(error); }
}
