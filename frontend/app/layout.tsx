import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SiteMotion } from "@/components/site-motion";

export const metadata: Metadata = {
  title: "JournAway | Travel India, your way",
  description: "Discover tours, hotel booking support, road trips, vehicle rentals and thoughtful travel planning across India.",
  openGraph: { title: "JournAway | Travel India, your way", description: "Travel India with trusted local support.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader /><SiteMotion />{children}<SiteFooter /></body></html>;
}
