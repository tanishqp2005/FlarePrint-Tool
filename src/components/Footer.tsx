import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#172033] text-white border-t border-[#232F47] mt-24">
      {/* Top Banner / Utility Bar */}
      <div className="border-b border-[#232F47]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/android-chrome-192x192.png"
                alt="FlarePrint Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white uppercase font-mono">
              FLAREPRINT <span className="text-[#2860E8]">TOOLS</span>
            </span>
            <span className="hidden sm:inline-block text-[#556275]">•</span>
            <span className="text-xs text-[#94A3B8] hidden sm:inline">
              Client-side document utilities
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-[#94A3B8]">
            <a
              href="https://www.facebook.com/flareprintme/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/flareprint/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>
            <a
              href="https://www.linkedin.com/company/flareprint/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Summary */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              About The Product
            </h3>
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-sm">
              FlarePrint Tools is a focused suite of browser-native document utilities. Compress, resize, convert, merge, and split files locally on your computer or mobile device without uploading to cloud servers.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#60A5FA] bg-[#1E293B] border border-[#232F47] px-3 py-1.5 rounded-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2860E8]" />
              <span>100% Client-Side Processing • No Server Uploads</span>
            </div>
          </div>

          {/* PDF Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              PDF Utilities
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <Link href="/compress-pdf" className="hover:text-white transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/jpg-to-pdf" className="hover:text-white transition-colors">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-jpg" className="hover:text-white transition-colors">
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link href="/merge-pdf" className="hover:text-white transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/split-pdf" className="hover:text-white transition-colors">
                  Split PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Image Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Image Utilities
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <Link href="/compress-jpg" className="hover:text-white transition-colors">
                  Compress JPG
                </Link>
              </li>
              <li>
                <Link href="/resize-jpg" className="hover:text-white transition-colors">
                  Resize JPG
                </Link>
              </li>
              <li>
                <Link href="/#tools" className="hover:text-white transition-colors">
                  All 7 Utilities
                </Link>
              </li>
            </ul>
          </div>

          {/* FlarePrint Network & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              FlarePrint Network
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <a
                  href="https://flareprint.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Main FlarePrint</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://send.flareprint.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>FlarePrint Send</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li className="pt-2">
                <Link href="/about" className="hover:text-white transition-colors">
                  About Tools
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="border-t border-[#232F47] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>
            &copy; {new Date().getFullYear()} FlarePrint Tools. All rights reserved.
          </p>
          <p className="text-center md:text-right max-w-lg leading-relaxed text-[#64748B]">
            FlarePrint Tools operates as an independent digital web utility under the FlarePrint brand. Files processed here are kept locally in your browser memory.
          </p>
        </div>
      </div>
    </footer>
  );
}
