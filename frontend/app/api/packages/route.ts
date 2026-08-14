import { and, asc, eq, gt } from "drizzle-orm";
import { tourPackages } from "../../../../backend/db/schema";
import { packageImages } from "@/lib/package-images";
import { getOperationsDb, jsonError } from "@/lib/operations-api";

export async function GET(request: Request) {
  try {
    const catalogType = new URL(request.url).searchParams.get("catalogType");
    if (catalogType !== "tour" && catalogType !== "package") return Response.json({ error: "Choose tours or packages." }, { status: 400 });
    const conditions = catalogType === "package" ? and(eq(tourPackages.catalogType, "package"), eq(tourPackages.status, "published"), gt(tourPackages.priceInr, 0)) : and(eq(tourPackages.catalogType, "tour"), eq(tourPackages.status, "published"));
    const packages = await getOperationsDb().select({ slug: tourPackages.slug, name: tourPackages.name, destination: tourPackages.destination, duration: tourPackages.duration, description: tourPackages.description, imageKey: tourPackages.imageKey, priceInr: tourPackages.priceInr }).from(tourPackages).where(conditions).orderBy(asc(tourPackages.name));
    return Response.json({ packages: packages.map(tourPackage => ({ ...tourPackage, image: packageImages[tourPackage.imageKey] })) });
  } catch (error) { return jsonError(error); }
}
