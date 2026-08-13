import { eq } from "drizzle-orm";
import { customers } from "../../../../../backend/db/schema";
import { getCustomerUser } from "@/lib/customer-auth";
import { getOperationsDb, isErrorResponse, jsonError, optionalText } from "@/lib/operations-api";

export async function GET() { const customer = await getCustomerUser(); return customer ? Response.json({ customer }) : Response.json({ error: "Authentication is required." }, { status: 401 }); }
export async function PUT(request: Request) { const customer = await getCustomerUser(); if (!customer) return Response.json({ error: "Authentication is required." }, { status: 401 }); try { const body = await request.json() as Record<string, unknown>; const phone = optionalText(body.phone, "phone", 40); if (isErrorResponse(phone)) return phone; const [updated] = await getOperationsDb().update(customers).set({ phone, updatedAt: new Date().toISOString() }).where(eq(customers.id, customer.id)).returning(); return Response.json({ customer: { id: updated.id, email: updated.email, displayName: updated.displayName, profileImageUrl: updated.profileImageUrl, phone: updated.phone } }); } catch (error) { return jsonError(error); } }
