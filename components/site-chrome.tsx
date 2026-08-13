"use client";

import { useState } from "react";
import { primaryNav, services } from "./site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container nav-wrap"><a href="/" className="brand" aria-label="JournAway home">JOURNAWAY<span>·</span></a><nav className="desktop-nav" aria-label="Main navigation">{primaryNav.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}<details className="services-menu"><summary>Our Services <span>⌄</span></summary><div>{services.slice(0, 4).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</div></details></nav><div className="nav-actions"><a className="login-link" href="/login">Login</a><a className="nav-plan" href="/contact">Plan a trip <span>→</span></a><button aria-label="Toggle navigation" className="menu-toggle" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /></button></div></div>{open && <nav className="mobile-nav" aria-label="Mobile navigation">{primaryNav.map(item => <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}<p>Services</p>{services.map(item => <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}<a className="button button-primary" href="/contact" onClick={() => setOpen(false)}>Plan a trip <span>→</span></a></nav>}</header>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="container footer-grid"><div><a className="brand" href="/">JOURNAWAY<span>·</span></a><p>India, thoughtfully planned. Trusted stays, comfortable rides and journeys shaped around you.</p><a className="footer-cta" href="/contact">Plan your journey <span>→</span></a></div><div><h2>Explore</h2>{primaryNav.slice(1).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div><h2>Services</h2>{services.slice(0, 4).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div><h2>Contact & location</h2><p>journaway.in<br />Ambala, Haryana, India</p><a href="/contact">Send an enquiry <span>→</span></a></div></div><div className="container footer-base"><span>© 2026 JournAway. All Rights Reserved.</span><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div></footer>;
}
