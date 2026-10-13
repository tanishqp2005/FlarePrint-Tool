"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileDown,
  Image as ImageIcon,
  Scaling,
  FileImage,
  Layers,
  Scissors,
  Search,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  FileText,
} from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  category: "Compress & Resize" | "Convert" | "Organize";
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const TOOLS: ToolItem[] = [
  // Compress & Resize
  {
    id: "compress-pdf",
    name: "Compress PDF",
    category: "Compress & Resize",
    description: "Reduce PDF size to the size you need.",
    href: "/compress-pdf",
    icon: FileDown,
    badge: "Target Size",
  },
  {
    id: "compress-jpg",
    name: "Compress JPG",
    category: "Compress & Resize",
    description: "Reduce image size while keeping good quality.",
    href: "/compress-jpg",
    icon: ImageIcon,
    badge: "Target Size",
  },
  {
    id: "resize-jpg",
    name: "Resize JPG",
    category: "Compress & Resize",
    description: "Resize images to your required dimensions.",
    href: "/resize-jpg",
    icon: Scaling,
    badge: "Presets & Custom",
  },

  // Convert
  {
    id: "jpg-to-pdf",
    name: "JPG → PDF",
    category: "Convert",
    description: "Turn one or multiple images into a PDF.",
    href: "/jpg-to-pdf",
    icon: FileText,
    badge: "Multi-Image",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF → JPG",
    category: "Convert",
    description: "Convert PDF pages into JPG images.",
    href: "/pdf-to-jpg",
    icon: FileImage,
    badge: "150 & 300 DPI",
  },

  // Organize
  {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "Organize",
    description: "Combine multiple PDFs into one.",
    href: "/merge-pdf",
    icon: Layers,
    badge: "Drag & Reorder",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    category: "Organize",
    description: "Separate a PDF into multiple files.",
    href: "/split-pdf",
    icon: Scissors,
    badge: "Ranges & All",
  },
];

const CATEGORIES: ("Compress & Resize" | "Convert" | "Organize")[] = [
  "Compress & Resize",
  "Convert",
  "Organize",
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const query = searchQuery.toLowerCase().trim();
    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/60 bg-gradient-to-b from-blue-50/40 via-white to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            FlarePrint Document Utilities
          </div>

          {/* Brand & Main Headline */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src="/android-chrome-192x192.png"
                  alt="FlarePrint"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                FLAREPRINT <span className="text-blue-600">TOOLS</span>
              </h1>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Free tools for your documents.
            </p>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Compress, resize, convert and organize your PDF and image files. Fast, straightforward, and no sign-up required.
            </p>
          </div>

          {/* Privacy Trust Badge */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium shadow-subtle">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Files stay in your browser during processing and are not uploaded to our servers.</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pt-4 max-w-lg mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tool Categories Directory - STRICTLY NO UPLOAD AREA ON HOMEPAGE */}
      <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {CATEGORIES.map((category) => {
          const categoryTools = filteredTools.filter((t) => t.category === category);
          if (categoryTools.length === 0) return null;

          return (
            <div key={category} className="mb-12 last:mb-0">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/80">
                <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {category}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="group bg-white border border-border/90 rounded-2xl p-6 hover:border-blue-500/80 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shadow-sm">
                            <Icon className="w-6 h-6" />
                          </div>
                          {tool.badge && (
                            <span className="text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {tool.name}
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        <span>Use tool</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No matching tools found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Try searching with different keywords such as &ldquo;compress&rdquo;, &ldquo;PDF&rdquo;, or &ldquo;resize&rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}
      </section>

      {/* Privacy & Trust Section */}
      <section className="bg-slate-50/70 border-t border-border/80 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Privacy by Design
            </h2>
            <p className="text-base text-slate-600 max-w-xl mx-auto">
              How FlarePrint Tools processes your sensitive documents with client-side-first architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Local Browser Processing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Files stay in your browser during processing and are not uploaded to our servers. All document computations execute directly on your machine.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Instant Execution</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No upload wait times or server queue delays. Processing starts immediately using your device&apos;s native capabilities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">No Account Required</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Free for everyone. No sign-ups, no tracking of personal identity, and no cloud document storage vaults.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
