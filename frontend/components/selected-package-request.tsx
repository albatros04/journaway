"use client";
import "./trip-document.css";
import { useState, type FormEvent } from "react";
import { EnquiryAccountGate } from "./forms";
export function SelectedPackageRequest({ slug, name, duration }: { slug: string; name: string; duration: string }) {
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage(""); const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/custom-packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourcePackageSlug: slug, travelStartDate: data.get("start"), travelEndDate: data.get("end"), adults: Number(data.get("adults")), children: Number(data.get("children")), accommodationPreference: "recommend", needsCab: data.get("cab") === "on" }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to send request."); setDone(true);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to send request."); } finally { setBusy(false); }
  }
  return <main className="account-page"><section className="container"><p className="eyebrow">Your selected journey</p><h1>{name}</h1><p>{duration} · The team will check availability and finalise your itinerary before confirming.</p>{done ? <div className="operations-notice"><h2>Your request is with JournAway.</h2><p>Once the admin confirms your trip, you will receive a personalised itinerary PDF by email.</p><a href="/account/custom-packages">View my trip requests</a></div> : <EnquiryAccountGate returnTo={`/request-package/${slug}`}>{customer => <form onSubmit={submit} className="trip-document-grid"><label>Name<input readOnly value={customer.displayName} /></label><label>Email<input readOnly value={customer.email} /></label><label>Start date<input required type="date" name="start" /></label><label>End date<input required type="date" name="end" /></label><label>Adults<input required type="number" min="1" max="20" name="adults" defaultValue="2" /></label><label>Children<input required type="number" min="0" max="20" name="children" defaultValue="0" /></label><label><input type="checkbox" name="cab" /> Include cab support</label><button className="button button-primary" disabled={busy}>{busy ? "Submitting…" : "Request this package"}</button>{message && <p role="alert">{message}</p>}</form>}</EnquiryAccountGate>}</section></main>;
}
