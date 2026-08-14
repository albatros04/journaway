import { eq } from "drizzle-orm";
import { enquiries } from "../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";

const statuses = new Set(["new", "in_progress", "closed"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ enquiryId: string }> }) {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as { status?: unknown };
    if (typeof body.status !== "string" || !statuses.has(body.status)) return Response.json({ error: "Choose a valid enquiry status." }, { status: 400 });
    const { enquiryId } = await params;
    const [enquiry] = await getOperationsDb().update(enquiries).set({ status: body.status as "new" | "in_progress" | "closed", updatedAt: new Date().toISOString() }).where(eq(enquiries.id, enquiryId)).returning();
    return enquiry ? Response.json({ enquiry }) : Response.json({ error: "Enquiry not found." }, { status: 404 });
  } catch (error) { return jsonError(error); }
}
