import { eq } from "drizzle-orm";
import { enquiries, enquiryRateLimits } from "../../../../backend/db/schema";
import { sendEnquiryAdminNotification, type EnquiryEmailInput } from "@/lib/email-service";
import { getCustomerUser } from "@/lib/customer-auth";
import { getOperationsDb, isErrorResponse, isoDate, jsonError, optionalText, positiveInteger, requiredText } from "@/lib/operations-api";

const types = new Set(["contact", "cab", "hotel"]);
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

function optionalDate(value: unknown, field: string): string | null | Response {
  if (value == null || value === "") return null;
  return isoDate(value, field);
}

function ipAddress(request: Request): string {
  return request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function rateLimitKey(request: Request, customerEmail: string): Promise<string> {
  const secret = process.env.FORM_RATE_LIMIT_SECRET ?? process.env.JOURNAWAY_ADMIN_SESSION_SECRET ?? "journaway-form-rate-limit";
  const source = new TextEncoder().encode(`${secret}:${ipAddress(request)}:${customerEmail}`);
  const hash = await crypto.subtle.digest("SHA-256", source);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function enforceRateLimit(request: Request, customerEmail: string): Promise<Response | null> {
  const db = getOperationsDb(); const key = await rateLimitKey(request, customerEmail); const now = new Date(); const cutoff = now.getTime() - RATE_LIMIT_WINDOW_MS;
  const [current] = await db.select().from(enquiryRateLimits).where(eq(enquiryRateLimits.key, key)).limit(1);
  if (current && new Date(current.windowStartedAt).getTime() >= cutoff) {
    if (current.attempts >= RATE_LIMIT_MAX_ATTEMPTS) return Response.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
    await db.update(enquiryRateLimits).set({ attempts: current.attempts + 1, updatedAt: now.toISOString() }).where(eq(enquiryRateLimits.key, key));
    return null;
  }
  if (current) await db.update(enquiryRateLimits).set({ windowStartedAt: now.toISOString(), attempts: 1, updatedAt: now.toISOString() }).where(eq(enquiryRateLimits.key, key));
  else await db.insert(enquiryRateLimits).values({ key, windowStartedAt: now.toISOString(), attempts: 1 });
  return null;
}

export async function POST(request: Request) {
  try {
    const customer = await getCustomerUser();
    if (!customer) return Response.json({ error: "Create an account or log in before sending an enquiry." }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    // Silently accept bots that fill a field invisible to genuine visitors.
    if (typeof body.website === "string" && body.website.trim()) return Response.json({ enquiry: { id: null, status: "received" } }, { status: 201 });
    const startedAt = Number(body.formStartedAt);
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1500) return Response.json({ error: "Please take a moment to complete the form." }, { status: 400 });
    const type = typeof body.type === "string" && types.has(body.type) ? body.type as EnquiryEmailInput["type"] : null;
    if (!type) return Response.json({ error: "Choose a valid enquiry type." }, { status: 400 });
    const name = customer.displayName; const customerEmail = customer.email.toLowerCase(); const phone = requiredText(body.phone, "phone number", 40);
    if (isErrorResponse(phone)) return phone;
    const service = optionalText(body.service, "service", 100); const destination = optionalText(body.destination, "destination", 120); const pickupLocation = optionalText(body.pickupLocation, "pickup location", 160); const dropoffLocation = optionalText(body.dropoffLocation, "drop location", 160); const travelStartDate = optionalDate(body.travelStartDate, "travel date"); const travelEndDate = optionalDate(body.travelEndDate, "check-out date"); const message = optionalText(body.message, "message", 3000);
    const guests = body.guests == null || body.guests === "" ? null : positiveInteger(body.guests, "guests", 30);
    const values = [service, destination, pickupLocation, dropoffLocation, travelStartDate, travelEndDate, message, guests];
    if (values.some(isErrorResponse)) return values.find(isErrorResponse)!;
    if (type === "contact" && !message) return Response.json({ error: "Tell us about your journey." }, { status: 400 });
    if (type === "cab" && (!pickupLocation || !dropoffLocation)) return Response.json({ error: "Pickup and drop locations are required." }, { status: 400 });
    if (type === "hotel" && (!destination || !travelStartDate || !travelEndDate || !guests || travelEndDate <= travelStartDate)) return Response.json({ error: "Enter a destination, valid stay dates, and number of guests." }, { status: 400 });
    const limitResponse = await enforceRateLimit(request, customerEmail); if (limitResponse) return limitResponse;
    const [enquiry] = await getOperationsDb().insert(enquiries).values({ id: crypto.randomUUID(), type, service, name, email: customerEmail, phone, destination, pickupLocation, dropoffLocation, travelStartDate, travelEndDate, guests, message }).returning();
    try { await sendEnquiryAdminNotification(enquiry); } catch (error) { console.error("Enquiry was saved but admin email could not be queued", error); }
    return Response.json({ enquiry: { id: enquiry.id, status: enquiry.status } }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
