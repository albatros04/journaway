"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type DriverUser = { displayName: string; email: string };
const navigation = [{ href: "/driver", label: "My trips" }, { href: "/driver/profile", label: "Profile" }];

export function DriverShell({ user, children }: { user: DriverUser; children: ReactNode }) {
  const pathname = usePathname();
  return <main className="driver-shell"><header className="driver-header"><a href="/driver" className="driver-brand"><span>J</span><strong>JournAway</strong><small>Driver</small></a><details><summary aria-label="Driver account">● <span>{user.displayName}</span></summary><div><strong>{user.email}</strong><a href="/">Public site</a></div></details></header><section className="driver-main">{children}</section><nav className="driver-nav" aria-label="Driver navigation">{navigation.map(item => <a href={item.href} className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined} key={item.href}><span aria-hidden="true">{item.href === "/driver" ? "◼" : "◇"}</span>{item.label}</a>)}</nav></main>;
}

export function DriverEmptyState({ title, copy }: { title: string; copy: string }) { return <section className="driver-empty"><p className="eyebrow">No trip records</p><h2>{title}</h2><p>{copy}</p></section>; }
