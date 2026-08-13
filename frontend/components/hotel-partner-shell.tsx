"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type HotelPartnerUser = { displayName: string; email: string };

const navigation = [
  { href: "/hotel", label: "Stays" },
  { href: "/hotel/profile", label: "Property" },
];

export function HotelPartnerShell({ user, children }: { user: HotelPartnerUser; children: ReactNode }) {
  const pathname = usePathname();

  return <main className="hotel-portal-shell">
    <header className="hotel-portal-header">
      <a href="/hotel" className="hotel-portal-brand" aria-label="JournAway Partner dashboard">
        <span>J</span><strong>JournAway</strong><small>Partner</small>
      </a>
      <details className="hotel-portal-account">
        <summary aria-label="Hotel partner account"><span aria-hidden="true">●</span> <span>{user.displayName}</span></summary>
        <div><strong>{user.email}</strong><a href="/">Public site</a></div>
      </details>
    </header>
    <section className="hotel-portal-main">{children}</section>
    <nav className="hotel-portal-nav" aria-label="Hotel partner navigation">
      {navigation.map(item => <a href={item.href} className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined} key={item.href}>
        <span aria-hidden="true">{item.href === "/hotel" ? "◈" : "◇"}</span>{item.label}
      </a>)}
    </nav>
  </main>;
}

export function HotelPartnerEmptyState({ title, copy }: { title: string; copy: string }) {
  return <section className="hotel-portal-empty"><p className="eyebrow">No connected records</p><h2>{title}</h2><p>{copy}</p></section>;
}
