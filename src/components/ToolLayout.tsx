"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Home } from "lucide-react";

interface ToolLayoutProps {
  category: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ToolLayout({
  category,
  title,
  description,
  children,
}: ToolLayoutProps) {
  // Format title into uppercase editorial style
  const uppercaseTitle = title.toUpperCase();
  const endsWithDot = uppercaseTitle.endsWith(".");
  const displayTitle = endsWithDot ? uppercaseTitle.slice(0, -1) : uppercaseTitle;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Breadcrumb & Header Bar */}
      <div className="border-b border-[#D5DCE6] bg-[#F3F6FA]/60 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#556275]">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#2860E8] transition-colors flex items-center gap-1"
                >
                  <Home className="w-3 h-3" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3 h-3 text-[#D5DCE6]" />
              </li>
              <li>
                <Link
                  href="/#tools"
                  className="hover:text-[#2860E8] transition-colors"
                >
                  {category}
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3 h-3 text-[#D5DCE6]" />
              </li>
              <li className="text-[#111111] truncate" aria-current="page">
                {title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Editorial Heading */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2860E8]">
            <span className="w-2 h-2 bg-[#2860E8]" />
            <span>FLAREPRINT UTILITY • LOCAL BROWSER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-[#111111]">
            {displayTitle}
            <span className="text-[#2860E8]">.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#556275] max-w-xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Privacy Reassurance Pill */}
          <div className="pt-1 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#F3F6FA] border border-[#D5DCE6] text-[#556275] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2860E8] flex-shrink-0" />
              <span>Files remain inside your browser memory during processing</span>
            </div>
          </div>
        </div>

        {/* Tool Content Body */}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
