import { desc, eq } from "drizzle-orm";
import { driverProfiles, driverTrips } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, isoDateTime, jsonError, optionalText, requiredText, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const trips = await getOperationsDb().select({ trip: driverTrips, driver: driverProfiles }).from(driverTrips).innerJoin(driverProfiles, eq(driverTrips.driverProfileId, driverProfiles.id)).orderBy(desc(driverTrips.pickupAt));
    return Response.json({ trips });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const driverProfileId = requiredText(body.driverProfileId, "driverProfileId", 80);
    const pickupLocation = requiredText(body.pickupLocation, "pickupLocation");
    const dropoffLocation = requiredText(body.dropoffLocation, "dropoffLocation");
    const pickupAt = isoDateTime(body.pickupAt, "pickupAt");
    const travellerName = requiredText(body.travellerName, "travellerName");
    const travellerPhone = optionalText(body.travellerPhone, "travellerPhone", 40);
    const bookingReference = optionalText(body.bookingReference, "bookingReference", 80);
    const values = [driverProfileId, pickupLocation, dropoffLocation, pickupAt, travellerName, travellerPhone, bookingReference];
    const invalid = values.find(isErrorResponse);
    if (invalid) return invalid;
    const [driver] = await getOperationsDb().select({ id: driverProfiles.id }).from(driverProfiles).where(eq(driverProfiles.id, driverProfileId as string)).limit(1);
    if (!driver) return Response.json({ error: "Driver profile not found." }, { status: 404 });
    const [trip] = await getOperationsDb().insert(driverTrips).values({ id: crypto.randomUUID(), driverProfileId, pickupLocation, dropoffLocation, pickupAt, travellerName, travellerPhone, bookingReference }).returning();
    return Response.json({ trip }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
