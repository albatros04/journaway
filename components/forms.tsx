"use client";

import { useState, type FormEvent } from "react";

export function JourneySearch() {
  const [travellers, setTravellers] = useState(1);
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); setNotice("Your journey request is ready. Our trip experts will help you refine it."); }
  return <form className="journey-search" onSubmit={submit}><div className="search-tabs" aria-label="Travel service"><button type="button" className="active">Holidays</button><button type="button">Cabs</button><button type="button">Hotels</button></div><div className="search-fields"><label>Destination<input required placeholder="Where do you want to go?" /></label><label>Departure<input type="date" /></label><label>Return<input type="date" /></label><label>Travellers<div className="stepper"><button type="button" onClick={() => setTravellers(Math.max(1, travellers - 1))} aria-label="Remove traveller">−</button><span>{travellers} traveller{travellers > 1 ? "s" : ""}</span><button type="button" onClick={() => setTravellers(travellers + 1)} aria-label="Add traveller">+</button></div></label><button className="button button-primary search-submit" type="submit">Search journeys <span>→</span></button></div>{notice && <p className="form-notice" role="status">{notice}</p>}</form>;
}

export function EnquiryForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <form className="enquiry-form" onSubmit={submit}><div className="form-grid"><label>Your name<input required placeholder="Your Name *" /></label><label>Phone number<input required inputMode="tel" placeholder="Phone Number *" /></label><label>Email address<input type="email" placeholder="Email Address" /></label><label>Trip interest<select defaultValue=""><option value="" disabled>Select a service</option><option>Tour package</option><option>Vehicle rental</option><option>Custom trip planning</option></select></label><label className="form-full">Tell us about your journey<textarea required placeholder="Write your message *" rows={5} /></label></div><button className="button button-primary" type="submit">Submit enquiry <span>→</span></button>{sent && <p className="form-notice" role="status">Thank you. Your enquiry has been recorded for the JournAway team.</p>}</form>;
}
