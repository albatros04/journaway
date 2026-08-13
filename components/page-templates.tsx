import { Button, Chip, EmptyResults, TourCard } from "./ui";
import { categoryLabels, showcaseTours } from "./site-data";

export function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: string; copy: string; image?: string }) {
  return <section className={`page-hero ${image ? "page-hero-image" : ""}`} style={image ? { backgroundImage: `linear-gradient(90deg, rgba(14,29,23,.76), rgba(14,29,23,.31)), url('${image}')` } : undefined}><div className="container"><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div></section>;
}

export function ListingPage({ type }: { type: "tours" | "packages" | "vehicles" }) {
  const title = type === "vehicles" ? "Travel the road your way." : type === "packages" ? "Hand-picked trips, made simple." : "Discover India, one route at a time.";
  const copy = type === "vehicles" ? "Compare comfortable options for local, outstation and group travel." : "Browse thoughtfully planned experiences across India, then talk to us to shape your perfect journey.";
  return <main><PageHero eyebrow={type === "vehicles" ? "Vehicle rental" : "Explore journeys"} title={title} copy={copy} image={type === "vehicles" ? "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85" : "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?auto=format&fit=crop&w=2200&q=85"} /><section className="listing-section container"><div className="filter-bar"><label>Search <input placeholder={type === "vehicles" ? "Search vehicle type" : "Search tours or destinations"} /></label><div className="filter-chips">{["All", ...categoryLabels].map(label => <button key={label} type="button">{label}</button>)}</div><button className="filter-button" type="button">Filters <span>⌄</span></button></div><div className="listing-heading"><div><p className="eyebrow">Available {type}</p><h2>{type === "vehicles" ? "Vehicles" : type === "packages" ? "Tour packages" : "Tours"}</h2></div><p>Published options will appear here as they are made available.</p></div>{type === "tours" ? <div className="tour-grid muted-list">{showcaseTours.map(tour => <TourCard tour={tour} key={tour.name} />)}</div> : <EmptyResults type={type} />}</section></main>;
}

export function ServicePage({ name, description }: { name: string; description: string }) {
 return <main><PageHero eyebrow="JournAway services" title={name} copy={description} image="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2200&q=85"/><section className="section container service-detail"><div><p className="eyebrow">Thoughtful logistics</p><h2>Travel made clear, comfortable and connected.</h2></div><div><p>Our travel team helps you choose a route, stay and vehicle arrangement that makes sense for your timing, group and budget. Every enquiry begins with a real conversation.</p><div className="chip-row"><Chip>India-wide support</Chip><Chip>Clear trip details</Chip><Chip>Flexible planning</Chip></div><Button href="/contact">Send an enquiry</Button></div></section></main>;
}
