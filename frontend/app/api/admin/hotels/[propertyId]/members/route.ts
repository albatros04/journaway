import { eq } from "drizzle-orm";
import { hotelPartnerMemberships, hotelProperties } from "../../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requiredText, requireApiActor } from "@/lib/operations-api";

export async function POST(request: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const { propertyId } = await params;
    const body = await request.json() as Record<string, unknown>;
    const userId = requiredText(body.userId, "userId", 160);
    const email = requiredText(body.email, "email", 160);
    const role = body.role === "manager" ? "manager" : "owner";
    if (isErrorResponse(userId) || isErrorResponse(email)) return isErrorResponse(userId) ? userId : email;
    const [property] = await getOperationsDb().select({ id: hotelProperties.id }).from(hotelProperties).where(eq(hotelProperties.id, propertyId)).limit(1);
    if (!property) return Response.json({ error: "Property not found." }, { status: 404 });
    const [membership] = await getOperationsDb().insert(hotelPartnerMemberships).values({ id: crypto.randomUUID(), propertyId, userId, email: email.toLowerCase(), role }).onConflictDoNothing().returning();
    return Response.json({ membership: membership ?? null }, { status: membership ? 201 : 200 });
  } catch (error) { return jsonError(error); }
}
