import { eq } from "drizzle-orm";
import { driverProfiles } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, optionalText, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("driver");
  if (isErrorResponse(actor)) return actor;
  try {
    const profile = await getOperationsDb().select().from(driverProfiles).where(eq(driverProfiles.userId, actor.userId)).get();
    return Response.json({ profile: profile ?? null });
  } catch (error) { return jsonError(error); }
}

export async function PUT(request: Request) {
  const actor = await requireApiActor("driver");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const phone = optionalText(body.phone, "phone", 40);
    const vehicleRegistration = optionalText(body.vehicleRegistration, "vehicleRegistration", 40);
    const vehicleType = optionalText(body.vehicleType, "vehicleType", 80);
    const values = [phone, vehicleRegistration, vehicleType];
    const invalid = values.find(isErrorResponse);
    if (invalid) return invalid;
    const db = getOperationsDb();
    const existing = await db.select({ id: driverProfiles.id }).from(driverProfiles).where(eq(driverProfiles.userId, actor.userId)).get();
    const profileValues = { phone, vehicleRegistration, vehicleType, updatedAt: new Date().toISOString() };
    const profile = existing
      ? (await db.update(driverProfiles).set(profileValues).where(eq(driverProfiles.id, existing.id)).returning())[0]
      : (await db.insert(driverProfiles).values({ id: crypto.randomUUID(), userId: actor.userId, email: actor.email.toLowerCase(), displayName: actor.displayName, ...profileValues }).returning())[0];
    return Response.json({ profile });
  } catch (error) { return jsonError(error); }
}
