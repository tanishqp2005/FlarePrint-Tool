"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileDown,
  Image as ImageIcon,
  Scaling,
  FileText,
  FileImage,
  Layers,
  Scissors,
  ArrowRight,
  CornerDownLeft,
  X,
  Sparkles,
} from "lucide-react";

export interface ToolDef {
  id: string;
  name: string;
  category: "Compress & Resize" | "Convert" | "Organize";
  description: string;
  href: string;
  icon: React.ElementType;
  keywords: string[];
}

export const ALL_TOOLS: ToolDef[] = [
  {
    id: "compress-pdf",
    name: "Compress PDF",
    category: "Compress & Resize",
    description: "Reduce PDF size to your exact target in KB or MB",
    href: "/compress-pdf",
    icon: FileDown,
    keywords: ["pdf", "compress", "shrink", "reduce", "size", "kb", "mb", "optimize"],
  },
  {
    id: "compress-jpg",
    name: "Compress JPG",
    category: "Compress & Resize",
    description: "Shrink image file size with smart quality retention",
    href: "/compress-jpg",
    icon: ImageIcon,
    keywords: ["jpg", "jpeg", "image", "photo", "compress", "reduce", "size", "kb"],
  },
  {
    id: "resize-jpg",
    name: "Resize JPG",
    category: "Compress & Resize",
    description: "Scale image dimensions with aspect-ratio locking",
    href: "/resize-jpg",
    icon: Scaling,
    keywords: ["resize", "dimensions", "width", "height", "scale", "pixels", "aspect ratio"],
  },
  {
    id: "jpg-to-pdf",
    name: "JPG → PDF",
    category: "Convert",
    description: "Combine multiple images into a clean, unified PDF",
    href: "/jpg-to-pdf",
    icon: FileText,
    keywords: ["convert", "jpg to pdf", "images to pdf", "png to pdf", "create pdf"],
  },
  {
    id: "pdf-to-jpg",
    name: "PDF → JPG",
    category: "Convert",
    description: "Extract PDF pages into crisp 150 or 300 DPI images",
    href: "/pdf-to-jpg",
    icon: FileImage,
    keywords: ["convert", "pdf to jpg", "pdf to image", "export pages", "dpi", "extract"],
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "Organize",
    description: "Combine multiple PDF documents in custom sequence",
    href: "/merge-pdf",
    icon: Layers,
    keywords: ["merge", "combine", "join", "pdf", "binder", "reorder"],
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    category: "Organize",
    description: "Extract single pages or custom ranges into standalone PDFs",
    href: "/split-pdf",
    icon: Scissors,
    keywords: ["split", "extract", "separate", "cut", "ranges", "pages", "pdf"],
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_TOOLS;
    return ALL_TOOLS.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
      return matchName || matchDesc || matchCategory || matchKeywords;
    });
  }, [query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredTools.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(filteredTools.length - 1, 0) : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        router.push(filteredTools[selectedIndex].href);
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200/90 shadow-command-palette overflow-hidden flex flex-col max-h-[80vh] transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a document tool (e.g. compress, merge, jpg)..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              Esc
            </span>
          )}
        </div>

        {/* Quick Suggested Queries when empty */}
        {!query && (
          <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs text-slate-500">
            <span className="font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Suggested:
            </span>
            {["Compress PDF", "JPG → PDF", "Merge PDF", "Compress JPG"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    router.push(tool.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/80 border border-blue-200/80 text-blue-950"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {tool.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 pl-2">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-md shadow-xs">
                        Open <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-7 h-7 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No tools found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching for “compress”, “pdf”, “jpg”, or “merge”
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-semibold bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs">↑</kbd>
              <kbd className="font-semibold bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs ml-0.5">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="font-semibold bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs">↵</kbd> Select
            </span>
            <span>
              <kbd className="font-semibold bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs">Esc</kbd> Close
            </span>
          </div>
          <span className="text-slate-400 font-medium">
            {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
          </span>
        </div>
      </div>
    </div>
  );
}
