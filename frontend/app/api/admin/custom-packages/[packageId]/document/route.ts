import { and, eq, isNull } from "drizzle-orm";
import { customPackages, tripDocuments } from "../../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, requireApiActor } from "@/lib/operations-api";
import { confirmationErrors, MAX_DOCUMENT_BYTES, parseTripDocument } from "@/lib/trip-document";
import { documentDeliveryStatus, ensureTripDocument, getTripBundle, publicDocument } from "@/lib/trip-document-service";
import { generateTripPdf, pdfFilename } from "@/lib/trip-pdf";
import { sendTripDocumentEmail } from "@/lib/email-service";

type Context = { params: Promise<{ packageId: string }> };
const bad = (error: string, status = 400) => Response.json({ error }, { status });
export async function GET(request: Request, context: Context) {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try {
    const { packageId } = await context.params; const bundle = await getTripBundle(packageId); if (!bundle) return bad("Trip not found.", 404);
    const document = await ensureTripDocument(bundle.trip);
    if (new URL(request.url).searchParams.has("pdf")) {
      const bytes = document.confirmedPdfBase64 ? Buffer.from(document.confirmedPdfBase64, "base64") : await generateTripPdf({ trip: bundle.trip, customerName: bundle.customer.displayName, details: publicDocument(document).details, confirmed: false });
      return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${pdfFilename(packageId)}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
    }
    return Response.json({ ...bundle, document: publicDocument(document), delivery: await documentDeliveryStatus(packageId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return jsonError(error); }
}
export async function PUT(request: Request, context: Context) {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try {
    const raw = await request.text(); if (raw.length > MAX_DOCUMENT_BYTES + 1000) return bad("Itinerary is too large.", 413);
    let body; let details;
    try { body = JSON.parse(raw); details = parseTripDocument(body.details); } catch (e) { return bad(e instanceof Error ? e.message : "Invalid itinerary."); }
    if (!Number.isInteger(body.revision)) return bad("Reload the itinerary before saving.");
    const { packageId } = await context.params; const bundle = await getTripBundle(packageId); if (!bundle) return bad("Trip not found.", 404);
    const [document] = await getOperationsDb().update(tripDocuments).set({ detailsJson: JSON.stringify(details), revision: body.revision + 1, updatedAt: new Date().toISOString() })
      .where(and(eq(tripDocuments.tripId, packageId), eq(tripDocuments.revision, body.revision), isNull(tripDocuments.confirmedAt))).returning();
    if (!document) return bad("This itinerary was changed or confirmed elsewhere. Reload before continuing.", 409);
    return Response.json({ document: publicDocument(document) });
  } catch (error) { return jsonError(error); }
}
export async function POST(request: Request, context: Context) {
  const actor = await requireApiActor("admin"); if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as { action?: string; revision?: number };
    if (body.action !== "confirm" && body.action !== "retry") return bad("Choose confirm or retry.");
    const { packageId } = await context.params; const bundle = await getTripBundle(packageId); if (!bundle) return bad("Trip not found.", 404);
    if (bundle.trip.status === "cancelled") return bad("Cancelled trips cannot be confirmed or emailed.", 409);
    let document = await ensureTripDocument(bundle.trip);
    if (body.action === "confirm" && !document.confirmedAt) {
      if (document.revision !== body.revision) return bad("The saved itinerary changed. Reload and preview it again.", 409);
      const details = publicDocument(document).details; const errors = confirmationErrors(details, bundle.trip);
      if (errors.length) return bad(errors.join(" "));
      let bytes: Buffer;
      try { bytes = await generateTripPdf({ trip: bundle.trip, customerName: bundle.customer.displayName, details, confirmed: true }); }
      catch { return bad("The PDF could not be generated. Check the uploaded images and preview before confirming."); }
      const updated = await getOperationsDb().transaction(async tx => {
        const [trip] = await tx.select().from(customPackages).where(eq(customPackages.id, packageId)).for("update");
        if (trip.status === "cancelled") return null;
        const [saved] = await tx.update(tripDocuments).set({ confirmedAt: new Date().toISOString(), confirmedPdfBase64: bytes.toString("base64"), confirmedCustomerName: bundle.customer.displayName, confirmedCustomerEmail: bundle.customer.email })
          .where(and(eq(tripDocuments.tripId, packageId), eq(tripDocuments.revision, body.revision!), isNull(tripDocuments.confirmedAt))).returning();
        if (!saved) return null;
        await tx.update(customPackages).set({ status: "confirmed", updatedAt: new Date().toISOString() }).where(eq(customPackages.id, packageId));
        return saved;
      });
      if (!updated) return bad("This trip changed while confirming. Reload to see its current status.", 409);
      document = updated;
    }
    if (!document.confirmedPdfBase64 || !document.confirmedCustomerEmail) return bad("Confirm a complete itinerary before sending it.");
    const delivery = await sendTripDocumentEmail({ tripId: packageId, customerId: bundle.customer.id, recipient: document.confirmedCustomerEmail, tripName: bundle.trip.name, pdf: Buffer.from(document.confirmedPdfBase64, "base64"), retry: body.action === "retry" });
    return Response.json({ confirmed: true, delivery, document: publicDocument(document) });
  } catch (error) { return jsonError(error); }
}
