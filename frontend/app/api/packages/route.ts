import { and, asc, eq, gt } from "drizzle-orm";
import { tourPackages } from "../../../../backend/db/schema";
import { packageImages } from "@/lib/package-images";
import { getOperationsDb, jsonError } from "@/lib/operations-api";

export async function GET() {
  try {
    const packages = await getOperationsDb().select({ slug: tourPackages.slug, name: tourPackages.name, destination: tourPackages.destination, duration: tourPackages.duration, description: tourPackages.description, imageKey: tourPackages.imageKey, priceInr: tourPackages.priceInr }).from(tourPackages).where(and(eq(tourPackages.status, "published"), gt(tourPackages.priceInr, 0))).orderBy(asc(tourPackages.name));
    return Response.json({ packages: packages.map(tourPackage => ({ ...tourPackage, image: packageImages[tourPackage.imageKey] })) });
  } catch (error) { return jsonError(error); }
}
