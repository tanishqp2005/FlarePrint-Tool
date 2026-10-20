import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Layers, Printer, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      {/* Brand Hero */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative w-14 h-14 border border-[#D5DCE6] p-2 bg-white rounded-sm shadow-xs">
            <Image
              src="/android-chrome-192x192.png"
              alt="FlarePrint Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
        </div>
        <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#2860E8]">
          [ DIGITAL DOCUMENT PLATFORM ]
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#111111] uppercase tracking-tight leading-[1.05]">
          ABOUT FLAREPRINT <span className="text-[#2860E8]">TOOLS.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#556275] max-w-2xl mx-auto leading-relaxed">
          Fast, transparent, and browser-first digital document utilities designed to handle everyday file tasks right in your local browser sandbox.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-8 shadow-flare space-y-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#2860E8]">
          01 — PURPOSE
        </div>
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#111111]">
          ENGINEERED FOR IMMEDIATE UTILITY
        </h2>
        <p className="text-[#556275] leading-relaxed text-sm">
          Every day, students, professionals, and teams need to quickly compress a PDF for an application portal, resize an image for a form, convert pictures to PDF, or organize documents. Traditional web tools clutter workflows with aggressive ads, upload personal documents to remote cloud servers, or impose unexpected paywalls.
        </p>
        <p className="text-[#556275] leading-relaxed text-sm">
          <strong className="text-[#111111]">FlarePrint Tools</strong> operates on a clear principle: <em className="text-[#111111]">Instant utilities for your documents, processed 100% locally on your machine.</em> By running operations directly in your browser using modern Web APIs, your confidential documents never leave your device.
        </p>
      </div>

      {/* Product Ecosystem & Distinction */}
      <div className="bg-[#F3F6FA] border border-[#D5DCE6] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2860E8] bg-white px-2.5 py-1 rounded-sm border border-[#D5DCE6]">
            ECOSYSTEM ARCHITECTURE
          </span>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#111111]">
            FLAREPRINT TOOLS VS. FLAREPRINT APVM
          </h2>
          <p className="text-xs sm:text-sm text-[#556275] leading-relaxed">
            FlarePrint operates two complementary, yet completely independent products:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-sm border border-[#D5DCE6] shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-[#2860E8] text-xs">
              <Zap className="w-4 h-4 text-[#2860E8]" />
              <span>FlarePrint Tools (Digital)</span>
            </div>
            <p className="text-xs text-[#556275] leading-relaxed">
              Our standalone web platform offering free digital document utilities including PDF compression, image resizing, conversion, merging, and splitting. Operates 100% independently without requiring any physical printing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-sm border border-[#D5DCE6] shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-extrabold uppercase tracking-wider text-[#111111] text-xs">
              <Printer className="w-4 h-4 text-[#556275]" />
              <span>FlarePrint APVM (Physical)</span>
            </div>
            <p className="text-xs text-[#556275] leading-relaxed">
              Our automated physical kiosk infrastructure that allows students and campus communities to quickly print physical documents on-demand at designated campus locations.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#556275]">
          Users can optionally send processed documents to nearby FlarePrint APVM kiosks, but the digital tools will always remain fully standalone and free.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-sm border border-[#D5DCE6] shadow-flare space-y-3">
          <div className="w-9 h-9 rounded-sm bg-[#EBF1FD] text-[#2860E8] flex items-center justify-center border border-[#D5DCE6]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111111]">Browser-First Privacy</h3>
          <p className="text-xs text-[#556275] leading-relaxed">
            Files stay in your browser during processing and are not uploaded to remote servers. Your documents remain strictly private.
          </p>
        </div>

        <div className="bg-white p-6 rounded-sm border border-[#D5DCE6] shadow-flare space-y-3">
          <div className="w-9 h-9 rounded-sm bg-[#EBF1FD] text-[#2860E8] flex items-center justify-center border border-[#D5DCE6]">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111111]">Zero Upload Lag</h3>
          <p className="text-xs text-[#556275] leading-relaxed">
            Zero network upload and download bottlenecks. Processing runs directly via device CPU and WebAssembly for instant results.
          </p>
        </div>

        <div className="bg-white p-6 rounded-sm border border-[#D5DCE6] shadow-flare space-y-3">
          <div className="w-9 h-9 rounded-sm bg-[#EBF1FD] text-[#2860E8] flex items-center justify-center border border-[#D5DCE6]">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111111]">No Account Barrier</h3>
          <p className="text-xs text-[#556275] leading-relaxed">
            No signup forms, passwords, or credit card requirements. Select a tool and process your documents immediately.
          </p>
        </div>
      </div>

      {/* Explore CTA */}
      <div className="text-center pt-4">
        <Link
          href="/#tools"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-sm bg-[#2860E8] hover:bg-[#1E4DC0] text-white text-xs font-extrabold uppercase tracking-wider shadow-button transition-all"
        >
          <span>Explore All 7 Document Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
