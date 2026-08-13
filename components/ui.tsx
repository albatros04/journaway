import type { ReactNode } from "react";

type ButtonProps = { href?: string; children: ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string };

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const classNames = `button button-${variant} ${className}`;
  return href ? <a className={classNames} href={href}>{children}<span aria-hidden="true">→</span></a> : <button className={classNames} type="submit">{children}<span aria-hidden="true">→</span></button>;
}

export function Chip({ children }: { children: ReactNode }) { return <span className="chip">{children}</span>; }

type Tour = { destination: string; name: string; duration: string; price: string; badge?: string; image: string };
export function TourCard({ tour }: { tour: Tour }) {
  return <article className="tour-card">
    <div className="tour-card-image"><img src={tour.image} alt="" loading="lazy" />{tour.badge && <span className="tour-badge">{tour.badge}</span>}</div>
    <div className="tour-card-content"><p className="location-label">{tour.destination}</p><h3>{tour.name}</h3><div className="tour-card-meta"><Chip>{tour.duration}</Chip><span><small>From</small> {tour.price}</span></div><a className="card-link" href="/contact">View Package <span>→</span></a></div>
  </article>;
}

type Destination = { name: string; subtitle: string; image: string };
export function DestinationCard({ destination }: { destination: Destination }) {
  return <a className="destination-card" href="/tours"><img src={destination.image} alt="" loading="lazy" /><div><p>{destination.subtitle}</p><h3>{destination.name}</h3><span>Explore <b>→</b></span></div></a>;
}

export function EmptyResults({ type }: { type: "tours" | "packages" | "vehicles" }) {
  const label = type === "vehicles" ? "vehicles" : type;
  return <div className="empty-results"><span aria-hidden="true">⌁</span><h2>No {label} available right now</h2><p>We could not find published {label} matching those filters. Our team can still help plan the right journey.</p><Button href="/contact" variant="secondary">Get a trip quote</Button></div>;
}
