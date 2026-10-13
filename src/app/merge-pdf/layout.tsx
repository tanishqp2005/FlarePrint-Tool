import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Online — FlarePrint Tools",
  description:
    "Combine multiple PDF documents into a single PDF in custom sequence. Free, private, and fast document utility processed in your browser.",
  alternates: {
    canonical: "/merge-pdf",
  },
  openGraph: {
    title: "Merge PDF Online — FlarePrint Tools",
    description:
      "Combine multiple PDFs into one unified document with client-side browser processing.",
    url: "https://tools.flareprint.me/merge-pdf",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
