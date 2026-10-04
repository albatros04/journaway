import { eq } from "drizzle-orm";
import { enquiries } from "../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";
import { sendEnquiryStatusUpdate } from "@/lib/email-service";

const statuses = new Set(["new", "in_progress", "closed"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ enquiryId: string }> }) {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as { status?: unknown };
    if (typeof body.status !== "string" || !statuses.has(body.status)) return Response.json({ error: "Choose a valid enquiry status." }, { status: 400 });
    const { enquiryId } = await params;
    const db = getOperationsDb(); const [previous] = await db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
    if (!previous) return Response.json({ error: "Enquiry not found." }, { status: 404 });
    const [enquiry] = await db.update(enquiries).set({ status: body.status as "new" | "in_progress" | "closed", updatedAt: new Date().toISOString() }).where(eq(enquiries.id, enquiryId)).returning();
    if (enquiry && previous.status !== enquiry.status) { try { await sendEnquiryStatusUpdate(enquiry, previous.status); } catch (error) { console.error("Enquiry status changed but customer email could not be queued", error); } }
    return enquiry ? Response.json({ enquiry }) : Response.json({ error: "Enquiry not found." }, { status: 404 });
  } catch (error) { return jsonError(error); }
}
