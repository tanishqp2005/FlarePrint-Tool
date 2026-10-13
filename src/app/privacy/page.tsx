import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Cpu, EyeOff, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Privacy-First Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-base text-slate-600">
          Last updated: September 2026 • Effective immediately
        </p>
      </div>

      {/* Primary Highlight */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-700" />
          Our Core Privacy Commitment
        </h2>
        <p className="text-emerald-900 leading-relaxed text-sm sm:text-base font-semibold">
          Files stay in your browser during processing and are not uploaded to our servers.
        </p>
        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-normal">
          FlarePrint Tools utilizes a client-side-first processing architecture. When you compress, resize, convert, merge, or split a document, the actual computation is executed locally inside your web browser using HTML5 Canvas and JavaScript WebAssembly libraries.
        </p>
      </div>

      {/* Key Sections */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-8">
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            1. How Your Documents Are Handled
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Unlike traditional file conversion websites that transfer your sensitive PDF files or personal photographs to remote cloud clusters, FlarePrint Tools runs document manipulation scripts directly within your browser&apos;s sandboxed memory:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            <li><strong>No Cloud Uploads:</strong> Your documents are not transmitted over the internet to FlarePrint servers or third-party processing endpoints for any of the 7 MVP utilities.</li>
            <li><strong>Browser Memory Cleanup:</strong> Documents are stored temporarily in your browser&apos;s working memory (RAM) while processing. When you refresh the page, close the browser tab, or click &ldquo;Change File&rdquo;, the temporary blob references are discarded and eligible for standard browser garbage collection.</li>
            <li><strong>Zero Document Storage:</strong> FlarePrint does not operate a user document database, file vault, or remote archive for digital tools.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-blue-600" />
            2. Information We Do Not Collect
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We prioritize zero-friction, anonymous utility:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
            <li><strong>No User Accounts:</strong> We do not require registration, usernames, passwords, or emails.</li>
            <li><strong>No Document Content Logging:</strong> We cannot read, inspect, categorize, or train AI models on the contents of your documents because files never reach our servers.</li>
            <li><strong>No Payment Card Storage:</strong> FlarePrint Tools MVP is completely free and requires no financial information.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            3. Operational Analytics
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We may monitor basic, non-personally identifiable telemetry (such as total page visits, tool navigation events, or high-level error occurrences) to maintain platform stability and improve performance across mobile and desktop devices. No document metadata or file names are included in telemetry.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            4. Ecosystem Separation
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            FlarePrint Tools is a separate digital utility platform under the FlarePrint brand. Any separate terms or privacy details pertaining to physical FlarePrint APVM printing kiosk hardware (such as campus print job queues or kiosk card swipes) apply solely to kiosk operations and do not apply to your local use of FlarePrint Tools.
          </p>
        </section>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <span>Return to FlarePrint Tools directory</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
