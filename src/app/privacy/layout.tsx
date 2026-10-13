import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FlarePrint Tools",
  description:
    "Learn how FlarePrint Tools protects your confidentiality with client-side-first processing where files stay on your machine.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — FlarePrint Tools",
    description:
      "Files stay in your browser during processing and are not uploaded to our servers.",
    url: "https://tools.flareprint.me/privacy",
    siteName: "FlarePrint Tools",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
