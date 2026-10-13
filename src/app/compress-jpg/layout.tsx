import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress JPG Online — FlarePrint Tools",
  description:
    "Compress JPG and PNG images to target KB or MB with smart quality retention. Private browser-based optimization without server uploads.",
  alternates: {
    canonical: "/compress-jpg",
  },
  openGraph: {
    title: "Compress JPG Online — FlarePrint Tools",
    description:
      "Compress JPG images to your desired target file size privately in your browser.",
    url: "https://tools.flareprint.me/compress-jpg",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
