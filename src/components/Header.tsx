"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, ShieldCheck, Layers } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-border/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/android-chrome-192x192.png"
              alt="FlarePrint Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xl tracking-tight text-slate-900">
              FlarePrint
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
              Tools
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#tools"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            Tools
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Privacy
          </Link>
        </nav>

        {/* Action Button - Strictly 'All Tools', NO upload button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/#tools"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-button hover:shadow-button-hover transition-all"
          >
            <Layers className="w-4 h-4" />
            All Tools
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            href="/#tools"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            All Tools
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            About FlarePrint Tools
          </Link>
          <Link
            href="/privacy"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Privacy Policy
          </Link>
          <div className="pt-2">
            <Link
              href="/#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-button"
            >
              Explore All Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
