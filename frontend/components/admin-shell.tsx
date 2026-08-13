"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminUser = { displayName: string; email: string };
type AdminShellProps = { user: AdminUser; title: string; eyebrow: string; children: ReactNode };

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/packages", label: "Manage packages" },
  { href: "/admin/custom-packages", label: "Custom packages" },
  { href: "/admin/tours", label: "Tours & packages" },
  { href: "/admin/destinations", label: "Destinations" },
];

export function AdminShell({ user, title, eyebrow, children }: AdminShellProps) {
  const pathname = usePathname();
  return <main className="admin-shell"><aside className="admin-sidebar"><a href="/admin" className="admin-brand" aria-label="JournAway admin home"><span>J</span><strong>JournAway</strong><small>Operations</small></a><nav aria-label="Admin navigation">{navigation.map(item => <a href={item.href} className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined} key={item.href}><span aria-hidden="true">{item.href === "/admin" ? "◼" : item.href.includes("tours") ? "◫" : "◇"}</span>{item.label}</a>)}</nav><p className="admin-sidebar-note">Operational resources appear here only after their backend data model is available.</p></aside><section className="admin-main"><header className="admin-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><details className="admin-account"><summary><span aria-hidden="true">●</span><span>{user.displayName}</span></summary><div><strong>{user.email}</strong><a href="/">View public site</a></div></details></header>{children}</section></main>;
}

export function AdminEmptyState({ title, copy }: { title: string; copy: string }) { return <section className="admin-empty"><p className="eyebrow">No operational records</p><h2>{title}</h2><p>{copy}</p></section>; }
