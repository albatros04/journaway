import { eq } from "drizzle-orm";
import { tourPackages } from "../../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, positiveInteger, requiredText, requireApiActor } from "@/lib/operations-api";

const destinations = new Set(["Ladakh", "Kashmir"]);
const imageKeys = new Set(["ladakh-high-pass", "pangong-lake", "pahalgam-valley", "gulmarg-snow"]);
const statuses = new Set(["draft", "published"]);

async function parseInput(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const slugValue = requiredText(body.slug, "slug", 90); const name = requiredText(body.name, "name"); const destination = requiredText(body.destination, "destination", 20); const duration = requiredText(body.duration, "duration", 40); const priceInr = positiveInteger(body.priceInr, "priceInr", 100000000); const description = requiredText(body.description, "description", 1000); const imageKey = requiredText(body.imageKey, "imageKey", 40); const status = requiredText(body.status, "status", 20);
  const invalid = [slugValue, name, destination, duration, priceInr, description, imageKey, status].find(isErrorResponse);
  if (invalid) return invalid;
  const slug = slugValue.toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !destinations.has(destination) || !imageKeys.has(imageKey) || !statuses.has(status)) return Response.json({ error: "One or more package fields are invalid." }, { status: 400 });
  return { slug, name, destination: destination as "Ladakh" | "Kashmir", duration, priceInr, description, imageKey: imageKey as "ladakh-high-pass" | "pangong-lake" | "pahalgam-valley" | "gulmarg-snow", status: status as "draft" | "published" };
}

export async function PUT(request: Request, { params }: { params: Promise<{ packageId: string }> }) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const input = await parseInput(request); if (isErrorResponse(input)) return input;
    const { packageId } = await params;
    const [tourPackage] = await getOperationsDb().update(tourPackages).set({ ...input, updatedByUserId: actor.userId, updatedAt: new Date().toISOString() }).where(eq(tourPackages.id, packageId)).returning();
    if (!tourPackage) return Response.json({ error: "Package not found." }, { status: 404 });
    return Response.json({ package: tourPackage });
  } catch (error) { return jsonError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ packageId: string }> }) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const { packageId } = await params;
    const [deleted] = await getOperationsDb().delete(tourPackages).where(eq(tourPackages.id, packageId)).returning({ id: tourPackages.id });
    if (!deleted) return Response.json({ error: "Package not found." }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) { return jsonError(error); }
}
