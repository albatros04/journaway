import { DestinationDetail, DestinationNotFound } from "@/components/destination-detail";
import { destinations, getDestinationBySlug } from "@/components/site-data";

export function generateStaticParams() { return destinations.map(destination => ({ slug: destination.slug })); }
export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const destination = getDestinationBySlug(slug); return destination ? <DestinationDetail destination={destination} /> : <DestinationNotFound />; }
