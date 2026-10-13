import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to JPG Converter — FlarePrint Tools",
  description:
    "Convert PDF pages into high-resolution 150 or 300 DPI JPG images. Download single images or bulk ZIP archive privately in your browser.",
  alternates: {
    canonical: "/pdf-to-jpg",
  },
  openGraph: {
    title: "PDF to JPG Converter — FlarePrint Tools",
    description:
      "Extract PDF pages to crisp JPG images directly in your browser without uploading to external servers.",
    url: "https://tools.flareprint.me/pdf-to-jpg",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
