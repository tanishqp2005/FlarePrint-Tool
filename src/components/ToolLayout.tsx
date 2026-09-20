"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Home } from "lucide-react";

interface ToolLayoutProps {
  category: "Compress & Resize" | "Convert" | "Organize";
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
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
            <li>
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </li>
            <li>
              <Link
                href="/#tools"
                className="hover:text-blue-600 transition-colors"
              >
                {category}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </li>
            <li className="font-semibold text-slate-800 truncate" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>

        {/* Header Title & Description */}
        <div className="text-center mb-8 space-y-2.5">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {description}
          </p>

          {/* Privacy Indicator */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Files stay in your browser during processing and are not uploaded to our servers.</span>
            </div>
          </div>
        </div>

        {/* Tool Content Body */}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
