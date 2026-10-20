import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Cpu, EyeOff, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#EBF1FD] text-[#2860E8] text-[11px] font-extrabold uppercase tracking-widest border border-[#D5DCE6]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2860E8]" />
          PRIVACY-FIRST ARCHITECTURE
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#111111] uppercase tracking-tight leading-[1.05]">
          PRIVACY <span className="text-[#2860E8]">POLICY.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#556275] uppercase tracking-wider font-semibold">
          Last updated: September 2026 • Verified Client-Side Implementation
        </p>
      </div>

      {/* Primary Highlight */}
      <div className="bg-[#172033] border border-[#172033] text-white rounded-sm p-6 sm:p-8 space-y-3 shadow-flare">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#2860E8]">
          CORE GUARANTEE
        </div>
        <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#2860E8]" />
          DOCUMENTS REMAIN EXCLUSIVELY ON YOUR MACHINE
        </h2>
        <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
          Files stay in your browser during processing and are not uploaded to our servers. FlarePrint Tools runs 100% within your client browser environment using HTML5 Canvas, WebAssembly, and local JavaScript engines.
        </p>
      </div>

      {/* Key Sections */}
      <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-8 shadow-flare space-y-8">
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#2860E8]" />
            01 — How Your Documents Are Handled
          </h3>
          <p className="text-xs sm:text-sm text-[#556275] leading-relaxed">
            Unlike traditional file conversion websites that transmit sensitive PDF files or personal photographs to remote cloud clusters, FlarePrint Tools processes document operations directly inside your browser memory:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#556275]">
            <li><strong className="text-[#111111]">Zero Cloud Uploads:</strong> Files are not sent over the internet to FlarePrint servers or third-party processing APIs for any of the 7 utilities.</li>
            <li><strong className="text-[#111111]">Local Sandbox Cleanup:</strong> Files exist strictly in browser working memory (RAM). When you refresh, navigate away, or change files, memory references are instantly released to the browser garbage collector.</li>
            <li><strong className="text-[#111111]">No Database Storage:</strong> FlarePrint operates no database, vault, or cloud storage archive for digital tools.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D5DCE6]">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#2860E8]" />
            02 — Information We Do Not Collect
          </h3>
          <p className="text-xs sm:text-sm text-[#556275] leading-relaxed">
            We prioritize zero friction, anonymous utility:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#556275]">
            <li><strong className="text-[#111111]">No Account Registration:</strong> No signups, usernames, passwords, or emails required.</li>
            <li><strong className="text-[#111111]">No Document Inspection:</strong> We cannot view, inspect, categorize, or train models on your files because they never leave your device.</li>
            <li><strong className="text-[#111111]">No Financial Records:</strong> FlarePrint Tools is completely free with no payment cards or billing information requested.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D5DCE6]">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#111111]">
            03 — Telemetry & Operational Analytics
          </h3>
          <p className="text-xs sm:text-sm text-[#556275] leading-relaxed">
            We collect minimal, anonymous operational telemetry (such as page visits and high-level client performance metrics) to maintain browser compatibility and detect client runtime exceptions. No document contents or file names are ever collected.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D5DCE6]">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#111111]">
            04 — Ecosystem Separation
          </h3>
          <p className="text-xs sm:text-sm text-[#556275] leading-relaxed">
            FlarePrint Tools is an independent digital utility platform. Privacy terms for physical FlarePrint APVM printing kiosks apply solely to physical campus kiosk operations and do not apply to your local use of FlarePrint Tools.
          </p>
        </section>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2860E8] hover:text-[#1E4DC0] transition-colors"
        >
          <span>Return to FlarePrint Tools directory</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
