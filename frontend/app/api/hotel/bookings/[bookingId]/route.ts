import { and, eq } from "drizzle-orm";
import { hotelBookings, hotelPartnerMemberships } from "../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

const nextStatuses = { confirmed: ["checked_in", "cancelled"], checked_in: ["checked_out"], checked_out: [], cancelled: [] } as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const actor = await requireApiActor("hotel");
  if (isErrorResponse(actor)) return actor;
  try {
    const { bookingId } = await params;
    const body = await request.json() as { status?: string };
    const booking = await getOperationsDb().select({ booking: hotelBookings }).from(hotelBookings).innerJoin(hotelPartnerMemberships, and(eq(hotelBookings.propertyId, hotelPartnerMemberships.propertyId), eq(hotelPartnerMemberships.userId, actor.userId))).where(eq(hotelBookings.id, bookingId)).get();
    if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });
    if (!body.status || !nextStatuses[booking.booking.status].includes(body.status as never)) return Response.json({ error: "That booking status transition is not allowed." }, { status: 400 });
    const [updatedBooking] = await getOperationsDb().update(hotelBookings).set({ status: body.status as "checked_in" | "checked_out" | "cancelled", updatedAt: new Date().toISOString() }).where(eq(hotelBookings.id, bookingId)).returning();
    return Response.json({ booking: updatedBooking });
  } catch (error) { return jsonError(error); }
}
