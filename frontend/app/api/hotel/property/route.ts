import { and, asc, eq } from "drizzle-orm";
import { hotelPartnerMemberships, hotelProperties } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, optionalText, requiredText, requireApiActor } from "@/lib/operations-api";

async function propertiesFor(userId: string) {
  return getOperationsDb().select({ property: hotelProperties, membership: hotelPartnerMemberships }).from(hotelPartnerMemberships).innerJoin(hotelProperties, eq(hotelPartnerMemberships.propertyId, hotelProperties.id)).where(eq(hotelPartnerMemberships.userId, userId)).orderBy(asc(hotelProperties.name));
}

export async function GET() {
  const actor = await requireApiActor("hotel");
  if (isErrorResponse(actor)) return actor;
  try { return Response.json({ properties: await propertiesFor(actor.userId) }); }
  catch (error) { return jsonError(error); }
}

export async function PUT(request: Request) {
  const actor = await requireApiActor("hotel");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const propertyId = optionalText(body.propertyId, "propertyId", 80);
    const name = requiredText(body.name, "name");
    const destination = requiredText(body.destination, "destination");
    const city = requiredText(body.city, "city");
    const address = optionalText(body.address, "address", 500);
    const contactPhone = optionalText(body.contactPhone, "contactPhone", 40);
    const values = [propertyId, name, destination, city, address, contactPhone];
    const invalid = values.find(isErrorResponse);
    if (invalid) return invalid;
    const db = getOperationsDb();
    const propertyValues = { name, destination, city, address, contactPhone, updatedAt: new Date().toISOString() };
    if (propertyId) {
      const membership = await db.select({ id: hotelPartnerMemberships.id }).from(hotelPartnerMemberships).where(and(eq(hotelPartnerMemberships.propertyId, propertyId), eq(hotelPartnerMemberships.userId, actor.userId))).get();
      if (!membership) return Response.json({ error: "Property not found." }, { status: 404 });
      const [property] = await db.update(hotelProperties).set(propertyValues).where(eq(hotelProperties.id, propertyId)).returning();
      return Response.json({ property });
    }
    const id = crypto.randomUUID();
    const [property] = await db.insert(hotelProperties).values({ id, ...propertyValues }).returning();
    await db.insert(hotelPartnerMemberships).values({ id: crypto.randomUUID(), propertyId: id, userId: actor.userId, email: actor.email.toLowerCase(), role: "owner" });
    return Response.json({ property }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
