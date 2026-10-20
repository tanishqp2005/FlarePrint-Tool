import React from "react";
import Link from "next/link";
import { ArrowRight, FileCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#EBF1FD] text-[#2860E8] text-[11px] font-extrabold uppercase tracking-widest border border-[#D5DCE6]">
          <FileCheck className="w-3.5 h-3.5 text-[#2860E8]" />
          OPERATIONAL TERMS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#111111] uppercase tracking-tight leading-[1.05]">
          TERMS OF <span className="text-[#2860E8]">SERVICE.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#556275] uppercase tracking-wider font-semibold">
          Last updated: September 2026 • FlarePrint Digital Utilities Platform
        </p>
      </div>

      <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-8 shadow-flare space-y-6 text-sm text-[#556275] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111]">01 — Acceptance of Terms</h2>
          <p>
            By accessing and using FlarePrint Tools, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the services.
          </p>
        </section>

        <section className="space-y-2 pt-5 border-t border-[#D5DCE6]">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111]">02 — Description of Service</h2>
          <p>
            FlarePrint Tools provides free digital document utilities including compression, resizing, conversion, merging, and splitting of PDF and image files. All utilities process documents locally within your browser sandbox.
          </p>
        </section>

        <section className="space-y-2 pt-5 border-t border-[#D5DCE6]">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111]">03 — User Responsibility & Content</h2>
          <p>
            You retain full ownership and legal responsibility for any files and data processed through FlarePrint Tools. You agree not to use the service to process unlawful, defamatory, or copyright-infringing material. Because documents remain strictly on your local machine and are not saved on remote servers, you are solely responsible for keeping backup copies of your files.
          </p>
        </section>

        <section className="space-y-2 pt-5 border-t border-[#D5DCE6]">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111]">04 — Disclaimer of Warranties</h2>
          <p>
            FlarePrint Tools is provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied. In particular, we do not warrant that arbitrary PDF documents can be reduced to any specific target file size without data, font, or visual fidelity trade-offs.
          </p>
        </section>

        <section className="space-y-2 pt-5 border-t border-[#D5DCE6]">
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111]">05 — Product Separation</h2>
          <p>
            FlarePrint Tools is an independent digital utility platform. Use of FlarePrint Tools does not constitute an order or contractual agreement for physical printing services provided via FlarePrint APVM kiosks.
          </p>
        </section>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2860E8] hover:text-[#1E4DC0] transition-colors"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
