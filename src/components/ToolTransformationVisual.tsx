"use client";

import React from "react";
import { ArrowRight, ArrowDown, Scissors, Layers, FileText, Image as ImageIcon } from "lucide-react";

interface ToolTransformationVisualProps {
  toolId: string;
}

export function ToolTransformationVisual({ toolId }: ToolTransformationVisualProps) {
  switch (toolId) {
    case "compress-pdf":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-5 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-[9px] font-bold border border-red-200">
              PDF
            </span>
            <span>4.8 MB</span>
          </div>

          <div className="flex items-center gap-1 text-blue-600">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
              <ArrowDown className="w-2.5 h-2.5 mr-0.5" />
              72%
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="w-5 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold border border-blue-200">
              PDF
            </span>
            <span>1.3 MB</span>
          </div>
        </div>
      );

    case "compress-jpg":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold border border-amber-200">
              IMG
            </span>
            <span>3.2 MB</span>
          </div>

          <div className="flex items-center gap-1 text-blue-600">
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              <ArrowDown className="w-2.5 h-2.5 mr-0.5" />
              65%
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold border border-blue-200">
              IMG
            </span>
            <span>1.1 MB</span>
          </div>
        </div>
      );

    case "resize-jpg":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
              3840×2160
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] text-blue-600 font-semibold">Scale</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-blue-700">
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] border border-blue-200">
              1920×1080
            </span>
          </div>
        </div>
      );

    case "jpg-to-pdf":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center -space-x-1">
            <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center text-[8px] font-bold shadow-2xs">
              01
            </span>
            <span className="w-5 h-5 rounded bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center text-[8px] font-bold shadow-2xs">
              02
            </span>
            <span className="w-5 h-5 rounded bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-[8px] font-bold shadow-2xs">
              03
            </span>
          </div>

          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-[10px] text-slate-400 font-sans font-medium">Merge to</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <span className="w-5 h-6 rounded bg-red-100 text-red-700 flex items-center justify-center text-[9px] font-bold border border-red-200">
              PDF
            </span>
            <span className="text-[10px] text-slate-500">1 Doc</span>
          </div>
        </div>
      );

    case "pdf-to-jpg":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-5 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-[9px] font-bold border border-red-200">
              PDF
            </span>
            <span className="text-[10px] text-slate-500">Pages</span>
          </div>

          <div className="flex items-center gap-1 text-blue-600">
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-sans font-semibold text-blue-600">Extract</span>
          </div>

          <div className="flex items-center -space-x-1">
            <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[8px] font-bold shadow-2xs">
              JPG
            </span>
            <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[8px] font-bold shadow-2xs">
              JPG
            </span>
          </div>
        </div>
      );

    case "merge-pdf":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="w-4 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center text-[8px] font-bold border border-red-200">
              A
            </span>
            <span className="text-slate-400 text-xs">+</span>
            <span className="w-4 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center text-[8px] font-bold border border-red-200">
              B
            </span>
          </div>

          <div className="flex items-center gap-1 text-blue-600">
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-sans font-semibold text-blue-600">Combine</span>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-blue-700">
            <span className="w-5 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-2xs">
              A+B
            </span>
            <span className="text-[10px] text-slate-500">Unified</span>
          </div>
        </div>
      );

    case "split-pdf":
      return (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-100 font-mono text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-5 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-[9px] font-bold border border-red-200">
              PDF
            </span>
            <span className="text-[10px] text-slate-500">12 pgs</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Scissors className="w-3.5 h-3.5 text-blue-500" />
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px]">01</span>
            <span className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px]">02</span>
            <span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] border border-blue-200">03</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
