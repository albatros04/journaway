import { getCustomerUser } from "@/lib/customer-auth";
import { customerDocument } from "@/lib/trip-document-service";
import { jsonError } from "@/lib/operations-api";
export async function GET(_request: Request, { params }: { params: Promise<{ packageId: string }> }) {
  const customer = await getCustomerUser(); if (!customer) return Response.json({ error: "Log in to download your trip PDF." }, { status: 401 });
  try {
    const { packageId } = await params; const pdf = await customerDocument(packageId, customer.id);
    if (!pdf) return Response.json({ error: "Confirmed itinerary not found." }, { status: 404 });
    return new Response(new Uint8Array(Buffer.from(pdf, "base64")), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="JournAway-trip-${packageId.replace(/[^a-zA-Z0-9-]/g, "")}.pdf"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return jsonError(error); }
}
