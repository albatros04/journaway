"use client";

import { useEffect, useState } from "react";

type Enquiry = { id: string; type: "contact" | "cab" | "hotel"; service: string | null; name: string; email: string; phone: string; destination: string | null; pickupLocation: string | null; dropoffLocation: string | null; travelStartDate: string | null; travelEndDate: string | null; guests: number | null; message: string | null; status: "new" | "in_progress" | "closed" };
const statuses = ["new", "in_progress", "closed"] as const;

export function AdminEnquiries() {
  const [items, setItems] = useState<Enquiry[]>([]); const [message, setMessage] = useState("Loading enquiries…");
  const load = () => fetch("/api/admin/enquiries").then(async response => { const data = await response.json() as { enquiries?: Enquiry[]; error?: string }; if (!response.ok) throw new Error(data.error ?? "Unable to load enquiries."); return data; }).then(data => { setItems(data.enquiries ?? []); setMessage(""); }).catch(error => setMessage(error instanceof Error ? error.message : "Unable to load enquiries."));
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: Enquiry["status"]) => { const response = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) }); if (!response.ok) { setMessage("Unable to update enquiry status."); return; } load(); };
  return <div className="admin-content"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Customer requests</p><h2>Enquiries</h2></div><p>Contact, cab, and hotel requests appear here and are also emailed to the configured operations inbox.</p></div>{message && <p className="operations-notice">{message}</p>}{items.length ? <div className="package-list">{items.map(item => <article key={item.id}><div><span>{item.type} · {item.status}</span><strong>{item.name} · {item.email}</strong><p>{item.type === "cab" ? `${item.pickupLocation} to ${item.dropoffLocation}` : item.destination ?? item.service ?? "General enquiry"}{item.travelStartDate ? ` · ${item.travelStartDate}${item.travelEndDate ? ` to ${item.travelEndDate}` : ""}` : ""}{item.guests ? ` · ${item.guests} guests` : ""}</p><p>{item.phone}{item.message ? ` · ${item.message}` : ""}</p></div><div><select aria-label={`Status for ${item.name}'s enquiry`} value={item.status} onChange={event => update(item.id, event.target.value as Enquiry["status"])}>{statuses.map(status => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></div></article>)}</div> : !message && <p className="operations-notice">No enquiries have been submitted.</p>}</section></div>;
}
