"use client";

import React from "react";
import { Download, RefreshCw, CheckCircle2, AlertTriangle, Printer, Layers, Info } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ResultCardProps {
  title?: string;
  originalSize?: number;
  resultSize?: number;
  reductionPercent?: number;
  targetSize?: number;
  targetAchieved?: boolean;
  methodUsed?: string;
  recommendation?: string;
  warningNote?: string;
  filename: string;
  onDownload: () => void;
  onReset: () => void;
  resetButtonText?: string;
  extraStats?: { label: string; value: string }[];
  showPrintHook?: boolean;
  onAction?: () => void;
  actionText?: string;
}

export function ResultCard({
  title = "Your file is ready",
  originalSize,
  resultSize,
  reductionPercent,
  targetSize,
  targetAchieved,
  methodUsed,
  recommendation,
  warningNote,
  filename,
  onDownload,
  onReset,
  resetButtonText = "Process another file",
  extraStats,
  showPrintHook = true,
  onAction,
  actionText,
}: ResultCardProps) {
  const hasReduction = reductionPercent !== undefined && reductionPercent > 0;

  return (
    <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-8 shadow-flare space-y-6 max-w-xl mx-auto">
      {/* Header status */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-[#D5DCE6]">
        <div
          className={`w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0 border ${
            targetAchieved === false
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-emerald-50 text-emerald-600 border-emerald-200"
          }`}
        >
          {targetAchieved === false ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-extrabold uppercase tracking-tight text-[#111111]">
              {title}
            </h3>
            {targetAchieved !== undefined && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                  targetAchieved
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {targetAchieved ? "TARGET ACHIEVED" : "CLOSEST TARGET SIZE"}
              </span>
            )}
          </div>
          <p className="text-xs text-[#556275] truncate font-mono mt-0.5">
            {filename}
          </p>
        </div>
      </div>

      {/* Method Used Badge */}
      {methodUsed && (
        <div className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F3F6FA] border border-[#D5DCE6] text-xs text-[#556275]">
          <Layers className="w-4 h-4 text-[#2860E8] flex-shrink-0" />
          <span className="truncate">
            <strong className="text-[#111111] uppercase">Method:</strong> {methodUsed}
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      {(originalSize !== undefined || resultSize !== undefined || extraStats) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {originalSize !== undefined && (
            <div className="bg-[#F3F6FA] rounded-sm p-3 text-center border border-[#D5DCE6]">
              <span className="text-[10px] text-[#556275] font-bold uppercase tracking-wider block">Original</span>
              <span className="text-sm sm:text-base font-extrabold text-[#111111] font-mono">
                {formatBytes(originalSize)}
              </span>
            </div>
          )}

          {resultSize !== undefined && (
            <div className="bg-[#EBF1FD] rounded-sm p-3 text-center border border-[#2860E8]/30">
              <span className="text-[10px] text-[#2860E8] font-bold uppercase tracking-wider block">Output Size</span>
              <span className="text-sm sm:text-base font-extrabold text-[#2860E8] font-mono">
                {formatBytes(resultSize)}
              </span>
            </div>
          )}

          {reductionPercent !== undefined && (
            <div className="col-span-2 sm:col-span-1 bg-emerald-50 rounded-sm p-3 text-center border border-emerald-200 flex flex-col justify-center">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Reduction</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-800 font-mono">
                {hasReduction ? `-${reductionPercent}%` : "OPTIMIZED"}
              </span>
            </div>
          )}

          {extraStats?.map((stat, idx) => (
            <div key={idx} className="bg-[#F3F6FA] rounded-sm p-3 text-center border border-[#D5DCE6]">
              <span className="text-[10px] text-[#556275] font-bold uppercase tracking-wider block">{stat.label}</span>
              <span className="text-sm sm:text-base font-extrabold text-[#111111] font-mono">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warning / Disclosures */}
      {warningNote && (
        <div className="p-3.5 rounded-sm bg-[#EBF1FD]/60 border border-[#2860E8]/30 text-[#111111] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[#2860E8]">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Optimization Details</span>
          </div>
          <p className="text-[#556275] leading-relaxed">{warningNote}</p>
        </div>
      )}

      {/* Target Feedback & Limitation Callout */}
      {targetSize !== undefined && targetAchieved === false && (
        <div className="p-3.5 rounded-sm bg-amber-50 border border-amber-200 text-[#111111] text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Target size could not be fully reached</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            {recommendation ||
              `The file was optimized to ${formatBytes(
                resultSize || 0
              )}, but couldn't reach ${formatBytes(
                targetSize
              )} within current mode thresholds.`}
          </p>

          {onAction && actionText && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onAction}
                className="py-2 px-3.5 rounded-sm bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{actionText}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onDownload}
          className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD RESULT</span>
        </button>

        <button
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[#111111] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#556275]" />
          <span>{resetButtonText.toUpperCase()}</span>
        </button>
      </div>

      {/* Integration Hook: Print with FlarePrint */}
      {showPrintHook && (
        <div className="pt-3 border-t border-[#D5DCE6] flex items-center justify-between text-xs text-[#556275]">
          <div className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-[#556275]" />
            <span>Need a physical printout?</span>
          </div>
          <a
            href="https://flareprint.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#2860E8] hover:underline font-bold text-[11px] uppercase tracking-wider"
          >
            <span>Print with FlarePrint Kiosk</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
