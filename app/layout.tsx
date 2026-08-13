import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journaway — Travel, remembered.",
  description: "A quieter way to collect the moments that make a journey yours.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Journaway — Travel, remembered.",
    description: "A quieter way to collect the moments that make a journey yours.",
    images: [{ url: "/og.png", width: 1800, height: 1000, alt: "Journaway — Travel, remembered." }],
  },
  twitter: { card: "summary_large_image", title: "Journaway — Travel, remembered.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
