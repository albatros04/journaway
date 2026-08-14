"use client";

import { useEffect, useState } from "react";
import { CabSearch } from "./forms";
import { destinations, services, categoryLabels } from "./site-data";
import { Button, DestinationCard, GlassPanel, TourCard } from "./ui";

const roadImage = "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1800&q=88";
const kashmirImage = "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1800&q=88";

type ManagedTour = { slug: string; destination: string; name: string; duration: string; image: string; priceInr: number };
export function PopularTours() { const [tours, setTours] = useState<ManagedTour[]>([]); useEffect(() => { fetch("/api/packages?catalogType=tour").then(response => response.ok ? response.json() as Promise<{ packages: ManagedTour[] }> : { packages: [] }).then(data => setTours(data.packages.slice(0, 3))).catch(() => setTours([])); }, []); return <section className="home-section popular-tours"><div className="container"><div className="section-title"><div><p className="eyebrow">Popular tours</p><h2>Trips worth taking.</h2></div><Button href="/tours" variant="ghost">View all tours</Button></div>{tours.length ? <div className="tour-grid">{tours.map(tour => <TourCard tour={tour} key={tour.slug} />)}</div> : <p className="operations-notice">Explore our current Ladakh and Kashmir journeys.</p>}</div></section>; }

export function DestinationShowcase() { return <section className="home-section destination-showcase"><div className="container"><div className="section-title"><div><p className="eyebrow">Explore destinations</p><h2>Landscapes that stay <em>with you.</em></h2></div><Button href="/tours" variant="ghost">See all tours</Button></div><div className="destination-mosaic">{destinations.map((destination, index) => <div className={index === 0 ? "destination-feature" : ""} key={destination.name}><DestinationCard destination={destination} /></div>)}</div></div></section>; }

export function TravelExperiences() { return <section className="home-section experiences-section"><div className="container experiences-wrap"><div><p className="eyebrow">Find your pace</p><h2>Travel made for the way you want to feel.</h2></div><div className="experience-grid">{categoryLabels.map((label, index) => <a href="/tours" key={label}><span>0{index + 1}</span><h3>{label}</h3><b aria-hidden="true">→</b></a>)}</div></div></section>; }

export function CabServiceSection() { return <section className="home-section cab-section"><div className="cab-image" style={{ backgroundImage: `linear-gradient(105deg, rgba(10,43,30,.5), rgba(10,43,30,.12)), url('${roadImage}')` }} /><div className="container cab-layout"><div className="cab-copy"><p className="eyebrow light">Travel your way</p><h2>Need a ride for the journey?</h2><p>From local movement and airport transfers to outstation and group travel, JournAway can help make every connection simpler.</p><a className="text-link" href="/vehicle-rental">Explore vehicle rental <span aria-hidden="true">→</span></a></div><CabSearch /></div></section>; }

export function FeaturedJourney() { return <section className="home-section featured-journey"><div className="container featured-layout"><div className="featured-image"><img src={kashmirImage} alt="Kashmir valley landscape" loading="lazy" /></div><GlassPanel variant="dark" className="featured-content"><p className="eyebrow light">Featured journey</p><h2>Kashmir, at an unhurried pace.</h2><p>Let the valley set the rhythm—from quiet lake mornings to alpine meadows and mountain roads.</p><div className="feature-chips"><span>Kashmir</span><span>5D / 4N</span></div><Button href="/contact">Plan this journey</Button></GlassPanel></div></section>; }

export function WhyJournAway() { return <section className="home-section why-section"><div className="container"><div className="section-title"><div><p className="eyebrow">Why JournAway</p><h2>Good travel starts with thoughtful details.</h2></div></div><div className="why-grid">{services.slice(0, 4).map((service, index) => <a href={service.href} key={service.href}><span>0{index + 1}</span><h3>{service.label}</h3><p>{service.description}</p><b aria-hidden="true">→</b></a>)}</div></div></section>; }

export function FinalCta() { return <section className="final-cta" style={{ backgroundImage: `linear-gradient(rgba(9,43,29,.7), rgba(9,43,29,.76)), url('${kashmirImage}')` }}><div className="container"><div className="final-cta-card"><p className="eyebrow light">JournAway</p><h2>Ready for your next adventure?</h2><p>Find a journey that feels entirely your own.</p><div className="button-row"><Button href="/tours">Explore tours</Button><Button href="/contact" variant="secondary">Plan your trip</Button></div></div></div></section>; }
