"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  ChevronDown,
  CheckCircle2,
  HardDrive,
  Cpu,
  Sparkles,
} from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  category: "PDF Utilities" | "Image Utilities";
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  accent: string;
}

const TOOLS: ToolItem[] = [
  // Primary Compression Utilities (Most Used)
  {
    id: "compress-pdf",
    name: "COMPRESS PDF",
    category: "PDF Utilities",
    description: "Reduce PDF file size to your exact target with balanced or maximum compression.",
    href: "/compress-pdf",
    icon: FileDown,
    badge: "Target Size",
    accent: "PDF",
  },
  {
    id: "compress-jpg",
    name: "COMPRESS JPG",
    category: "Image Utilities",
    description: "Reduce image file size to a target KB or MB with automatic quality optimization.",
    href: "/compress-jpg",
    icon: ImageIcon,
    badge: "Target Size",
    accent: "IMAGE",
  },

  // PDF Conversion & Organization
  {
    id: "jpg-to-pdf",
    name: "JPG TO PDF",
    category: "PDF Utilities",
    description: "Convert single or multiple JPG and PNG images into a unified PDF document.",
    href: "/jpg-to-pdf",
    icon: FileText,
    badge: "Multi-Image",
    accent: "PDF",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF TO JPG",
    category: "PDF Utilities",
    description: "Extract and convert PDF pages into crisp JPG images at 150 or 300 DPI.",
    href: "/pdf-to-jpg",
    icon: FileImage,
    badge: "150 & 300 DPI",
    accent: "PDF",
  },
  {
    id: "merge-pdf",
    name: "MERGE PDF",
    category: "PDF Utilities",
    description: "Combine multiple PDF documents into a single document with drag-and-drop reordering.",
    href: "/merge-pdf",
    icon: Layers,
    badge: "Reorder Pages",
    accent: "PDF",
  },
  {
    id: "split-pdf",
    name: "SPLIT PDF",
    category: "PDF Utilities",
    description: "Separate a PDF into individual pages or extract custom page ranges into new files.",
    href: "/split-pdf",
    icon: Scissors,
    badge: "Page Ranges",
    accent: "PDF",
  },

  // Image Utilities
  {
    id: "resize-jpg",
    name: "RESIZE JPG",
    category: "Image Utilities",
    description: "Adjust image width and height with aspect-ratio locking and common web presets.",
    href: "/resize-jpg",
    icon: Scaling,
    badge: "Aspect Ratio",
    accent: "IMAGE",
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "PDF" | "IMAGE">("ALL");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory =
        activeCategory === "ALL" ||
        (activeCategory === "PDF" && tool.category === "PDF Utilities") ||
        (activeCategory === "IMAGE" && tool.category === "Image Utilities");

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, activeCategory]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ============================================================== */}
      {/* 1. ASYMMETRIC SPLIT-SCREEN HERO (MATCHING FLAREPRINT REFERENCE) */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden border-b border-[#D5DCE6] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2860E8]">
                <span className="w-2 h-2 bg-[#2860E8]" />
                <span>FLAREPRINT TOOLS • CLIENT-SIDE UTILITIES</span>
              </div>

              {/* Master Headline: Short deliberate breaks, black with blue emphasis */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-[#111111] leading-[0.95]">
                YOUR FILES.
                <br />
                <span className="text-[#2860E8]">SIMPLIFIED.</span>
              </h1>

              {/* Concise Supporting Copy */}
              <p className="text-base sm:text-lg text-[#556275] max-w-xl leading-relaxed">
                Compress, convert, resize, merge, and split documents or images using browser-native processing. Fast, private, and zero cloud uploads.
              </p>

              {/* CTAs: Primary Blue & Secondary Outlined */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/#tools"
                  className="px-6 py-3.5 bg-[#2860E8] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm shadow-button transition-all flex items-center gap-2"
                >
                  <span>EXPLORE TOOLS</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/#workflow"
                  className="px-6 py-3.5 bg-white hover:bg-[#F3F6FA] text-[#111111] border border-[#D5DCE6] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm transition-all"
                >
                  <span>HOW IT WORKS</span>
                </Link>
              </div>

              {/* Reassurance Checklist */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-[#556275]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2860E8]" />
                  <span>No account or signup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2860E8]" />
                  <span>100% in-browser processing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2860E8]" />
                  <span>7 ready-to-use tools</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Polished Royal Blue Document Utility Panel */}
            <div className="lg:col-span-5">
              <div className="relative bg-[#2860E8] p-6 sm:p-8 rounded-sm shadow-flare-elevated text-white overflow-hidden">
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative space-y-4">
                  {/* Top Bar inside mockup */}
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
                        DOCUMENT WORKFLOW
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm font-mono uppercase font-bold">
                      LOCAL MEMORY
                    </span>
                  </div>

                  {/* Representative PDF Preview Card */}
                  <div className="bg-white text-[#111111] p-4 rounded-sm shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-sm bg-[#EBF1FD] text-[#2860E8] flex items-center justify-center flex-shrink-0 font-bold">
                          <FileDown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs uppercase tracking-tight text-[#111111]">
                            COMPRESS PDF
                          </div>
                          <div className="text-[11px] text-[#556275]">
                            Financial_Statement_Q3.pdf
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
                        -88% SIZE
                      </span>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#D5DCE6]">
                      <div className="p-1.5 bg-[#F3F6FA] rounded-sm">
                        <span className="text-[10px] text-[#556275] block uppercase font-semibold">Original</span>
                        <span className="text-xs font-bold text-[#111111]">4.2 MB</span>
                      </div>
                      <div className="p-1.5 bg-[#EBF1FD] rounded-sm">
                        <span className="text-[10px] text-[#2860E8] block uppercase font-semibold">Target</span>
                        <span className="text-xs font-bold text-[#2860E8]">500 KB</span>
                      </div>
                      <div className="p-1.5 bg-emerald-50 rounded-sm">
                        <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Output</span>
                        <span className="text-xs font-bold text-emerald-800">486 KB</span>
                      </div>
                    </div>
                  </div>

                  {/* Representative Utility Buttons */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 hover:bg-white/20 border border-white/25 p-2.5 rounded-sm transition-colors">
                      <FileDown className="w-4 h-4 mx-auto mb-1 text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">COMPRESS</span>
                    </div>
                    <div className="bg-white/10 hover:bg-white/20 border border-white/25 p-2.5 rounded-sm transition-colors">
                      <FileText className="w-4 h-4 mx-auto mb-1 text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">CONVERT</span>
                    </div>
                    <div className="bg-white/10 hover:bg-white/20 border border-white/25 p-2.5 rounded-sm transition-colors">
                      <Scaling className="w-4 h-4 mx-auto mb-1 text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">RESIZE</span>
                    </div>
                  </div>

                  {/* Workflow Directional Indicator */}
                  <div className="bg-[#172033] p-3.5 rounded-sm text-xs space-y-2 border border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#CBD5E1]">
                      <span>EXECUTION PIPELINE</span>
                      <span className="text-[#60A5FA] font-mono">0.42 SECONDS</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>Browser Canvas & WebAssembly</span>
                      <span className="text-emerald-400 font-bold">100% LOCAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. NUMBERED WORKFLOW SECTION (FLAREPRINT MASTER REFERENCE 6s) */}
      {/* ============================================================== */}
      <section id="workflow" className="border-b border-[#D5DCE6] bg-[#F3F6FA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2860E8]">
              THE UTILITY WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#111111]">
              HOW IT WORKS.
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="relative bg-white p-6 rounded-sm border border-[#D5DCE6] space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#2860E8] font-mono">01</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F3F6FA] text-[#556275] border border-[#D5DCE6] rounded-sm">
                  STEP ONE
                </span>
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight text-[#111111]">
                UPLOAD DOCUMENT
              </h3>
              <p className="text-xs text-[#556275] leading-relaxed">
                Drag and drop your PDF or image directly into the tool. Files are loaded straight into your local browser memory without uploading to any remote server.
              </p>
            </div>

            {/* Step 02 */}
            <div className="relative bg-white p-6 rounded-sm border border-[#D5DCE6] space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#2860E8] font-mono">02</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F3F6FA] text-[#556275] border border-[#D5DCE6] rounded-sm">
                  STEP TWO
                </span>
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight text-[#111111]">
                CONFIGURE SETTINGS
              </h3>
              <p className="text-xs text-[#556275] leading-relaxed">
                Choose your custom target size, preset compression mode, target pixel dimensions, or select specific pages to split and rearrange.
              </p>
            </div>

            {/* Step 03 */}
            <div className="relative bg-white p-6 rounded-sm border border-[#D5DCE6] space-y-3 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#2860E8] font-mono">03</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F3F6FA] text-[#556275] border border-[#D5DCE6] rounded-sm">
                  STEP THREE
                </span>
              </div>
              <h3 className="text-base font-extrabold uppercase tracking-tight text-[#111111]">
                DOWNLOAD OUTPUT
              </h3>
              <p className="text-xs text-[#556275] leading-relaxed">
                Get truthful file metrics with measured reduction percentages. Download your optimized output file or zip bundle instantly to your machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. UTILITY DISCOVERY SECTION (EVERY FILE. EVERYDAY TOOLS.)     */}
      {/* ============================================================== */}
      <section id="tools" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#D5DCE6]">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2860E8]">
              UTILITY DIRECTORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111111]">
              EVERY FILE.
              <br />
              EVERYDAY TOOLS.
            </h2>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Category Toggle Tabs */}
            <div className="inline-flex p-1 bg-[#F3F6FA] border border-[#D5DCE6] rounded-sm text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveCategory("ALL")}
                className={`px-3 py-1.5 rounded-sm transition-all ${
                  activeCategory === "ALL"
                    ? "bg-[#2860E8] text-white shadow-xs"
                    : "text-[#556275] hover:text-[#111111]"
                }`}
              >
                All (7)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("PDF")}
                className={`px-3 py-1.5 rounded-sm transition-all ${
                  activeCategory === "PDF"
                    ? "bg-[#2860E8] text-white shadow-xs"
                    : "text-[#556275] hover:text-[#111111]"
                }`}
              >
                PDF (5)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("IMAGE")}
                className={`px-3 py-1.5 rounded-sm transition-all ${
                  activeCategory === "IMAGE"
                    ? "bg-[#2860E8] text-white shadow-xs"
                    : "text-[#556275] hover:text-[#111111]"
                }`}
              >
                Image (2)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#556275] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search utilities..."
                className="w-full pl-9 pr-8 py-1.5 text-xs font-medium border border-[#D5DCE6] rounded-sm bg-white text-[#111111] placeholder:text-[#556275] focus:outline-none focus:border-[#2860E8] focus:ring-1 focus:ring-[#2860E8]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#556275] hover:text-[#111111]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative bg-white border border-[#D5DCE6] hover:border-[#2860E8] p-6 rounded-sm shadow-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-sm bg-[#F3F6FA] text-[#2860E8] border border-[#D5DCE6] group-hover:bg-[#2860E8] group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#F3F6FA] text-[#556275] border border-[#D5DCE6]">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold uppercase tracking-tight text-[#111111] group-hover:text-[#2860E8] transition-colors flex items-center justify-between">
                      <span>{tool.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#2860E8]" />
                    </h3>
                    <p className="text-xs text-[#556275] mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#D5DCE6] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2860E8]">
                  <span>OPEN UTILITY</span>
                  <span className="text-[10px] text-[#556275] font-mono">{tool.accent}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-[#F3F6FA] border border-[#D5DCE6] rounded-sm p-8">
            <Search className="w-8 h-8 text-[#556275] mx-auto mb-3" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
              No matching tools found
            </h3>
            <p className="text-xs text-[#556275] mt-1">
              Try searching with &ldquo;compress&rdquo;, &ldquo;PDF&rdquo;, &ldquo;JPG&rdquo;, or &ldquo;resize&rdquo;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("ALL");
              }}
              className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#2860E8] rounded-sm hover:bg-[#1d4ed8]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 4. SPLIT-PANEL BENEFITS (MATCHING FLAREPRINT REFERENCE 10s-18s) */}
      {/* ============================================================== */}
      <section className="border-t border-b border-[#D5DCE6] bg-[#172033] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Left Dark Navy Panel */}
          <div className="p-8 sm:p-12 lg:p-16 space-y-6 lg:border-r border-[#232F47]">
            <span className="text-xs font-bold uppercase tracking-widest text-[#60A5FA]">
              LOCAL ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.05]">
              YOUR DOCUMENT
              <br />
              DOESN&apos;T NEED TO
              <br />
              LEAVE YOUR DEVICE.
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-lg">
              Traditional online utilities require uploading your sensitive documents, contracts, and private photos to remote cloud servers. FlarePrint Tools runs document manipulation engines directly inside your browser sandbox.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-sm bg-[#1E293B] border border-[#232F47] text-[#60A5FA] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">Client-Side WebAssembly & Canvas</span>
                  <span className="text-[#94A3B8]">Computation runs locally on your computer&apos;s processor.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-sm bg-[#1E293B] border border-[#232F47] text-[#60A5FA] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">Zero Cloud File Storage</span>
                  <span className="text-[#94A3B8]">Documents are held temporarily in browser memory and flushed on tab close.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-sm bg-[#1E293B] border border-[#232F47] text-[#60A5FA] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">No Tracking or Accounts</span>
                  <span className="text-[#94A3B8]">No sign-ups, credit cards, or personal identities linked to your files.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Royal Blue Comparison Panel */}
          <div className="bg-[#2860E8] p-8 sm:p-12 lg:p-16 text-white space-y-6 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
              WORKFLOW COMPARISON
            </span>

            {/* Traditional Workflow */}
            <div className="bg-white/10 border border-white/20 p-5 rounded-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 block">
                TRADITIONAL ONLINE TOOL
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold">
                <span>Your File</span>
                <span>→</span>
                <span className="text-red-200">Upload to Cloud</span>
                <span>→</span>
                <span>Wait in Server Queue</span>
                <span>→</span>
                <span className="text-red-200">Server Storage</span>
              </div>
            </div>

            {/* FlarePrint Workflow */}
            <div className="bg-white text-[#111111] p-5 rounded-sm space-y-2 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2860E8]">
                  FLAREPRINT TOOLS
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-sm">
                  PRIVATE
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#111111]">
                <span>Your Device</span>
                <span className="text-[#2860E8]">→</span>
                <span className="text-[#2860E8]">Local Browser Engine</span>
                <span className="text-[#2860E8]">→</span>
                <span className="text-emerald-700">Instant Download</span>
              </div>
              <p className="text-[11px] text-[#556275] pt-1 leading-relaxed">
                Files never leave your device. The document is processed in volatile RAM and immediately discarded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FULL-WIDTH PRIVACY BANNER (MATCHING REFERENCE 26s)          */}
      {/* ============================================================== */}
      <section className="bg-[#2860E8] text-white py-16 text-center border-b border-[#D5DCE6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm border border-white/30 bg-white/10 mb-2">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            PROCESS PRIVATELY.
            <br />
            LEAVE NOTHING BEHIND.
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
            Your document is processed strictly in your local browser environment. Once you close the tab or choose a new file, the data is automatically discarded.
          </p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. FAQ SECTION                                                 */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 border-b border-[#D5DCE6] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="space-y-2 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2860E8]">
              DOCUMENT UTILITY GUIDANCE
            </span>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#111111]">
              FREQUENTLY ASKED QUESTIONS.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Which file formats are supported?",
                a: "FlarePrint Tools supports standard PDF documents (.pdf) across all 5 PDF utilities, as well as JPG, JPEG, and PNG image formats across our image compression and resizing tools.",
              },
              {
                q: "How does compression affect document quality?",
                a: "Our compression tools offer Balanced, Strong, and Maximum modes. Balanced mode optimizes embedded objects and streams while preserving selectable vector text and typography. Strong and Maximum modes use aggressive optimization and page rasterization when needed to meet very tight target sizes.",
              },
              {
                q: "How do custom target sizes work?",
                a: "You can specify an exact target size in KB or MB (e.g., 200 KB for admission or job portals). The algorithm iteratively calculates the closest possible output size and truthfully displays the achieved result.",
              },
              {
                q: "Do my files ever leave my computer?",
                a: "No. All 7 utilities run 100% in your browser using local JavaScript and WebAssembly libraries. No files are transmitted or stored on FlarePrint servers.",
              },
              {
                q: "Is FlarePrint Tools free to use?",
                a: "Yes. All digital tools on this site are completely free with no user registrations, subscription paywalls, or document count limits.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="border border-[#D5DCE6] rounded-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-[#111111] uppercase tracking-wide flex items-center justify-between hover:bg-[#F3F6FA] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#556275] transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#556275] leading-relaxed border-t border-[#D5DCE6] bg-[#F3F6FA]">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. FINAL CLOSING CTA SECTION (MATCHING REFERENCE 30s-33s)      */}
      {/* ============================================================== */}
      <section className="py-20 sm:py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2860E8]">
            READY WHEN YOU ARE
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111111] leading-[1.05]">
            YOUR NEXT FILE.
            <br />
            STARTS HERE.
          </h2>

          <p className="text-sm sm:text-base text-[#556275] max-w-lg mx-auto leading-relaxed">
            Pick a utility, drag your file into the browser, and download your processed result in seconds.
          </p>

          <div className="pt-2">
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2860E8] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm shadow-button transition-all"
            >
              <span>EXPLORE ALL UTILITIES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
