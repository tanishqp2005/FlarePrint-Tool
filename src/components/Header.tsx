"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Detect platform for keyboard shortcut badge (⌘ vs Ctrl)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
    }
  }, []);

  // Listen for scroll to apply elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-border shadow-xs"
            : "bg-white/80 backdrop-blur-xs border-b border-border/50"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Tools Badge */}
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
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">
                FlarePrint
              </span>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200/80">
                Tools
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/#tools"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              All Tools
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy</span>
            </Link>
          </nav>

          {/* Right Action: Search Trigger (⌘K) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/90 text-slate-500 hover:text-slate-800 text-xs font-medium transition-all shadow-2xs group"
              title="Quick tool search"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span>Search tools</span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-2xs">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open tool search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search tools...</span>
              </span>
              <kbd className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>

            <Link
              href="/#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>All Tools</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              About FlarePrint Tools
            </Link>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacy Policy</span>
            </Link>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
