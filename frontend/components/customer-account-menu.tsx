"use client";
import { useEffect, useState } from "react";

type Customer = { displayName: string; profileImageUrl: string | null };
export function CustomerAccountMenu() { const [customer, setCustomer] = useState<Customer | null>(null); useEffect(() => { fetch("/api/auth/session").then(response => response.ok ? response.json() : null).then(data => setCustomer(data?.customer ?? null)).catch(() => setCustomer(null)); }, []); if (!customer) return <a className="login-link" href="/login">Login</a>; return <details className="customer-account-menu"><summary>{customer.profileImageUrl ? <img src={customer.profileImageUrl} alt="" /> : <span>{customer.displayName.slice(0, 1)}</span>}<b>{customer.displayName}</b></summary><div><a href="/account">My account</a><a href="/account/custom-packages">Custom trips</a><button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); }}>Logout</button></div></details>; }
