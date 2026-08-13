"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui";

const slides = [
  { destination: "Ladakh", place: "High passes, endless horizons", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=88" },
  { destination: "Pangong Lake", place: "Where the mountains meet the sky", image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Pangong_Lake%2C_Ladakh%2C_India_02.jpg" },
  { destination: "Pahalgam", place: "A Kashmir valley made for wandering", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2400&q=88" },
  { destination: "Gulmarg", place: "Alpine quiet, all around", image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=2400&q=88" },
  { destination: "Kashmir", place: "Morning over the Himalayas", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2400&q=88" }
];

export function CinematicHero() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const go = useCallback((index: number) => {
    const next = (index + slides.length) % slides.length;
    if (next === active) return;
    setPrevious(active);
    setActive(next);
  }, [active]);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    const stop = () => { if (timer) window.clearInterval(timer); timer = undefined; };
    const start = () => { stop(); if (!reducedMotion.matches && !document.hidden) timer = window.setInterval(() => go(active + 1), 6500); };
    const onVisibility = () => start();
    start();
    reducedMotion.addEventListener("change", start);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); reducedMotion.removeEventListener("change", start); document.removeEventListener("visibilitychange", onVisibility); };
  }, [active, go]);
  const slide = slides[active];
  const renderedSlides = previous === null ? [active] : [previous, active];
  return <section className="cinematic-hero" aria-roledescription="carousel" aria-label="Featured Ladakh and Kashmir destinations">
    <div className="hero-slides" aria-hidden="true">{renderedSlides.map(index => { const item = slides[index]; return <img key={`${item.destination}-${index}`} src={item.image} alt="" className={index === active ? "active" : ""} fetchPriority={index === 0 ? "high" : "auto"} loading="eager" decoding="async" sizes="100vw" />; })}</div><div className="hero-gradient" />
    <div className="container cinematic-content"><p className="eyebrow light">JournAway · Find your next adventure</p><h1>Find your next<br /><em>adventure.</em></h1><p>Discover Ladakh and Kashmir through scenic journeys, curated tours, and travel that moves at your pace.</p><div className="button-row"><Button href="/tours">Explore tours</Button><Button href="/vehicle-rental" variant="secondary">Book a cab</Button></div></div>
    <div className="container hero-destination"><div><span>0{active + 1} / 0{slides.length}</span><strong>{slide.destination}</strong><p>{slide.place}</p></div><div className="hero-controls"><button type="button" onClick={() => go(active - 1)} aria-label="Previous destination">←</button>{slides.map((item, index) => <button key={`${item.destination}-control-${index}`} className={index === active ? "current" : ""} type="button" onClick={() => go(index)} aria-label={`Show ${item.destination} slide ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}<button type="button" onClick={() => go(active + 1)} aria-label="Next destination">→</button></div></div>
  </section>;
}
