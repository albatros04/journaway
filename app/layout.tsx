import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "JournAway | Travel India, your way",
  description: "Discover tour packages, road trips, vehicle rentals and thoughtful travel planning across India.",
  openGraph: { title: "JournAway | Travel India, your way", description: "Travel India with trusted local support.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}<SiteFooter /></body></html>;
}
