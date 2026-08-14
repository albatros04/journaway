import { enquiries } from "../../../../backend/db/schema";
import { sendEnquiryAdminNotification, type EnquiryEmailInput } from "@/lib/email-service";
import { getOperationsDb, isErrorResponse, isoDate, jsonError, optionalText, positiveInteger, requiredText } from "@/lib/operations-api";

const types = new Set(["contact", "cab", "hotel"]);

function email(value: unknown): string | Response {
  const text = requiredText(value, "email address", 160);
  if (isErrorResponse(text)) return text;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  return text.toLowerCase();
}

function optionalDate(value: unknown, field: string): string | null | Response {
  if (value == null || value === "") return null;
  return isoDate(value, field);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const type = typeof body.type === "string" && types.has(body.type) ? body.type as EnquiryEmailInput["type"] : null;
    if (!type) return Response.json({ error: "Choose a valid enquiry type." }, { status: 400 });
    const name = requiredText(body.name, "name"); const customerEmail = email(body.email); const phone = requiredText(body.phone, "phone number", 40);
    if ([name, customerEmail, phone].some(isErrorResponse)) return [name, customerEmail, phone].find(isErrorResponse)!;
    const service = optionalText(body.service, "service", 100); const destination = optionalText(body.destination, "destination", 120); const pickupLocation = optionalText(body.pickupLocation, "pickup location", 160); const dropoffLocation = optionalText(body.dropoffLocation, "drop location", 160); const travelStartDate = optionalDate(body.travelStartDate, "travel date"); const travelEndDate = optionalDate(body.travelEndDate, "check-out date"); const message = optionalText(body.message, "message", 3000);
    const guests = body.guests == null || body.guests === "" ? null : positiveInteger(body.guests, "guests", 30);
    const values = [service, destination, pickupLocation, dropoffLocation, travelStartDate, travelEndDate, message, guests];
    if (values.some(isErrorResponse)) return values.find(isErrorResponse)!;
    if (type === "contact" && !message) return Response.json({ error: "Tell us about your journey." }, { status: 400 });
    if (type === "cab" && (!pickupLocation || !dropoffLocation)) return Response.json({ error: "Pickup and drop locations are required." }, { status: 400 });
    if (type === "hotel" && (!destination || !travelStartDate || !travelEndDate || !guests || travelEndDate <= travelStartDate)) return Response.json({ error: "Enter a destination, valid stay dates, and number of guests." }, { status: 400 });
    const [enquiry] = await getOperationsDb().insert(enquiries).values({ id: crypto.randomUUID(), type, service, name, email: customerEmail, phone, destination, pickupLocation, dropoffLocation, travelStartDate, travelEndDate, guests, message }).returning();
    try { await sendEnquiryAdminNotification(enquiry); } catch (error) { console.error("Enquiry was saved but admin email could not be queued", error); }
    return Response.json({ enquiry: { id: enquiry.id, status: enquiry.status } }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
