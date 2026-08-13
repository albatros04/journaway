import { desc, eq } from "drizzle-orm";
import { hotelBookings, hotelPartnerMemberships, hotelProperties, hotelRooms } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

export async function GET() {
  const actor = await requireApiActor("hotel");
  if (isErrorResponse(actor)) return actor;
  try {
    const bookings = await getOperationsDb().select({ booking: hotelBookings, property: hotelProperties, room: hotelRooms }).from(hotelPartnerMemberships).innerJoin(hotelBookings, eq(hotelPartnerMemberships.propertyId, hotelBookings.propertyId)).innerJoin(hotelProperties, eq(hotelBookings.propertyId, hotelProperties.id)).leftJoin(hotelRooms, eq(hotelBookings.roomId, hotelRooms.id)).where(eq(hotelPartnerMemberships.userId, actor.userId)).orderBy(desc(hotelBookings.checkInDate));
    return Response.json({ bookings });
  } catch (error) { return jsonError(error); }
}
