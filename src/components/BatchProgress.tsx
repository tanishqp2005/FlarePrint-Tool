"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface BatchProgressProps {
  current: number;
  total: number;
  overallPercent: number;
  currentFileName?: string;
  statusMessage?: string;
  filePercent?: number;
}

export function BatchProgress({
  current,
  total,
  overallPercent,
  currentFileName,
  statusMessage,
  filePercent,
}: BatchProgressProps) {
  return (
    <div className="bg-white border border-[#D5DCE6] rounded-sm p-5 sm:p-6 shadow-flare space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#2860E8]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
            Processing Batch ({current} of {total} files)
          </h4>
        </div>
        <span className="text-xs font-mono font-bold text-[#2860E8]">
          {Math.min(100, Math.max(0, Math.round(overallPercent)))}%
        </span>
      </div>

      {/* Main overall progress bar */}
      <div className="w-full h-2 bg-[#F3F6FA] border border-[#D5DCE6] overflow-hidden rounded-xs">
        <div
          className="h-full bg-[#2860E8] transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, overallPercent))}%` }}
        />
      </div>

      {/* Current item info & step status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#556275] gap-1 pt-1">
        <span className="truncate max-w-md font-medium text-[#111111]">
          {currentFileName ? `Current: ${currentFileName}` : "Working..."}
        </span>
        {statusMessage && (
          <span className="truncate max-w-sm italic text-[#556275]">
            {statusMessage}
            {filePercent !== undefined && filePercent > 0 && ` (${filePercent}%)`}
          </span>
        )}
      </div>
    </div>
  );
}
