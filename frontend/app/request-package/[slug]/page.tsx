import { and, eq } from "drizzle-orm";
import { tourPackages } from "../../../../backend/db/schema";
import { getOperationsDb } from "@/lib/operations-api";
import { SelectedPackageRequest } from "@/components/selected-package-request";
import { PackageNotFound } from "@/components/package-detail";
export default async function RequestPackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tour] = await getOperationsDb().select().from(tourPackages).where(and(eq(tourPackages.slug, slug), eq(tourPackages.status, "published"))).limit(1);
  if (!tour) return <PackageNotFound />;
  return <SelectedPackageRequest slug={tour.slug} name={tour.name} duration={tour.duration} />;
}
