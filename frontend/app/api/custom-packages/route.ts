import { and, desc, eq, getTableColumns, gt, sql } from "drizzle-orm";
import { customPackages, tourPackages, tripDocuments } from "../../../../backend/db/schema";
import { destinations } from "@/components/site-data";
import { getCustomerUser } from "@/lib/customer-auth";
import { sendCustomPackageAdminNotification, sendCustomPackageReceivedEmail } from "@/lib/email-service";
import { getOperationsDb, isErrorResponse, isoDate, jsonError, optionalText, positiveInteger, requiredText } from "@/lib/operations-api";

const experienceOptions = new Set(["Adventure", "Mountains", "Honeymoon", "Family"]);

function unauthorized() { return Response.json({ error: "Create an account or log in to save your custom trip." }, { status: 401 }); }

function parseInput(body: Record<string, unknown>) {
  const destinationSlug = requiredText(body.destinationSlug, "destination", 80);
  const travelStartDate = isoDate(body.travelStartDate, "start date"); const travelEndDate = isoDate(body.travelEndDate, "end date"); const adults = positiveInteger(body.adults, "adults", 20); const children = body.children == null ? 0 : Number(body.children); const name = optionalText(body.name, "name", 160); const budgetInr = body.budgetInr == null || body.budgetInr === "" ? null : positiveInteger(body.budgetInr, "budget", 100000000); const accommodationPreference = body.accommodationPreference === "none" ? "none" : "recommend"; const needsCab = body.needsCab === true;
  const experiences = Array.isArray(body.experiences) && body.experiences.every(value => typeof value === "string" && experienceOptions.has(value)) ? body.experiences as string[] : null;
  if (isErrorResponse(destinationSlug)) return destinationSlug;
  if (isErrorResponse(travelStartDate)) return travelStartDate;
  if (isErrorResponse(travelEndDate)) return travelEndDate;
  if (isErrorResponse(adults)) return adults;
  if (isErrorResponse(name)) return name;
  if (isErrorResponse(budgetInr)) return budgetInr;
  if (new Date(travelStartDate).toISOString().slice(0, 10) !== travelStartDate || new Date(travelEndDate).toISOString().slice(0, 10) !== travelEndDate) return Response.json({ error: "Choose valid travel dates." }, { status: 400 });
  if (!destinations.some(destination => destination.slug === destinationSlug) || travelEndDate <= travelStartDate || !Number.isInteger(children) || children < 0 || children > 20 || !experiences) return Response.json({ error: "One or more custom trip preferences are invalid." }, { status: 400 });
  const destination = destinations.find(item => item.slug === destinationSlug)!;
  return { name: name ?? `${destination.name} custom trip`, destinationSlug, travelStartDate, travelEndDate, adults, children, experiencesJson: JSON.stringify(experiences), accommodationPreference, needsCab, budgetInr } as const;
}

export async function GET() {
  const customer = await getCustomerUser(); if (!customer) return unauthorized();
  try { return Response.json({ packages: await getOperationsDb().select({ ...getTableColumns(customPackages), hasPdf: sql<boolean>`${tripDocuments.confirmedAt} is not null` }).from(customPackages).leftJoin(tripDocuments, eq(tripDocuments.tripId, customPackages.id)).where(eq(customPackages.customerId, customer.id)).orderBy(desc(customPackages.updatedAt)) }); }
  catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const customer = await getCustomerUser(); if (!customer) return unauthorized();
  try {
    const body = await request.json() as Record<string, unknown>;
    let sourcePackageSlug: string | null = null;
    if (body.sourcePackageSlug != null) {
      if (typeof body.sourcePackageSlug !== "string") return Response.json({ error: "Invalid selected package." }, { status: 400 });
      const [selected] = await getOperationsDb().select().from(tourPackages).where(and(eq(tourPackages.slug, body.sourcePackageSlug), eq(tourPackages.status, "published"))).limit(1);
      if (!selected) return Response.json({ error: "This package is no longer available." }, { status: 404 });
      sourcePackageSlug = selected.slug;
      body.name = selected.name; body.destinationSlug = selected.destination.toLowerCase(); body.experiences = []; body.budgetInr = null;
    }
    const input = parseInput(body); if (isErrorResponse(input)) return input;
    if ((Date.parse(input.travelEndDate) - Date.parse(input.travelStartDate)) / 86400000 > 30) return Response.json({ error: "Choose a trip of up to 31 days." }, { status: 400 });
    const [recent] = await getOperationsDb().select({ total: sql<number>`count(*)::int` }).from(customPackages).where(and(eq(customPackages.customerId, customer.id), gt(customPackages.submittedAt, new Date(Date.now() - 15 * 60 * 1000).toISOString())));
    if (recent.total >= 5) return Response.json({ error: "Please wait a few minutes before sending another trip request." }, { status: 429 });
    const now = new Date().toISOString(); const [customPackage] = await getOperationsDb().insert(customPackages).values({ id: crypto.randomUUID(), customerId: customer.id, sourcePackageSlug, ...input, status: "submitted", submittedAt: now }).returning();
    const emailInput = { ...customPackage, destination: destinations.find(destination => destination.slug === customPackage.destinationSlug)?.name ?? customPackage.destinationSlug };
    try { await Promise.all([sendCustomPackageReceivedEmail(emailInput, customer.email), sendCustomPackageAdminNotification(emailInput, customer.email)]); } catch (error) { console.error("Custom package was saved but email notifications could not be queued", error); }
    return Response.json({ package: customPackage }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
