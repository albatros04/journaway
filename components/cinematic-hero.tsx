"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui";

const slides = [
  { destination: "Ladakh", place: "High passes, endless horizons", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=88", position: "center" },
  { destination: "Ladakh", place: "Where the mountains meet the sky", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2400&q=88", position: "center" },
  { destination: "Kashmir", place: "A valley made for wandering", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=2400&q=88", position: "center" },
  { destination: "Kashmir", place: "Alpine quiet, all around", image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=2400&q=88", position: "center" },
  { destination: "Kashmir", place: "Morning over the Himalayas", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2400&q=88", position: "center" },
];

export function CinematicHero() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 6500); return () => window.clearInterval(timer); }, []);
  const slide = slides[active];
  const go = (index: number) => setActive((index + slides.length) % slides.length);
  return <section className="cinematic-hero" aria-roledescription="carousel" aria-label="Featured destinations" onKeyDown={event => { if (event.key === "ArrowLeft") go(active - 1); if (event.key === "ArrowRight") go(active + 1); }} tabIndex={0}>
    <div className="hero-slides" aria-hidden="true">{slides.map((item, index) => <img key={item.image} src={item.image} alt="" className={index === active ? "active" : ""} style={{ objectPosition: item.position }} fetchPriority={index === 0 ? "high" : "auto"} />)}</div>
    <div className="hero-gradient" />
    <div className="container cinematic-content"><p className="eyebrow light">JournAway · Find your next adventure</p><h1>Find your next<br /><em>adventure.</em></h1><p>Discover unforgettable journeys through breathtaking landscapes, curated experiences and carefully planned tours.</p><div className="button-row"><Button href="/tours">Explore tours</Button><Button href="/tours" variant="secondary">Discover destinations</Button></div></div>
    <div className="container hero-destination"><div><span>0{active + 1} / 0{slides.length}</span><strong>{slide.destination}</strong><p>{slide.place}</p></div><div className="hero-controls"><button type="button" onClick={() => go(active - 1)} aria-label="Previous destination">←</button>{slides.map((item, index) => <button key={item.image} className={index === active ? "current" : ""} type="button" onClick={() => go(index)} aria-label={`Show ${item.destination} slide ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}<button type="button" onClick={() => go(active + 1)} aria-label="Next destination">→</button></div></div>
  </section>;
}
