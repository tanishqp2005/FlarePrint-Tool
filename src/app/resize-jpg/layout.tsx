import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize JPG Online — FlarePrint Tools",
  description:
    "Resize images to custom width and height dimensions with aspect ratio lock and quick scaling presets. Free and processed in your browser.",
  alternates: {
    canonical: "/resize-jpg",
  },
  openGraph: {
    title: "Resize JPG Online — FlarePrint Tools",
    description:
      "Resize JPG images to precise dimensions with aspect ratio preservation right in your browser.",
    url: "https://tools.flareprint.me/resize-jpg",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
