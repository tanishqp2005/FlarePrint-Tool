"use client";

import React from "react";
import { Download, RefreshCw, CheckCircle2, AlertTriangle, Printer, Sparkles, Layers, Info } from "lucide-react";
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
    <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6 max-w-xl mx-auto">
      {/* Header status */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            targetAchieved === false
              ? "bg-amber-100 text-amber-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {targetAchieved === false ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <CheckCircle2 className="w-7 h-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {targetAchieved !== undefined && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  targetAchieved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {targetAchieved ? "Target Achieved" : "Closest Target Size"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
            {filename}
          </p>
        </div>
      </div>

      {/* Method Used Badge */}
      {methodUsed && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="truncate">
            <strong className="text-slate-800">Method:</strong> {methodUsed}
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      {(originalSize !== undefined || resultSize !== undefined || extraStats) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {originalSize !== undefined && (
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">Original</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">
                {formatBytes(originalSize)}
              </span>
            </div>
          )}

          {resultSize !== undefined && (
            <div className="bg-blue-50/60 rounded-xl p-3 text-center border border-blue-100">
              <span className="text-xs text-blue-700 font-medium block">Output Size</span>
              <span className="text-sm sm:text-base font-bold text-blue-900">
                {formatBytes(resultSize)}
              </span>
            </div>
          )}

          {reductionPercent !== undefined && (
            <div className="col-span-2 sm:col-span-1 bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100 flex flex-col justify-center">
              <span className="text-xs text-emerald-700 font-medium block">Reduction</span>
              <span className="text-sm sm:text-base font-bold text-emerald-800">
                {hasReduction ? `-${reductionPercent}%` : "Optimized"}
              </span>
            </div>
          )}

          {extraStats?.map((stat, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">{stat.label}</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Warning / Destructive Disclosures */}
      {warningNote && (
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-blue-800">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Optimization Details</span>
          </div>
          <p className="text-blue-700 leading-relaxed">{warningNote}</p>
        </div>
      )}

      {/* Honest Target Feedback & Limitation Callout */}
      {targetSize !== undefined && targetAchieved === false && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Target size could not be fully reached</span>
          </div>
          <p className="text-amber-700 leading-relaxed">
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
                className="py-2 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{actionText}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onDownload}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </button>

        <button
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{resetButtonText}</span>
        </button>
      </div>

      {/* Future Integration Hook: Print with FlarePrint */}
      {showPrintHook && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Need a physical hard copy?</span>
          </div>
          <span className="inline-flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full text-[11px] border border-blue-100">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Print with FlarePrint (APVM Kiosk)
          </span>
        </div>
      )}
    </div>
  );
}
