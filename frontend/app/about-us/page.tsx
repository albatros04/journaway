import { Button, DestinationCard } from "@/components/ui";
import { destinations } from "@/components/site-data";
import { PageHero } from "@/components/page-templates";
import { ServiceDirectory, SupportingCta } from "@/components/supporting-sections";

export default function AboutPage() {
  return <main>
    <PageHero eyebrow="About JournAway" title="Travel should feel unforgettable." copy="Tours, destination discovery and road travel planning brought together in one place." image="https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2200&q=85" />
    <section className="section about-intro"><div className="container intro-split"><div><p className="eyebrow">The JournAway approach</p><h2>Start with the journey you want to take.</h2></div><div><p>JournAway brings together tour packages, destination discovery, hotel-request support and cab services so the pieces of a trip can be planned in one considered place.</p><div className="chip-row"><span className="chip">Tours & packages</span><span className="chip">Destination discovery</span><span className="chip">Road travel</span></div><Button href="/contact">Plan a trip</Button></div></div></section>
    <section className="section section-soft about-destinations"><div className="container"><div className="section-title"><div><p className="eyebrow">Explore the landscape</p><h2>Ladakh and Kashmir.</h2></div><Button href="/destinations/ladakh" variant="ghost">Discover destinations</Button></div><div className="destination-grid">{destinations.map(destination => <DestinationCard destination={destination} key={destination.name} />)}</div></div></section>
    <ServiceDirectory title="Everything around the journey, in one place." />
    <SupportingCta title="Your next route starts with a conversation." copy="Tell JournAway what you have in mind, from a complete tour to a road connection." />
  </main>;
}
