"use client";

import React from "react";
import {
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Printer,
  Archive,
  Loader2,
  FileText,
  ImageIcon,
  XCircle,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface BatchResultItem {
  id: string;
  originalFileName: string;
  downloadFileName: string;
  originalSize?: number;
  resultSize?: number;
  reductionPercent?: number;
  status: "success" | "error";
  error?: string;
  badge?: string;
  badgeType?: "success" | "warning" | "error" | "info";
  details?: string;
  extraStats?: { label: string; value: string }[];
  previewUrl?: string;
  onDownload: () => void;
}

interface BatchResultsViewProps {
  title?: string;
  subtitle?: string;
  results: BatchResultItem[];
  onDownloadAllZip: () => void;
  isZipping?: boolean;
  zipButtonText?: string;
  onReset: () => void;
  resetButtonText?: string;
  showPrintHook?: boolean;
}

export function BatchResultsView({
  title = "Batch Processing Complete",
  subtitle,
  results,
  onDownloadAllZip,
  isZipping = false,
  zipButtonText = "Download All (ZIP)",
  onReset,
  resetButtonText = "Process More Files",
  showPrintHook = true,
}: BatchResultsViewProps) {
  const successCount = results.filter((r) => r.status === "success").length;
  const failureCount = results.filter((r) => r.status === "error").length;

  const totalOriginalBytes = results.reduce(
    (acc, r) => acc + (r.originalSize || 0),
    0
  );
  const totalResultBytes = results.reduce(
    (acc, r) => acc + (r.status === "success" && r.resultSize ? r.resultSize : 0),
    0
  );

  const hasReductionStats =
    totalOriginalBytes > 0 &&
    totalResultBytes > 0 &&
    results.some((r) => r.reductionPercent !== undefined);

  const totalReductionPercent =
    totalOriginalBytes > 0 && totalResultBytes > 0 && totalOriginalBytes > totalResultBytes
      ? Math.round(((totalOriginalBytes - totalResultBytes) / totalOriginalBytes) * 100)
      : 0;

  return (
    <div className="bg-white border border-[#D5DCE6] rounded-sm p-5 sm:p-8 shadow-flare space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D5DCE6]">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0 border ${
              failureCount === 0
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}
          >
            {failureCount === 0 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-extrabold uppercase tracking-tight text-[#111111]">
              {title}
            </h3>
            <p className="text-xs text-[#556275] mt-0.5">
              {subtitle || (
                <>
                  <span className="font-bold text-[#111111]">{successCount}</span> of{" "}
                  <span className="font-bold text-[#111111]">{results.length}</span>{" "}
                  {results.length === 1 ? "file" : "files"} processed successfully
                  {failureCount > 0 && (
                    <span className="text-red-600 font-semibold ml-1">
                      ({failureCount} failed)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex items-center gap-2">
          {successCount > 0 && (
            <button
              type="button"
              onClick={onDownloadAllZip}
              disabled={isZipping}
              className="py-2.5 px-4 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider shadow-button transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isZipping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
              <span>{zipButtonText.toUpperCase()}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="py-2.5 px-3.5 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[#111111] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#556275]" />
            <span>{resetButtonText.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics (if compression or stats exist) */}
      {hasReductionStats && (
        <div className="grid grid-cols-3 gap-2.5 bg-[#F3F6FA] p-3.5 rounded-sm border border-[#D5DCE6]">
          <div className="text-center">
            <span className="text-[10px] text-[#556275] font-bold uppercase tracking-wider block">
              Total Original
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#111111] font-mono">
              {formatBytes(totalOriginalBytes)}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-[#2860E8] font-bold uppercase tracking-wider block">
              Total Output
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#2860E8] font-mono">
              {formatBytes(totalResultBytes)}
            </span>
          </div>

          <div className="text-center bg-emerald-50 rounded-xs border border-emerald-200 py-1 flex flex-col justify-center">
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
              Overall Saved
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-800 font-mono">
              {totalReductionPercent > 0 ? `-${totalReductionPercent}%` : "OPTIMIZED"}
            </span>
          </div>
        </div>
      )}

      {/* Individual File Results List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-2">
          <span>Processed Files</span>
          <span className="text-[11px] font-mono font-semibold text-[#556275]">
            ({results.length})
          </span>
        </h4>

        <div className="divide-y divide-[#D5DCE6] border border-[#D5DCE6] rounded-sm max-h-[460px] overflow-y-auto">
          {results.map((item) => {
            const isPdf = item.originalFileName.toLowerCase().endsWith(".pdf");

            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#F3F6FA]/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  {/* Thumbnail / Icon */}
                  {item.previewUrl ? (
                    <div className="w-10 h-10 rounded-sm overflow-hidden border border-[#D5DCE6] bg-slate-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                        item.status === "error"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-[#F3F6FA] text-[#2860E8] border-[#D5DCE6]"
                      }`}
                    >
                      {item.status === "error" ? (
                        <XCircle className="w-5 h-5" />
                      ) : isPdf ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-[#111111] truncate max-w-xs sm:max-w-md">
                        {item.downloadFileName || item.originalFileName}
                      </span>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                            item.badgeType === "warning"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : item.badgeType === "error"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Error message or metrics */}
                    {item.status === "error" ? (
                      <p className="text-[11px] text-red-600 font-medium mt-0.5">
                        {item.error || "Failed to process file"}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-[#556275] flex-wrap mt-0.5 font-mono">
                        {item.originalSize !== undefined && (
                          <span>Orig: {formatBytes(item.originalSize)}</span>
                        )}
                        {item.resultSize !== undefined && (
                          <span className="font-bold text-[#2860E8]">
                            New: {formatBytes(item.resultSize)}
                          </span>
                        )}
                        {item.reductionPercent !== undefined && (
                          <span className="text-emerald-700 font-bold">
                            (-{item.reductionPercent}%)
                          </span>
                        )}
                        {item.details && (
                          <span className="font-sans text-[#556275]">{item.details}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual Download Button */}
                {item.status === "success" && (
                  <button
                    type="button"
                    onClick={item.onDownload}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-sm border border-[#2860E8] text-[#2860E8] hover:bg-[#2860E8] hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FlarePrint Kiosk physical print hook */}
      {showPrintHook && (
        <div className="pt-3 border-t border-[#D5DCE6] flex items-center justify-between text-xs text-[#556275]">
          <div className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-[#556275]" />
            <span>Need physical printouts?</span>
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
