import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-base text-slate-600">
          Last updated: September 2026
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6 text-sm text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using FlarePrint Tools, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the services.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">2. Description of Service</h2>
          <p>
            FlarePrint Tools provides free digital document utilities including compression, resizing, conversion, merging, and splitting of PDF and image files. All utilities process documents within your local browser sandbox wherever practical.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">3. User Responsibility & Content</h2>
          <p>
            You retain full ownership and responsibility for any files and data processed through FlarePrint Tools. You agree not to use the service to process unlawful or infringing material. Because documents remain on your local machine, you are solely responsible for keeping backup copies of your files.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">4. Disclaimer of Warranties</h2>
          <p>
            FlarePrint Tools is provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied. In particular, we do not warrant that arbitrary PDF documents can be reduced to any specific target file size without data or visual degradation.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">5. Product Separation</h2>
          <p>
            FlarePrint Tools is an independent digital utility platform. Use of FlarePrint Tools does not constitute an order or contractual agreement for physical printing services provided via FlarePrint APVM kiosks.
          </p>
        </section>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
