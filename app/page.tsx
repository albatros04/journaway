import { JourneySearch } from "@/components/forms";
import { DestinationCard, TourCard, Button } from "@/components/ui";
import { destinations, services, showcaseTours } from "@/components/site-data";
import { CinematicHero } from "@/components/cinematic-hero";

export default function Home() {
  return <main>
    <CinematicHero />
    <div className="container search-overlap"><JourneySearch /></div>
    <section className="section container intro-split"><div><p className="eyebrow">Your travel partner</p><h2>Every mile, made <em>easy.</em></h2></div><div><p>JournAway brings tours, road travel and accommodation planning into one clear process—so the journey can feel personal from the first idea to the final return.</p><Button href="/about-us" variant="ghost">Meet JournAway</Button></div></section>
    <section className="section section-soft"><div className="container"><div className="section-title"><div><p className="eyebrow">Curated routes</p><h2>Journeys worth taking.</h2></div><Button href="/tour-packages" variant="ghost">View all packages</Button></div><div className="tour-grid">{showcaseTours.map(tour => <TourCard tour={tour} key={tour.name} />)}</div></div></section>
    <section className="section container"><div className="section-title"><div><p className="eyebrow">Across India</p><h2>Find your next <em>escape.</em></h2></div><Button href="/tours" variant="ghost">Explore destinations</Button></div><div className="destination-grid">{destinations.map(destination => <DestinationCard destination={destination} key={destination.name} />)}</div></section>
    <section className="section container services-foundation"><p className="eyebrow">Plan it your way</p><h2>More ways to move.</h2><div>{services.slice(0,4).map((service,index) => <a href={service.href} key={service.href}><span>0{index + 1}</span><h3>{service.label}</h3><p>{service.description}</p><b>→</b></a>)}</div></section>
    <section className="cta-panel"><div className="container"><p className="eyebrow light">Clear booking. Local expertise.</p><h2>Let’s plan a journey<br />you’ll want to take twice.</h2><Button href="/contact">Plan your trip</Button></div></section>
  </main>;
}
