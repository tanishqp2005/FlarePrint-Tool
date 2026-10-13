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
          <div className="relative w-14 h-14">
            <Image
              src="/android-chrome-192x192.png"
              alt="FlarePrint Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About FlarePrint Tools
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Simple, fast, and privacy-first digital document utilities designed to handle everyday file tasks right in your browser.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Our Purpose
        </h2>
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
          Every day, students, professionals, and individuals need to quickly compress a PDF for an application portal, resize an image for a form, convert pictures to PDF, or organize documents. Most existing online tools are cluttered with aggressive ads, upload your personal files to foreign cloud servers, or impose strict paywalls.
        </p>
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
          <strong>FlarePrint Tools</strong> was built with a simple premise: <em>Free tools for your documents, processed locally on your machine.</em> By running operations directly in your browser using modern Web APIs, your confidential documents never leave your device.
        </p>
      </div>

      {/* Product Ecosystem & Distinction */}
      <div className="bg-blue-50/50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full border border-blue-200">
            Ecosystem Architecture
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            FlarePrint Tools vs. FlarePrint APVM
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            FlarePrint operates two complementary, yet completely independent products:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-700 text-sm">
              <Zap className="w-4 h-4" />
              <span>FlarePrint Tools (Digital)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our standalone web platform offering free digital document utilities including PDF compression, image resizing, conversion, merging, and splitting. Operates 100% independently without requiring any printing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Printer className="w-4 h-4 text-slate-500" />
              <span>FlarePrint APVM (Physical)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our automated physical kiosk infrastructure that allows students and campus communities to quickly print physical documents on-demand at designated campus locations.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          In future updates, users will have an optional shortcut to send processed documents to nearby FlarePrint APVM kiosks, but the digital tools will always remain fully standalone and free.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Browser-First Privacy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Files stay in your browser during processing and are not uploaded to our servers. Your documents remain strictly private to you.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">High Performance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero network upload and download bottlenecks. Processing is handled using your device&apos;s native processing power for near-instant results.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Account Friction</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No signup forms, passwords, or credit card requirements. Just select a tool and process your documents immediately.
          </p>
        </div>
      </div>

      {/* Explore CTA */}
      <div className="text-center pt-4">
        <Link
          href="/#tools"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-button transition-all"
        >
          <span>Explore All 7 Document Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
