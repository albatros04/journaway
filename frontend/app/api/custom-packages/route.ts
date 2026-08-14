import { desc, eq } from "drizzle-orm";
import { customPackages } from "../../../../backend/db/schema";
import { destinations } from "@/components/site-data";
import { getCustomerUser } from "@/lib/customer-auth";
import { sendCustomPackageAdminNotification, sendCustomPackageReceivedEmail } from "@/lib/email-service";
import { getOperationsDb, isErrorResponse, isoDate, jsonError, optionalText, positiveInteger, requiredText } from "@/lib/operations-api";

const experienceOptions = new Set(["Adventure", "Mountains", "Honeymoon", "Family"]);

function unauthorized() { return Response.json({ error: "Sign in with Google to save your custom trip." }, { status: 401 }); }

function parseInput(body: Record<string, unknown>) {
  const destinationSlug = requiredText(body.destinationSlug, "destination", 80);
  const travelStartDate = isoDate(body.travelStartDate, "start date"); const travelEndDate = isoDate(body.travelEndDate, "end date"); const adults = positiveInteger(body.adults, "adults", 20); const children = body.children == null ? 0 : Number(body.children); const name = optionalText(body.name, "name", 160); const budgetInr = body.budgetInr == null || body.budgetInr === "" ? null : positiveInteger(body.budgetInr, "budget", 100000000); const accommodationPreference = body.accommodationPreference === "none" ? "none" : "recommend"; const needsCab = body.needsCab === true;
  const experiences = Array.isArray(body.experiences) && body.experiences.every(value => typeof value === "string" && experienceOptions.has(value)) ? body.experiences as string[] : null;
  const invalid = [destinationSlug, travelStartDate, travelEndDate, adults, name, budgetInr].find(isErrorResponse);
  if (invalid) return invalid;
  if (!destinations.some(destination => destination.slug === destinationSlug) || travelEndDate <= travelStartDate || !Number.isInteger(children) || children < 0 || children > 20 || !experiences) return Response.json({ error: "One or more custom trip preferences are invalid." }, { status: 400 });
  const destination = destinations.find(item => item.slug === destinationSlug)!;
  return { name: name ?? `${destination.name} custom trip`, destinationSlug, travelStartDate, travelEndDate, adults, children, experiencesJson: JSON.stringify(experiences), accommodationPreference, needsCab, budgetInr };
}

export async function GET() {
  const customer = await getCustomerUser(); if (!customer) return unauthorized();
  try { return Response.json({ packages: await getOperationsDb().select().from(customPackages).where(eq(customPackages.customerId, customer.id)).orderBy(desc(customPackages.updatedAt)) }); }
  catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const customer = await getCustomerUser(); if (!customer) return unauthorized();
  try {
    const input = parseInput(await request.json() as Record<string, unknown>); if (isErrorResponse(input)) return input;
    const now = new Date().toISOString(); const [customPackage] = await getOperationsDb().insert(customPackages).values({ id: crypto.randomUUID(), customerId: customer.id, ...input, status: "submitted", submittedAt: now }).returning();
    const emailInput = { ...customPackage, destination: destinations.find(destination => destination.slug === customPackage.destinationSlug)?.name ?? customPackage.destinationSlug };
    try { await Promise.all([sendCustomPackageReceivedEmail(emailInput, customer.email), sendCustomPackageAdminNotification(emailInput, customer.email)]); } catch (error) { console.error("Custom package was saved but email notifications could not be queued", error); }
    return Response.json({ package: customPackage }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
