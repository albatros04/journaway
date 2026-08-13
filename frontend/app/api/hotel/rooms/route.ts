import { and, asc, eq } from "drizzle-orm";
import { hotelPartnerMemberships, hotelRooms } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, positiveInteger, requiredText, requireApiActor } from "@/lib/operations-api";

async function managesProperty(userId: string, propertyId: string) {
  const [membership] = await getOperationsDb().select({ id: hotelPartnerMemberships.id }).from(hotelPartnerMemberships).where(and(eq(hotelPartnerMemberships.userId, userId), eq(hotelPartnerMemberships.propertyId, propertyId))).limit(1);
  return membership;
}

export async function GET() {
  const actor = await requireApiActor("hotel");
  if (isErrorResponse(actor)) return actor;
  try {
    const rooms = await getOperationsDb().select({ room: hotelRooms }).from(hotelPartnerMemberships).innerJoin(hotelRooms, eq(hotelPartnerMemberships.propertyId, hotelRooms.propertyId)).where(eq(hotelPartnerMemberships.userId, actor.userId)).orderBy(asc(hotelRooms.name));
    return Response.json({ rooms: rooms.map(row => row.room) });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const actor = await requireApiActor("hotel");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const propertyId = requiredText(body.propertyId, "propertyId", 80);
    const name = requiredText(body.name, "name");
    const category = requiredText(body.category, "category");
    const inventory = positiveInteger(body.inventory, "inventory", 500);
    const values = [propertyId, name, category, inventory];
    const invalid = values.find(isErrorResponse);
    if (invalid) return invalid;
    if (!await managesProperty(actor.userId, propertyId)) return Response.json({ error: "Property not found." }, { status: 404 });
    const [room] = await getOperationsDb().insert(hotelRooms).values({ id: crypto.randomUUID(), propertyId, name, category, inventory }).returning();
    return Response.json({ room }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
