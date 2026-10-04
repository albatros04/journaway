"use client";
import { useCallback, useEffect, useState } from "react";
type Item = { customPackage: { id: string; name: string; travelStartDate: string; travelEndDate: string; adults: number; children: number; status: string; sourcePackageSlug: string | null }; customer: { displayName: string; email: string } };
export function AdminCustomPackages() {
  const [items, setItems] = useState<Item[]>([]); const [message, setMessage] = useState("Loading trip requests…");
  const load = useCallback(() => fetch("/api/admin/custom-packages").then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); setItems(data.packages ?? []); setMessage(""); }).catch(e => setMessage(e.message || "Unable to load trips.")), []);
  useEffect(() => { void load(); }, [load]);
  async function update(item: Item, status: string) {
    const r = await fetch(`/api/admin/custom-packages/${item.customPackage.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!r.ok) { const data = await r.json(); setMessage(data.error || "Unable to update status."); return; } void load();
  }
  return <div className="admin-content"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Customer requests</p><h2>Trip requests & PDFs</h2></div><p>Prepare the itinerary, preview the PDF, then confirm and email it to the customer.</p></div>{message && <p role="status">{message}</p>}<div className="package-list">{items.map(item => <article key={item.customPackage.id}><div><span>{item.customer.displayName} · {item.customer.email}</span><strong>{item.customPackage.name}</strong><p>{item.customPackage.sourcePackageSlug ? "Selected package" : "Custom trip"} · {item.customPackage.travelStartDate} to {item.customPackage.travelEndDate} · {item.customPackage.adults} adults, {item.customPackage.children} children</p><a className="button button-secondary" href={`/admin/custom-packages/${item.customPackage.id}`}>Edit itinerary / PDF</a></div><div><select aria-label={`Status for ${item.customPackage.name}`} value={item.customPackage.status} onChange={e => void update(item, e.target.value)}>{[...new Set([item.customPackage.status, ...(item.customPackage.status === "confirmed" ? ["cancelled"] : ["submitted", "under_review", "quoted", "cancelled"])])].map(status => <option value={status} key={status}>{status.replace("_", " ")}</option>)}</select></div></article>)}</div>{!items.length && !message && <p>No trip requests yet.</p>}</section></div>;
}
