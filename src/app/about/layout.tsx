import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FlarePrint Tools — Digital Document Utilities",
  description:
    "Learn about FlarePrint Tools, our client-side processing architecture, and our mission to provide fast, free, and private document utilities.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About FlarePrint Tools",
    description:
      "Free tools for your everyday documents. Fast, private, and browser-processed.",
    url: "https://tools.flareprint.me/about",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
