import { desc, eq } from "drizzle-orm";
import { hotelBookings, hotelProperties, hotelRooms } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, isoDate, jsonError, optionalText, positiveInteger, requiredText, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const bookings = await getOperationsDb().select({ booking: hotelBookings, property: hotelProperties, room: hotelRooms }).from(hotelBookings).innerJoin(hotelProperties, eq(hotelBookings.propertyId, hotelProperties.id)).leftJoin(hotelRooms, eq(hotelBookings.roomId, hotelRooms.id)).orderBy(desc(hotelBookings.checkInDate));
    return Response.json({ bookings });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const bookingReference = requiredText(body.bookingReference, "bookingReference", 80);
    const propertyId = requiredText(body.propertyId, "propertyId", 80);
    const roomId = optionalText(body.roomId, "roomId", 80);
    const guestName = requiredText(body.guestName, "guestName");
    const guestEmail = optionalText(body.guestEmail, "guestEmail", 160);
    const guestPhone = optionalText(body.guestPhone, "guestPhone", 40);
    const checkInDate = isoDate(body.checkInDate, "checkInDate");
    const checkOutDate = isoDate(body.checkOutDate, "checkOutDate");
    const adults = positiveInteger(body.adults ?? 1, "adults", 20);
    const roomCount = positiveInteger(body.roomCount ?? 1, "roomCount", 20);
    const values = [bookingReference, propertyId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, adults, roomCount];
    const invalid = values.find(isErrorResponse);
    if (invalid) return invalid;
    if (checkOutDate <= checkInDate) return Response.json({ error: "checkOutDate must be after checkInDate." }, { status: 400 });
    if (!await getOperationsDb().select({ id: hotelProperties.id }).from(hotelProperties).where(eq(hotelProperties.id, propertyId)).get()) return Response.json({ error: "Property not found." }, { status: 404 });
    if (roomId && !await getOperationsDb().select({ id: hotelRooms.id }).from(hotelRooms).where(eq(hotelRooms.id, roomId)).get()) return Response.json({ error: "Room not found." }, { status: 404 });
    if (roomId) {
      const room = await getOperationsDb().select({ propertyId: hotelRooms.propertyId }).from(hotelRooms).where(eq(hotelRooms.id, roomId)).get();
      if (!room || room.propertyId !== propertyId) return Response.json({ error: "The room does not belong to this property." }, { status: 400 });
    }
    const [booking] = await getOperationsDb().insert(hotelBookings).values({ id: crypto.randomUUID(), bookingReference, propertyId, roomId, guestName, guestEmail, guestPhone, checkInDate, checkOutDate, adults, roomCount }).returning();
    return Response.json({ booking }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
