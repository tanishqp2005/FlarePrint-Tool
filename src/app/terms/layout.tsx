import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — FlarePrint Tools",
  description:
    "Terms of Service for using FlarePrint Tools online document utilities.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service — FlarePrint Tools",
    description: "Terms of Service for FlarePrint Tools digital platform.",
    url: "https://tools.flareprint.me/terms",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
