import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online — FlarePrint Tools",
  description:
    "Split PDF pages into standalone documents or extract custom page ranges. Fast, private, and client-side processed in your browser.",
  alternates: {
    canonical: "/split-pdf",
  },
  openGraph: {
    title: "Split PDF Online — FlarePrint Tools",
    description:
      "Separate PDF pages or extract custom page ranges right in your browser.",
    url: "https://tools.flareprint.me/split-pdf",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
