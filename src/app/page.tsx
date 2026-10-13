"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Sparkles,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";
import { ToolTransformationVisual } from "@/components/ToolTransformationVisual";
import { GradientBackground } from "@/components/ui/gradient-background-4";

interface ToolItem {
  id: string;
  name: string;
  category: "Compress & Resize" | "Convert" | "Organize";
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  keywords: string[];
}

const TOOLS: ToolItem[] = [
  // Compress & Resize
  {
    id: "compress-pdf",
    name: "Compress PDF",
    category: "Compress & Resize",
    description: "Reduce PDF size to your exact target in KB or MB while maintaining visual clarity.",
    href: "/compress-pdf",
    icon: FileDown,
    badge: "Target Size",
    keywords: ["pdf", "compress", "shrink", "reduce", "size", "kb", "mb", "optimize"],
  },
  {
    id: "compress-jpg",
    name: "Compress JPG",
    category: "Compress & Resize",
    description: "Reduce image file size intelligently while preserving sharpness and detail.",
    href: "/compress-jpg",
    icon: ImageIcon,
    badge: "Target Size",
    keywords: ["jpg", "jpeg", "image", "photo", "compress", "reduce", "size", "kb"],
  },
  {
    id: "resize-jpg",
    name: "Resize JPG",
    category: "Compress & Resize",
    description: "Scale images to precise pixel dimensions with automatic aspect-ratio lock.",
    href: "/resize-jpg",
    icon: Scaling,
    badge: "Presets & Custom",
    keywords: ["resize", "dimensions", "width", "height", "scale", "pixels", "aspect ratio"],
  },

  // Convert
  {
    id: "jpg-to-pdf",
    name: "JPG → PDF",
    category: "Convert",
    description: "Turn one or multiple JPG/PNG images into a beautifully formatted PDF document.",
    href: "/jpg-to-pdf",
    icon: FileText,
    badge: "Multi-Image",
    keywords: ["convert", "jpg to pdf", "images to pdf", "png to pdf", "create pdf"],
  },
  {
    id: "pdf-to-jpg",
    name: "PDF → JPG",
    category: "Convert",
    description: "Extract and convert PDF pages into high-definition 150 or 300 DPI JPG images.",
    href: "/pdf-to-jpg",
    icon: FileImage,
    badge: "150 & 300 DPI",
    keywords: ["convert", "pdf to jpg", "pdf to image", "export pages", "dpi", "extract"],
  },

  // Organize
  {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "Organize",
    description: "Combine multiple PDF documents into a single, ordered file in seconds.",
    href: "/merge-pdf",
    icon: Layers,
    badge: "Drag & Reorder",
    keywords: ["merge", "combine", "join", "pdf", "binder", "reorder"],
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    category: "Organize",
    description: "Separate PDF pages or extract custom page ranges into standalone PDF files.",
    href: "/split-pdf",
    icon: Scissors,
    badge: "Ranges & All",
    keywords: ["split", "extract", "separate", "cut", "ranges", "pages", "pdf"],
  },
];

const DIRECTORY_SECTIONS = [
  {
    category: "Compress & Resize" as const,
    description: "Get your files to the size and dimensions you need.",
  },
  {
    category: "Convert" as const,
    description: "Turn your files into the format you need.",
  },
  {
    category: "Organize" as const,
    description: "Bring documents together or split them apart.",
  },
];

const SUGGESTED_SEARCHES = [
  "Compress PDF",
  "Compress JPG",
  "JPG → PDF",
  "PDF → JPG",
  "Merge PDF",
  "Split PDF",
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
    }
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return TOOLS;
    const query = searchQuery.toLowerCase().trim();
    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen">
      {/* 1. HOMEPAGE HERO WITH AMBIENT GRADIENT & SUBTLE GRID TEXTURE */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/80 bg-grid-pattern">
        <GradientBackground className="opacity-70" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-blue-200/90 text-blue-700 text-xs font-semibold shadow-2xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="tracking-wide">FLAREPRINT TOOLS</span>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Your documents. <br className="hidden sm:inline" />
              <span className="text-blue-600">Simplified.</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Compress, resize, convert and organize your files — privately, right in your browser.
            </p>
          </div>

          {/* Privacy Indicator Pill */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-medium shadow-2xs">
              <span className="text-base leading-none">🔒</span>
              <span>Files stay in your browser during processing.</span>
            </div>
          </div>

          {/* 2. COMMAND-STYLE TOOL SEARCH */}
          <div className="pt-4 max-w-xl mx-auto">
            <div
              className={`relative rounded-2xl bg-white border transition-all duration-200 shadow-sm ${
                isSearchFocused
                  ? "border-blue-500 ring-4 ring-blue-500/10 shadow-glow-blue"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center px-4 py-3.5">
                <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search a document tool..."
                  className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />

                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500 shadow-2xs">
                    {isMac ? "⌘" : "Ctrl"} K
                  </kbd>
                )}
              </div>

              {/* Suggestions dropdown on focus or when query empty */}
              {isSearchFocused && !searchQuery && (
                <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 rounded-b-2xl flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-500 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Suggested:
                  </span>
                  {SUGGESTED_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(term);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 transition-colors shadow-2xs"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. TOOL DIRECTORY WITH 3 VISUAL SECTIONS & RICH TOOL CARDS */}
      <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {DIRECTORY_SECTIONS.map((section) => {
          const sectionTools = filteredTools.filter((t) => t.category === section.category);
          if (sectionTools.length === 0) return null;

          return (
            <div key={section.category} className="mb-16 last:mb-0">
              {/* Section Header */}
              <div className="mb-6 pb-3 border-b border-border/70 flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {section.category}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {section.description}
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium self-start sm:self-auto">
                  {sectionTools.length} {sectionTools.length === 1 ? "tool" : "tools"}
                </span>
              </div>

              {/* Rich Tool Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="group bg-white border border-border rounded-2xl p-6 hover:border-blue-400/90 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        {/* Header: Icon & Badge */}
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 transition-all duration-200 shadow-2xs">
                            <Icon className="w-6 h-6 transition-transform group-hover:rotate-1" />
                          </div>
                          {tool.badge && (
                            <span className="text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {tool.name}
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>

                        {/* Visual Transformation Micro-Illustration */}
                        <div className="pt-1">
                          <ToolTransformationVisual toolId={tool.id} />
                        </div>
                      </div>

                      {/* Footer Action Indicator */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                        <span className="group-hover:underline">Open tool</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty Search Fallback */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 max-w-lg mx-auto">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No matching tools found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with keywords such as &ldquo;compress&rdquo;, &ldquo;PDF&rdquo;, &ldquo;resize&rdquo;, or &ldquo;merge&rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* 4. PRIVACY SECTION */}
      <section className="bg-slate-50/70 border-t border-border/80 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Your files stay yours.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Files are processed locally in your browser and are not uploaded to our servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Benefit 1: Fast */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
                ⚡
              </div>
              <h3 className="font-bold text-base text-slate-900">Fast</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Local processing means no unnecessary upload wait. Documents process instantly directly with your machine&apos;s compute power.
              </p>
            </div>

            {/* Benefit 2: Private */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                🔒
              </div>
              <h3 className="font-bold text-base text-slate-900">Private</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your documents aren&apos;t sent to external document-processing servers. The files never leave your device during computation.
              </p>
            </div>

            {/* Benefit 3: Free */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                🆓
              </div>
              <h3 className="font-bold text-base text-slate-900">Free</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No account or subscription required. Use all utilities without credit cards, email sign-ups, or usage limits.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
