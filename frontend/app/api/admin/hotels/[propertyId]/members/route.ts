import { and, eq } from "drizzle-orm";
import { hotelPartnerMemberships, hotelProperties, operationsAccounts } from "../../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requiredText, requireApiActor } from "@/lib/operations-api";

export async function POST(request: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const { propertyId } = await params;
    const body = await request.json() as Record<string, unknown>;
    const operationsAccountId = requiredText(body.operationsAccountId, "operationsAccountId", 80);
    const role = body.role === "manager" ? "manager" : "owner";
    if (isErrorResponse(operationsAccountId)) return operationsAccountId;
    const [property] = await getOperationsDb().select({ id: hotelProperties.id }).from(hotelProperties).where(eq(hotelProperties.id, propertyId)).limit(1);
    if (!property) return Response.json({ error: "Property not found." }, { status: 404 });
    const [account] = await getOperationsDb().select().from(operationsAccounts).where(and(eq(operationsAccounts.id, operationsAccountId), eq(operationsAccounts.role, "hotel"), eq(operationsAccounts.status, "active"))).limit(1);
    if (!account) return Response.json({ error: "Choose an approved hotel partner account." }, { status: 400 });
    const [membership] = await getOperationsDb().insert(hotelPartnerMemberships).values({ id: crypto.randomUUID(), propertyId, userId: account.userId, email: account.email, role }).onConflictDoNothing().returning();
    return Response.json({ membership: membership ?? null }, { status: membership ? 201 : 200 });
  } catch (error) { return jsonError(error); }
}
