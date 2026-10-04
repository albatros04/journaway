import { and, eq } from "drizzle-orm";
import { PackageDetail, PackageNotFound } from "@/components/package-detail";
import { tourPackages } from "../../../../backend/db/schema";
import { packageImages } from "@/lib/package-images";
import { getOperationsDb } from "@/lib/operations-api";

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let tour;
  try {
    [tour] = await getOperationsDb().select().from(tourPackages).where(and(eq(tourPackages.slug, slug), eq(tourPackages.catalogType, "tour"), eq(tourPackages.status, "published"))).limit(1);
  } catch { /* The public not-found state is safer than exposing an unavailable record. */ }
  if (tour) return <PackageDetail detailBase="/tours" tour={{ slug: tour.slug, name: tour.name, destination: tour.destination, duration: tour.duration, description: tour.description, image: packageImages[tour.imageKey], priceInr: tour.priceInr || undefined }} />;
  return <PackageNotFound />;
}
