"use client";

import { useState, type FormEvent } from "react";

type TravelMode = "tours" | "cabs" | "hotels";

export function JourneySearch() {
  const [mode, setMode] = useState<TravelMode>("tours");
  const [travellers, setTravellers] = useState(1);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (mode === "cabs") {
      const params = new URLSearchParams();
      ["pickup", "drop", "date"].forEach(key => { const value = String(data.get(key) ?? ""); if (value) params.set(key, value); });
      window.location.assign(`/vehicle-rental?${params.toString()}`);
      return;
    }
    window.location.assign(mode === "tours" ? "/tours" : "/hotels");
  }
  return <form className="journey-search glass-panel glass-strong" onSubmit={submit}>
    <div className="search-heading"><div><p className="eyebrow">Start your journey</p><h2>{mode === "tours" ? "Find a remarkable route." : mode === "cabs" ? "Find the right ride." : "Find the right stay."}</h2></div><p>{mode === "tours" ? "Explore curated journeys through Ladakh and Kashmir." : mode === "cabs" ? "Continue to our vehicle rental service to plan your road journey." : "Share your stay details and request a hotel booking with JournAway."}</p></div>
    <div className="search-tabs" role="tablist" aria-label="Travel service"><button type="button" role="tab" aria-selected={mode === "tours"} className={mode === "tours" ? "active" : ""} onClick={() => setMode("tours")}>Tours</button><button type="button" role="tab" aria-selected={mode === "cabs"} className={mode === "cabs" ? "active" : ""} onClick={() => setMode("cabs")}>Cabs</button><button type="button" role="tab" aria-selected={mode === "hotels"} className={mode === "hotels" ? "active" : ""} onClick={() => setMode("hotels")}>Hotels</button></div>
    {mode === "tours" ? <div className="search-fields" role="tabpanel"><label>Destination<input required name="destination" placeholder="Ladakh, Kashmir, or a place in mind" /></label><label>Travel date<input name="date" type="date" /></label><div className="traveller-field" role="group" aria-label="Travellers"><span>Travellers</span><div className="stepper"><button type="button" onClick={() => setTravellers(Math.max(1, travellers - 1))} aria-label="Remove traveller">-</button><span>{travellers} traveller{travellers > 1 ? "s" : ""}</span><button type="button" onClick={() => setTravellers(travellers + 1)} aria-label="Add traveller">+</button></div></div><button className="button button-primary search-submit" type="submit">Find tours <span aria-hidden="true">→</span></button></div> : mode === "cabs" ? <div className="search-fields cab-search-fields" role="tabpanel"><label>Pickup<input required name="pickup" placeholder="Starting point" /></label><label>Drop<input required name="drop" placeholder="Destination" /></label><label>Travel date<input name="date" type="date" /></label><button className="button button-primary search-submit" type="submit">Book a cab <span aria-hidden="true">→</span></button></div> : <div className="search-fields hotel-search-fields" role="tabpanel"><label>Destination<input required name="destination" placeholder="Where are you staying?" /></label><label>Check-in<input required name="check-in" type="date" /></label><label>Check-out<input required name="check-out" type="date" /></label><button className="button button-primary search-submit" type="submit">Find hotels <span aria-hidden="true">→</span></button></div>}
  </form>;
}

export function CabSearch() {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const params = new URLSearchParams(); ["pickup", "drop", "date"].forEach(key => { const value = String(data.get(key) ?? ""); if (value) params.set(key, value); }); window.location.assign(`/vehicle-rental?${params.toString()}`); }
  return <form className="cab-search glass-panel glass-strong" onSubmit={submit}><p className="eyebrow">Vehicle rental</p><h2>Set the road in motion.</h2><p>Plan local transportation, airport transfers, outstation travel, or group movement with JournAway.</p><div className="cab-search-fields"><label>Pickup<input required name="pickup" placeholder="Starting point" /></label><label>Drop<input required name="drop" placeholder="Destination" /></label><label>Date<input name="date" type="date" /></label></div><button className="button button-primary" type="submit">Explore cabs <span aria-hidden="true">→</span></button></form>;
}

export function HotelRequestForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return <form className="hotel-request" onSubmit={submit}><div className="form-grid"><label>Destination<input required placeholder="Ladakh, Kashmir, or a place in mind" /></label><label>Guests<input required inputMode="numeric" placeholder="Number of guests" /></label><label>Check-in<input required type="date" /></label><label>Check-out<input required type="date" /></label><label className="form-full">Stay preferences<textarea placeholder="Room type, budget, or anything else that matters" rows={4} /></label></div><button className="button button-primary" type="submit">Request hotel options <span aria-hidden="true">→</span></button>{sent && <p className="form-notice" role="status">Thanks—your hotel request is ready for the JournAway team to review.</p>}</form>;
}

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <form className="enquiry-form" onSubmit={submit}><div className="form-grid"><label>Your name<input required autoComplete="name" placeholder="Your Name *" /></label><label>Phone number<input required type="tel" autoComplete="tel" inputMode="tel" placeholder="Phone Number *" /></label><label>Email address<input type="email" autoComplete="email" placeholder="Email Address" /></label><label>Trip interest<select defaultValue=""><option value="" disabled>Select a service</option><option>Tour package</option><option>Vehicle rental</option><option>Custom trip planning</option></select></label><label className="form-full">Tell us about your journey<textarea required placeholder="Write your message *" rows={5} /></label></div><button className="button button-primary" type="submit">Submit enquiry <span aria-hidden="true">→</span></button>{sent && <p className="form-notice" role="status">Thank you. Your enquiry has been recorded for the JournAway team.</p>}</form>;
}
