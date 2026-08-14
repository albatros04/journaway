import { desc, eq } from "drizzle-orm";
import { tourPackages } from "../../../../../backend/db/schema";
import { getOperationsDb, isErrorResponse, jsonError, positiveInteger, requiredText, requireApiActor } from "@/lib/operations-api";

const destinations = new Set(["Ladakh", "Kashmir"]);
const imageKeys = new Set(["ladakh-high-pass", "pangong-lake", "pahalgam-valley", "gulmarg-snow"]);
const statuses = new Set(["draft", "published"]);
const catalogTypes = new Set(["tour", "package"]);

type PackageInput = { slug: string; name: string; destination: "Ladakh" | "Kashmir"; duration: string; priceInr: number; description: string; imageKey: "ladakh-high-pass" | "pangong-lake" | "pahalgam-valley" | "gulmarg-snow"; status: "draft" | "published" };

function packageInput(body: Record<string, unknown>): PackageInput | Response {
  const slugValue = requiredText(body.slug, "slug", 90);
  const name = requiredText(body.name, "name");
  const destination = requiredText(body.destination, "destination", 20);
  const duration = requiredText(body.duration, "duration", 40);
  const priceInr = positiveInteger(body.priceInr, "priceInr", 100000000);
  const description = requiredText(body.description, "description", 1000);
  const imageKey = requiredText(body.imageKey, "imageKey", 40);
  const status = requiredText(body.status, "status", 20);
  const values = [slugValue, name, destination, duration, priceInr, description, imageKey, status];
  const invalid = values.find(isErrorResponse);
  if (invalid) return invalid;
  const slug = slugValue.toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: "slug may use lowercase letters, numbers and hyphens only." }, { status: 400 });
  if (!destinations.has(destination) || !imageKeys.has(imageKey) || !statuses.has(status)) return Response.json({ error: "Package destination, image choice or status is invalid." }, { status: 400 });
  return { slug, name, destination: destination as PackageInput["destination"], duration, priceInr, description, imageKey: imageKey as PackageInput["imageKey"], status: status as PackageInput["status"] };
}

export async function GET(request: Request) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const catalogType = new URL(request.url).searchParams.get("catalogType");
    return Response.json({ packages: catalogTypes.has(catalogType ?? "") ? await getOperationsDb().select().from(tourPackages).where(eq(tourPackages.catalogType, catalogType as "tour" | "package")).orderBy(desc(tourPackages.updatedAt)) : await getOperationsDb().select().from(tourPackages).orderBy(desc(tourPackages.updatedAt)) });
  }
  catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const actor = await requireApiActor("admin");
  if (isErrorResponse(actor)) return actor;
  try {
    const body = await request.json() as Record<string, unknown>;
    const input = packageInput(body);
    if (isErrorResponse(input)) return input;
    const catalogType = typeof body.catalogType === "string" && catalogTypes.has(body.catalogType) ? body.catalogType as "tour" | "package" : "package";
    const [tourPackage] = await getOperationsDb().insert(tourPackages).values({ id: crypto.randomUUID(), ...input, catalogType, createdByUserId: actor.userId, updatedByUserId: actor.userId }).returning();
    return Response.json({ package: tourPackage }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
