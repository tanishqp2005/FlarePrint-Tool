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
