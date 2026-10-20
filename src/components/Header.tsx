"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight, ShieldCheck, ArrowRight } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#D5DCE6] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src="/android-chrome-192x192.png"
                alt="FlarePrint Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#111111] uppercase font-mono">
                FLAREPRINT
              </span>
              <span className="bg-[#2860E8] text-white text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm">
                TOOLS
              </span>
            </div>
          </Link>

          {/* Sibling Products / Navigation for FlarePrint Master Ecosystem */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold tracking-wider uppercase border-l border-[#D5DCE6] pl-6 text-[#556275]">
            <a
              href="https://flareprint.me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2860E8] transition-colors flex items-center gap-1"
            >
              <span>Main Site</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
            <span className="text-[#D5DCE6]">•</span>
            <a
              href="https://send.flareprint.me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2860E8] transition-colors flex items-center gap-1"
            >
              <span>FlarePrint Send</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wider uppercase text-[#111111]">
          <Link
            href="/#tools"
            className="hover:text-[#2860E8] transition-colors py-1"
          >
            All Tools
          </Link>
          <Link
            href="/#workflow"
            className="hover:text-[#2860E8] transition-colors py-1 text-[#556275]"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            className="hover:text-[#2860E8] transition-colors py-1 text-[#556275]"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="hover:text-[#2860E8] transition-colors py-1 text-[#556275] flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2860E8]" />
            <span>Privacy</span>
          </Link>
        </nav>

        {/* Action Button - Master Rectangular CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2860E8] hover:bg-[#1d4ed8] text-white text-xs font-bold tracking-wider uppercase rounded-sm shadow-button transition-all"
          >
            <span>EXPLORE TOOLS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-[#D5DCE6] rounded-sm text-[#111111] hover:bg-[#F3F6FA] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D5DCE6] bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1 text-xs font-bold uppercase tracking-wider">
            <Link
              href="/#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-[#111111] hover:bg-[#F3F6FA] rounded-sm"
            >
              All Tools
            </Link>
            <Link
              href="/#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-[#556275] hover:bg-[#F3F6FA] rounded-sm"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-[#556275] hover:bg-[#F3F6FA] rounded-sm"
            >
              About FlarePrint Tools
            </Link>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-[#556275] hover:bg-[#F3F6FA] rounded-sm"
            >
              <ShieldCheck className="w-4 h-4 text-[#2860E8]" />
              <span>Privacy Policy</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#D5DCE6] space-y-2">
            <div className="flex items-center justify-between px-3 text-[11px] font-semibold text-[#556275] uppercase tracking-wider">
              <span>FlarePrint Network</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a
                href="https://flareprint.me"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#F3F6FA] text-[#111111] border border-[#D5DCE6] rounded-sm flex items-center justify-between"
              >
                <span>Main Site</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#556275]" />
              </a>
              <a
                href="https://send.flareprint.me"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#F3F6FA] text-[#111111] border border-[#D5DCE6] rounded-sm flex items-center justify-between"
              >
                <span>Send</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#556275]" />
              </a>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#2860E8] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-button"
            >
              <span>EXPLORE ALL TOOLS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
