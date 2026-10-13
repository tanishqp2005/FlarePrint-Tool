"use client";

import React from "react";
import { Download, RefreshCw, CheckCircle2, AlertTriangle, Printer, Sparkles, ArrowDown } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ResultCardProps {
  title?: string;
  originalSize?: number;
  resultSize?: number;
  reductionPercent?: number;
  targetSize?: number;
  targetAchieved?: boolean;
  recommendation?: string;
  filename: string;
  onDownload: () => void;
  onReset: () => void;
  downloadButtonText?: string;
  resetButtonText?: string;
  extraStats?: { label: string; value: string }[];
  showPrintHook?: boolean;
}

export function ResultCard({
  title = "File Ready",
  originalSize,
  resultSize,
  reductionPercent,
  targetSize,
  targetAchieved,
  recommendation,
  filename,
  onDownload,
  onReset,
  downloadButtonText = "Download File",
  resetButtonText = "Process another file",
  extraStats,
  showPrintHook = true,
}: ResultCardProps) {
  const hasReduction = reductionPercent !== undefined && reductionPercent > 0;
  const reductionLabel = reductionPercent !== undefined ? `${reductionPercent}% smaller` : null;

  // Calculate percentage of remaining size for visual comparison bar
  const percentRemaining =
    originalSize && resultSize && originalSize > 0
      ? Math.max(5, Math.min(100, Math.round((resultSize / originalSize) * 100)))
      : null;

  return (
    <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-200 space-y-6 max-w-xl mx-auto">
      {/* Header status */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100 shadow-2xs">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 truncate font-mono mt-0.5" title={filename}>
            {filename}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      {(originalSize !== undefined || resultSize !== undefined || extraStats) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {originalSize !== undefined && (
              <div className="bg-slate-50/80 rounded-2xl p-3.5 text-center border border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Original
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 block">
                  {formatBytes(originalSize)}
                </span>
              </div>
            )}

            {resultSize !== undefined && (
              <div className="bg-blue-50/70 rounded-2xl p-3.5 text-center border border-blue-100">
                <span className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider block">
                  Result
                </span>
                <span className="text-base sm:text-lg font-bold text-blue-900 mt-0.5 block">
                  {formatBytes(resultSize)}
                </span>
              </div>
            )}

            {reductionPercent !== undefined && (
              <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 rounded-2xl p-3.5 text-center border border-emerald-100 flex flex-col justify-center">
                <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider block">
                  Savings
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-800 mt-0.5 inline-flex items-center justify-center gap-0.5">
                  {hasReduction ? (
                    <>
                      <ArrowDown className="w-4 h-4 stroke-[3]" />
                      {reductionLabel}
                    </>
                  ) : (
                    "Optimized"
                  )}
                </span>
              </div>
            )}

            {extraStats?.map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-2xl p-3.5 text-center border border-slate-100"
              >
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 block">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Visual Size Comparison Bar */}
          {percentRemaining !== null && hasReduction && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Compression comparison</span>
                <span className="text-emerald-700 font-bold">{reductionPercent}% smaller</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${percentRemaining}%` }}
                />
                <div
                  className="bg-emerald-400/80 h-full transition-all duration-700 ease-out"
                  style={{ width: `${100 - percentRemaining}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>New size: {percentRemaining}% of original</span>
                <span>Reduced by {100 - percentRemaining}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Honest Target Feedback & Limitation Callout */}
      {targetSize !== undefined && targetAchieved === false && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Target size could not be fully reached safely</span>
          </div>
          <p className="text-amber-700 leading-relaxed font-normal">
            {recommendation ||
              `We couldn't safely reduce this file to ${formatBytes(
                targetSize
              )} without excessive quality degradation. The file was optimized to ${formatBytes(
                resultSize || 0
              )}.`}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-1">
        <button
          onClick={onDownload}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
        >
          <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          <span>{downloadButtonText}</span>
        </button>

        <button
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{resetButtonText}</span>
        </button>
      </div>

      {/* Future Integration Hook: Print with FlarePrint */}
      {showPrintHook && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Need a physical copy?</span>
          </div>
          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full text-[11px] border border-blue-100">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Print with FlarePrint
          </span>
        </div>
      )}
    </div>
  );
}
