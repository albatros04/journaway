"use client";

import { useEffect } from "react";

const heroSelectors = ".cinematic-hero, .page-hero, .package-hero, .destination-hero, .cab-hero, .discovery-hero";

export function SiteMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.06 });

    const scan = () => {
      document.querySelectorAll("main > section, main > article").forEach(element => {
        if (element.matches(heroSelectors) || observed.has(element)) return;
        observed.add(element);
        element.setAttribute("data-reveal", "");
        observer.observe(element);
      });
    };

    document.documentElement.classList.add("motion-enabled");
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); document.documentElement.classList.remove("motion-enabled"); };
  }, []);

  return null;
}
