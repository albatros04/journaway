import { services } from "./site-data";
import { Button } from "./ui";

const valleyImage = "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2200&q=85";

export function ServiceDirectory({ title = "Ways to travel with JournAway." }: { title?: string }) {
  return <section className="support-services"><div className="container"><div className="support-heading"><div><p className="eyebrow">Travel services</p><h2>{title}</h2></div><p>Explore the services already available across tours, planning and road travel.</p></div><div className="support-service-grid">{services.map((service, index) => <a className="support-service-card" href={service.href} key={service.href}><span>0{index + 1}</span><h3>{service.label}</h3><p>{service.description}</p><b aria-hidden="true">→</b></a>)}</div></div></section>;
}

export function SupportingCta({ eyebrow = "Plan with JournAway", title = "Let’s make the next journey feel simple.", copy = "Start with a destination, a date, or just an idea." }: { eyebrow?: string; title?: string; copy?: string }) {
  return <section className="supporting-cta" style={{ backgroundImage: `linear-gradient(rgba(11, 49, 33, .76), rgba(11, 49, 33, .86)), url('${valleyImage}')` }}><div className="container"><div className="supporting-cta-card glass-panel glass-dark"><p className="eyebrow light">{eyebrow}</p><h2>{title}</h2><p>{copy}</p><div className="button-row"><Button href="/contact">Send an enquiry</Button><Button href="/tours" variant="secondary">Explore tours</Button></div></div></div></section>;
}
