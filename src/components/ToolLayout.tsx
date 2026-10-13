"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

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
    <div className="min-h-[85vh] flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <li>
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-slate-400" />
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
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </li>
            <li className="font-semibold text-slate-900 truncate" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>

        {/* Header Title & Description */}
        <div className="text-center mb-8 sm:mb-10 space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Privacy Indicator Pill */}
          <div className="pt-1 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-emerald-200/90 text-emerald-800 text-xs font-medium shadow-2xs">
              <span className="text-sm leading-none">🔒</span>
              <span>Files stay in your browser during processing.</span>
            </div>
          </div>
        </div>

        {/* Tool Workspace Visual Focus */}
        <div className="mt-4">{children}</div>
      </main>
    </div>
  );
}
