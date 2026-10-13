import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online — FlarePrint Tools",
  description:
    "Compress PDF documents to your desired target size in KB or MB. Free, fast, and processed privately right in your browser.",
  alternates: {
    canonical: "/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online — FlarePrint Tools",
    description:
      "Compress PDF documents to your desired target size in KB or MB with client-side browser processing.",
    url: "https://tools.flareprint.me/compress-pdf",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
