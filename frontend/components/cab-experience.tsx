"use client";

import { useState, type FormEvent } from "react";

import { services } from "./site-data";
import { Button } from "./ui";

const roadImage = "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2200&q=88";

type TripDetails = { pickup: string; drop: string; date: string };

function readableDate(date: string) {
  if (!date) return "Travel date to be confirmed";
  const value = new Date(`${date}T00:00:00`);
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(value);
}

export function CabExperience({ initialTrip = { pickup: "", drop: "", date: "" } }: { initialTrip?: TripDetails }) {
  const [trip, setTrip] = useState<TripDetails>(initialTrip);
  const [showReview, setShowReview] = useState(Boolean(initialTrip.pickup && initialTrip.drop));

  function update(field: keyof TripDetails, value: string) {
    setTrip(current => ({ ...current, [field]: value }));
  }

  function swapLocations() {
    setTrip(current => ({ ...current, pickup: current.drop, drop: current.pickup }));
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowReview(true);
    const params = new URLSearchParams();
    params.set("pickup", trip.pickup.trim());
    params.set("drop", trip.drop.trim());
    if (trip.date) params.set("date", trip.date);
    window.history.replaceState(null, "", `/vehicle-rental?${params.toString()}`);
    window.setTimeout(() => document.getElementById("cab-review")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  return <main className="cab-experience">
    <section className="cab-hero" style={{ backgroundImage: `linear-gradient(100deg, rgba(8, 38, 26, .86), rgba(14, 57, 39, .46) 58%, rgba(11, 42, 30, .24)), url('${roadImage}')` }}>
      <div className="container cab-hero-inner">
        <div className="cab-hero-copy">
          <p className="eyebrow light">JournAway cabs</p>
          <h1>Your journey, <em>your way.</em></h1>
          <p>Plan the road between your stay, your destination and the moments in between with JournAway travel services.</p>
        </div>
        <form id="cab-search" className="cab-route-search glass-panel glass-strong" onSubmit={search}>
          <div className="cab-search-heading"><div><p className="eyebrow">Plan your route</p><h2>Where are you headed?</h2></div><p>Enter your route to prepare a cab enquiry.</p></div>
          <div className="cab-route-fields">
            <label>Pickup location<input required name="pickup" value={trip.pickup} onChange={event => update("pickup", event.target.value)} placeholder="Starting point" autoComplete="off" /></label>
            <button className="cab-swap" type="button" onClick={swapLocations} aria-label="Reverse route direction" title="Swap pickup and drop locations"><span aria-hidden="true">⇅</span></button>
            <label>Drop location<input required name="drop" value={trip.drop} onChange={event => update("drop", event.target.value)} placeholder="Destination" autoComplete="off" /></label>
            <label className="cab-date">Travel date<input name="date" type="date" value={trip.date} onChange={event => update("date", event.target.value)} /></label>
            <button className="button button-primary cab-search-submit" type="submit">Search cabs <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </div>
    </section>

    {showReview && <section className="cab-review-section" id="cab-review" aria-live="polite"><div className="container">
      <div className="cab-trip-summary"><div><p className="eyebrow">Your travel request</p><h2>{trip.pickup} <span aria-hidden="true">→</span> {trip.drop}</h2><p>{readableDate(trip.date)}</p></div><button className="edit-search" type="button" onClick={() => document.getElementById("cab-search")?.scrollIntoView({ behavior: "smooth", block: "center" })}>Edit search</button></div>
      <div className="cab-enquiry-next"><div><p className="eyebrow">Next step</p><h3>Let’s shape the right ride around your route.</h3><p>Vehicle choices and fare details are confirmed during the enquiry, because no published cab inventory or live fares are currently available on JournAway.</p></div><Button href="/contact">Continue to enquiry</Button></div>
    </div></section>}

    <section className="cab-service-section"><div className="container"><div className="cab-section-heading"><div><p className="eyebrow">Travel services</p><h2>A road service for every part of the journey.</h2></div><p>Choose the kind of travel support that fits your plans, then share your route with the JournAway team.</p></div><div className="cab-service-grid">{services.filter(service => ["Local Transportation", "Airport Transfers", "Outstation Travel", "Bus & Tempo Services"].includes(service.label)).map((service, index) => <a href={service.href} className="cab-service-card" key={service.href}><span>0{index + 1}</span><h3>{service.label}</h3><p>{service.description}</p><b aria-hidden="true">→</b></a>)}</div></div></section>

    <section className="cab-cross-sell"><div className="container cab-cross-sell-layout"><div><p className="eyebrow">Complete the journey</p><h2>Looking for the full <em>experience?</em></h2><p>Pair your road travel with a thoughtfully planned tour through Ladakh or Kashmir.</p></div><div className="cab-cross-sell-actions"><Button href="/tours">Explore tours</Button><Button href="/destinations/ladakh" variant="secondary">Explore Ladakh</Button></div></div></section>

    <section className="cab-final-cta" style={{ backgroundImage: `linear-gradient(rgba(11, 50, 34, .76), rgba(11, 50, 34, .86)), url('${roadImage}')` }}><div className="container"><div className="cab-final-card glass-panel glass-dark"><p className="eyebrow light">Travel at your pace</p><h2>Ready to hit the road?</h2><p>Start with your pickup, destination and travel date. We’ll help you take it from there.</p><Button href="#cab-search">Search cabs</Button></div></div></section>
  </main>;
}
