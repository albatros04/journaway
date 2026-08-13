import { and, eq, gt } from "drizzle-orm";
import { PackageDetail, PackageNotFound } from "@/components/package-detail";
import { getTourBySlug, showcaseTours } from "@/components/site-data";
import { tourPackages } from "../../../../backend/db/schema";
import { packageImages } from "@/lib/package-images";
import { getOperationsDb } from "@/lib/operations-api";

type ManagedPackage = typeof tourPackages.$inferSelect;

export function generateStaticParams() { return showcaseTours.map(tour => ({ slug: tour.slug })); }

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let managedPackage: ManagedPackage | undefined;
  try {
    managedPackage = await getOperationsDb().select().from(tourPackages).where(and(eq(tourPackages.slug, slug), eq(tourPackages.status, "published"), gt(tourPackages.priceInr, 0))).get();
  } catch { /* Preserve source-defined details if D1 is unavailable. */ }
  if (managedPackage) return <PackageDetail detailBase="/tour-packages" tour={{ slug: managedPackage.slug, name: managedPackage.name, destination: managedPackage.destination, duration: managedPackage.duration, description: managedPackage.description, image: packageImages[managedPackage.imageKey], priceInr: managedPackage.priceInr }} />;
  const tour = getTourBySlug(slug);
  return tour ? <PackageDetail tour={tour} detailBase="/tour-packages" /> : <PackageNotFound />;
}
