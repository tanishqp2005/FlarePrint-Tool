import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter — FlarePrint Tools",
  description:
    "Convert single or multiple JPG and PNG images into a clean PDF document. Reorder pages and customize orientation privately in your browser.",
  alternates: {
    canonical: "/jpg-to-pdf",
  },
  openGraph: {
    title: "JPG to PDF Converter — FlarePrint Tools",
    description:
      "Combine images into a unified PDF document with client-side browser processing.",
    url: "https://tools.flareprint.me/jpg-to-pdf",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
