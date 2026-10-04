import { eq } from "drizzle-orm";
import { customPackages, tripDocuments } from "../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";
const statuses = new Set(["submitted", "under_review", "quoted", "cancelled"]);
export async function PATCH(request: Request, { params }: { params: Promise<{ packageId: string }> }) {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as { status?: string };
    if (body.status === "confirmed") return Response.json({ error: "Preview and confirm the trip in its itinerary editor to generate the customer PDF." }, { status: 400 });
    if (!body.status || !statuses.has(body.status)) return Response.json({ error: "Invalid trip status." }, { status: 400 });
    const { packageId } = await params;
    const result = await getOperationsDb().transaction(async tx => {
      const [trip] = await tx.select().from(customPackages).where(eq(customPackages.id, packageId)).for("update");
      if (!trip) return null;
      const [document] = await tx.select().from(tripDocuments).where(eq(tripDocuments.tripId, packageId));
      if (document?.confirmedAt && body.status !== "cancelled") return false;
      const [updated] = await tx.update(customPackages).set({ status: body.status as "submitted" | "under_review" | "quoted" | "cancelled", updatedAt: new Date().toISOString() }).where(eq(customPackages.id, packageId)).returning();
      return updated;
    });
    if (result === false) return Response.json({ error: "An approved itinerary is locked. It can only be cancelled." }, { status: 409 });
    return result ? Response.json({ package: result }) : Response.json({ error: "Trip not found." }, { status: 404 });
  } catch (error) { return jsonError(error); }
}
