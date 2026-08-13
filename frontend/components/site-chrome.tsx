"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomerAccountMenu } from "./customer-account-menu";
import { primaryNav, services } from "./site-data";

const logo = "/journaway-logo-transparent.png";
const isPortal = (pathname: string) => pathname.startsWith("/admin") || pathname.startsWith("/driver") || pathname.startsWith("/hotel");

export function SiteHeader() {
  const [open, setOpen] = useState(false); const pathname = usePathname(); const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 28); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  if (isPortal(pathname)) return null;
  const transparent = pathname === "/" && !scrolled; const linkClass = (href: string) => pathname === href ? "active" : "";
  return <header className={`site-header ${transparent ? "hero-header" : ""}`}><div className="container nav-wrap"><a href="/" className="brand brand-logo" aria-label="JournAway home"><img src={logo} alt="JournAway" width="1260" height="790" /></a><nav className="desktop-nav" aria-label="Main navigation">{primaryNav.map(item => <a href={item.href} className={linkClass(item.href)} aria-current={pathname === item.href ? "page" : undefined} key={item.href}>{item.label}</a>)}<details className="services-menu"><summary>Our Services <span>⌄</span></summary><div>{services.slice(0, 4).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</div></details></nav><div className="nav-actions"><CustomerAccountMenu /><a className="nav-plan" href="/custom-package">Build a trip <span>→</span></a><button aria-label="Toggle navigation" className="menu-toggle" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /></button></div></div>{open && <nav className="mobile-nav" aria-label="Mobile navigation">{primaryNav.map(item => <a href={item.href} className={linkClass(item.href)} aria-current={pathname === item.href ? "page" : undefined} key={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}<p>Services</p>{services.map(item => <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}<a className="button button-primary" href="/custom-package" onClick={() => setOpen(false)}>Build a trip <span>→</span></a></nav>}</header>;
}

export function SiteFooter() {
  const pathname = usePathname(); if (isPortal(pathname)) return null;
  return <footer className="site-footer"><div className="container footer-grid"><div><a className="brand brand-logo" href="/"><img src={logo} alt="JournAway" width="1260" height="790" /></a><p>India, thoughtfully planned. Trusted stays, comfortable rides and journeys shaped around you.</p><a className="footer-cta" href="/custom-package">Build your journey <span>→</span></a></div><div><h2>Explore</h2>{primaryNav.slice(1).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div><h2>Services</h2>{services.slice(0, 4).map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div><h2>Contact & location</h2><p>journaway.in<br />Ambala, Haryana, India</p><a href="/contact">Send an enquiry <span>→</span></a></div></div><div className="container footer-base"><span>© 2026 JournAway. All Rights Reserved.</span><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div></footer>;
}
