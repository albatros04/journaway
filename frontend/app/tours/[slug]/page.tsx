import { PackageDetail, PackageNotFound } from "@/components/package-detail";
import { getTourBySlug, showcaseTours } from "@/components/site-data";

export function generateStaticParams() { return showcaseTours.map(tour => ({ slug: tour.slug })); }
export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const tour = getTourBySlug(slug); return tour ? <PackageDetail tour={tour} detailBase="/tours" /> : <PackageNotFound />; }
