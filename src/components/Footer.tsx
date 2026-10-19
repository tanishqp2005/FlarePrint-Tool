import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-border mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 flex-shrink-0">
                <Image
                  src="/android-chrome-192x192.png"
                  alt="FlarePrint Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                FlarePrint <span className="text-blue-600 font-semibold">Tools</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed">
              Simple tools for everyday documents. Fast, free, and privacy-focused document utilities right in your browser.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Local browser processing</span>
            </div>

            {/* Connect With Us */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-2.5">
                Follow Us
              </h4>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/flareprint/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow FlarePrint on Instagram"
                  title="FlarePrint on Instagram"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/flareprintme/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow FlarePrint on Facebook"
                  title="FlarePrint on Facebook"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/flareprint/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow FlarePrint on LinkedIn"
                  title="FlarePrint on LinkedIn"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Compress & Resize */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Compress & Resize
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/compress-pdf" className="hover:text-blue-600 transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/compress-jpg" className="hover:text-blue-600 transition-colors">
                  Compress JPG
                </Link>
              </li>
              <li>
                <Link href="/resize-jpg" className="hover:text-blue-600 transition-colors">
                  Resize JPG
                </Link>
              </li>
            </ul>
          </div>

          {/* Convert & Organize */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Convert & Organize
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/jpg-to-pdf" className="hover:text-blue-600 transition-colors">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-jpg" className="hover:text-blue-600 transition-colors">
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link href="/merge-pdf" className="hover:text-blue-600 transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/split-pdf" className="hover:text-blue-600 transition-colors">
                  Split PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/#tools" className="hover:text-blue-600 transition-colors">
                  All Tools
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About FlarePrint Tools
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Product Separation Notice & Copyright */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} FlarePrint Tools. All rights reserved.
          </p>
          <p className="text-center md:text-right max-w-lg leading-relaxed text-slate-400">
            FlarePrint Tools is a separate digital utility platform under the FlarePrint brand, operating independently from physical FlarePrint APVM printing kiosks.
          </p>
        </div>
      </div>
    </footer>
  );
}
