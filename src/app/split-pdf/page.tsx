"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { splitPdfFile, SplitResultFile } from "@/lib/pdf-utils";
import { createZipBundle } from "@/lib/zip-utils";
import { PDFDocument } from "pdf-lib";
import { Scissors, Loader2, FileText, Settings2, Info, CheckCircle2, AlertCircle } from "lucide-react";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<"all" | "ranges">("all");
  const [customRange, setCustomRange] = useState<string>("1-2, 3");

  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");

  const [results, setResults] = useState<SplitResultFile[] | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setResults(null);
    setZipBlob(null);
    setError(null);

    try {
      const ab = await selected.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);

      // Suggest initial range based on page count
      if (count > 2) {
        setCustomRange(`1-2, 3`);
      } else {
        setCustomRange("1");
      }
    } catch (err: any) {
      setError(err.message || "Failed to inspect PDF structure");
    }
  };

  // Calculate estimated output structure & count
  const outputInfo = useMemo(() => {
    if (splitMode === "all") {
      return {
        count: totalPages,
        structure: `${totalPages} single-page PDF files`,
        isValid: totalPages > 0,
      };
    }

    // Parse custom range: e.g. "1-2, 3, 4-6"
    const parts = customRange.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      return { count: 0, structure: "Please enter page ranges", isValid: false };
    }

    let valid = true;
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          valid = false;
        }
      } else {
        const page = parseInt(part);
        if (isNaN(page) || page < 1 || page > totalPages) {
          valid = false;
        }
      }
    }

    return {
      count: parts.length,
      structure: valid
        ? `${parts.length} separate PDF document${parts.length === 1 ? "" : "s"} (${parts.join(", ")})`
        : "Invalid range specified for this document",
      isValid: valid,
    };
  }, [splitMode, customRange, totalPages]);

  const handleSplit = async () => {
    if (!file || !outputInfo.isValid) return;
    setProcessing(true);
    setError(null);
    setProgressPercent(15);
    setProgressStatus("Preparing PDF extraction engine...");

    try {
      const filesList = await splitPdfFile(
        file,
        splitMode,
        customRange,
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );

      setResults(filesList);

      // If more than 1 file, bundle into a zip archive
      if (filesList.length > 1) {
        setProgressStatus("Packaging into ZIP archive...");
        const zip = await createZipBundle(
          filesList.map((f) => ({ name: f.filename, data: f.data }))
        );
        setZipBlob(zip);
      } else {
        setZipBlob(null);
      }

      setProgressPercent(100);
      setProgressStatus("Done!");
    } catch (err: any) {
      setError(err.message || "Failed to split PDF document");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!results || results.length === 0 || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");

    if (results.length === 1) {
      downloadBlob(results[0].data, results[0].filename, "application/pdf");
    } else if (zipBlob) {
      downloadBlob(zipBlob, `${baseName}_split.zip`, "application/zip");
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setResults(null);
    setZipBlob(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <ToolLayout
      category="Organize"
      title="Split PDF"
      description="Separate your PDF into individual pages or extract custom page ranges into standalone PDF documents."
    >
      {/* 1. Dropzone */}
      {!file && !results && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your file here"
          buttonText="or browse files"
          helperText="Standard PDF documents up to 50 MB"
          formatBadges={["PDF"]}
          maxSizeBytes={50 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration */}
      {file && !results && (
        <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6 max-w-xl mx-auto">
          {/* File summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-800">{totalPages} {totalPages === 1 ? "page" : "pages"}</span>
                    <span>•</span>
                    <span>{formatBytes(file.size)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                disabled={processing}
                className="text-xs text-slate-400 hover:text-red-600 font-semibold px-2 py-1 rounded-md transition-colors flex-shrink-0"
              >
                Change
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ready to split
              </span>
            </div>
          </div>

          {/* Split Mode Selector */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-blue-600" />
              Choose Splitting Method
            </label>

            {/* Segmented Mode Selector */}
            <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setSplitMode("all")}
                className={`p-3.5 rounded-xl text-left transition-all ${
                  splitMode === "all"
                    ? "bg-white text-blue-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className="font-bold text-sm block">Split Every Page</span>
                <span className="text-xs text-slate-500 mt-0.5 block font-normal">
                  Extract {totalPages} separate 1-page PDFs
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode("ranges")}
                className={`p-3.5 rounded-xl text-left transition-all ${
                  splitMode === "ranges"
                    ? "bg-white text-blue-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className="font-bold text-sm block">Custom Page Ranges</span>
                <span className="text-xs text-slate-500 mt-0.5 block font-normal">
                  Specify ranges (e.g. 1-2, 3, 4-6)
                </span>
              </button>
            </div>

            {/* Range input if ranges mode */}
            {splitMode === "ranges" && (
              <div className="pt-1 space-y-2 animate-in fade-in duration-150">
                <label className="text-xs font-semibold text-slate-700 block">
                  Page Ranges or Single Pages (Example: <span className="font-mono text-blue-600">1-2, 3, 4-6</span>)
                </label>
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder="e.g. 1-2, 3, 4-6"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border font-mono focus:outline-none focus:ring-2 ${
                    outputInfo.isValid
                      ? "border-slate-200 focus:ring-blue-600/30 focus:border-blue-600"
                      : "border-red-300 bg-red-50/30 text-red-900 focus:ring-red-500/30 focus:border-red-500"
                  }`}
                />

                {!outputInfo.isValid && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Please enter valid page numbers between 1 and {totalPages}.</span>
                  </div>
                )}
              </div>
            )}

            {/* Output Structure & Summary Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1 text-xs text-blue-900">
              <div className="flex items-center justify-between font-semibold">
                <span>Output Documents:</span>
                <span className="font-bold text-blue-700 font-mono">
                  {outputInfo.count} {outputInfo.count === 1 ? "file" : "files"}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Structure: <span className="font-mono text-slate-800">{outputInfo.structure}</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {processing && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {progressStatus || "Splitting PDF..."}
                </span>
                <span className="font-mono text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full animate-progress-stripe"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Split action */}
          {!processing && (
            <button
              onClick={handleSplit}
              disabled={!outputInfo.isValid}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
            >
              <Scissors className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Split PDF</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Result State */}
      {results && file && (
        <ResultCard
          title="Processing complete"
          filename={
            results.length > 1
              ? `${file.name.replace(/\.pdf$/i, "")}_split.zip`
              : results[0].filename
          }
          resultSize={
            zipBlob ? zipBlob.size : results[0]?.data.byteLength
          }
          onDownload={handleDownload}
          onReset={handleReset}
          downloadButtonText={results.length > 1 ? "Download ZIP Archive" : "Download PDF"}
          resetButtonText="Split another PDF"
          extraStats={[
            { label: "PDFs Created", value: `${results.length}` },
            { label: "Source Pages", value: `${totalPages}` },
          ]}
        />
      )}
    </ToolLayout>
  );
}
