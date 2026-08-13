import { asc, eq } from "drizzle-orm";
import { hotelProperties, hotelRooms } from "../../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, positiveInteger, requiredText, requireApiActor } from "@/lib/operations-api";

async function propertyExists(propertyId: string) { const [property] = await getOperationsDb().select({ id: hotelProperties.id }).from(hotelProperties).where(eq(hotelProperties.id, propertyId)).limit(1); return property; }

export async function GET(_: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const { propertyId } = await params;
    const rooms = await getOperationsDb().select().from(hotelRooms).where(eq(hotelRooms.propertyId, propertyId)).orderBy(asc(hotelRooms.name));
    return Response.json({ rooms });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const { propertyId } = await params;
    if (!await propertyExists(propertyId)) return Response.json({ error: "Property not found." }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    const name = requiredText(body.name, "name");
    const category = requiredText(body.category, "category");
    const inventory = positiveInteger(body.inventory, "inventory", 500);
    if (isErrorResponse(name) || isErrorResponse(category) || isErrorResponse(inventory)) return isErrorResponse(name) ? name : isErrorResponse(category) ? category : inventory;
    const [room] = await getOperationsDb().insert(hotelRooms).values({ id: crypto.randomUUID(), propertyId, name, category, inventory }).returning();
    return Response.json({ room }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
