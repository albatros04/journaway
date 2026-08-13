import { services } from "@/components/site-data";
import { ServicePage } from "@/components/page-templates";
export function generateStaticParams() { return services.map(service => ({ service: service.href.split("/").pop()! })); }
export default async function ServiceRoute({ params }: { params: Promise<{ service: string }> }) { const { service: slug } = await params; const service = services.find(item => item.href.endsWith(slug)); return <ServicePage name={service?.label ?? "Travel services"} description={service?.description ?? "Travel support shaped around your journey."} />; }
