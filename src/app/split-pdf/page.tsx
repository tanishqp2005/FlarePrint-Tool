"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { splitPdfFile, SplitResultFile } from "@/lib/pdf-utils";
import { createZipBundle } from "@/lib/zip-utils";
import { PDFDocument } from "pdf-lib";
import { Scissors, Loader2, FileText, Settings2, Info } from "lucide-react";

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
        setCustomRange(`1-${Math.min(2, count)}, ${Math.min(3, count)}`);
      } else {
        setCustomRange("1");
      }
    } catch (err: any) {
      setError(err.message || "Failed to inspect PDF structure");
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgressPercent(10);
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
      category="PDF Utilities"
      title="Split PDF"
      description="Separate your PDF into individual pages or extract custom page ranges into standalone PDF documents."
    >
      {/* 1. Dropzone */}
      {!file && !results && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          buttonText="Choose PDF File"
          helperText="Standard PDF documents up to 50 MB"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration */}
      {file && !results && (
        <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-8 shadow-flare space-y-6 max-w-xl mx-auto">
          {/* File summary */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-sm bg-[#F3F6FA] border border-[#D5DCE6]">
            <div className="w-10 h-10 rounded-sm bg-white border border-[#D5DCE6] text-[#2860E8] flex items-center justify-center flex-shrink-0 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs uppercase tracking-tight text-[#111111] truncate">
                {file.name}
              </h3>
              <p className="text-[11px] text-[#556275] mt-0.5">
                {totalPages} {totalPages === 1 ? "page" : "pages"} • <span className="font-bold text-[#111111] font-mono">{formatBytes(file.size)}</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={processing}
              className="text-xs text-[#556275] hover:text-red-600 font-bold uppercase tracking-wider transition-colors"
            >
              Change
            </button>
          </div>

          {/* Split Mode Selector */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
              Choose Splitting Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSplitMode("all")}
                className={`p-4 rounded-sm border text-left transition-all ${
                  splitMode === "all"
                    ? "bg-[#EBF1FD] border-[#2860E8] text-[#111111] shadow-xs"
                    : "bg-white border-[#D5DCE6] text-[#556275] hover:bg-[#F3F6FA]"
                }`}
              >
                <span className="font-extrabold text-xs uppercase tracking-wider block text-[#111111]">
                  Split Every Page
                </span>
                <span className="text-[11px] text-[#556275] mt-0.5 block">
                  Generate {totalPages} separate 1-page PDF files
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode("ranges")}
                className={`p-4 rounded-sm border text-left transition-all ${
                  splitMode === "ranges"
                    ? "bg-[#EBF1FD] border-[#2860E8] text-[#111111] shadow-xs"
                    : "bg-white border-[#D5DCE6] text-[#556275] hover:bg-[#F3F6FA]"
                }`}
              >
                <span className="font-extrabold text-xs uppercase tracking-wider block text-[#111111]">
                  Custom Page Ranges
                </span>
                <span className="text-[11px] text-[#556275] mt-0.5 block">
                  Specify exact ranges (e.g. 1-2, 3)
                </span>
              </button>
            </div>

            {/* Range input if ranges mode */}
            {splitMode === "ranges" && (
              <div className="pt-1 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#556275] block">
                  Page Ranges or Single Pages
                </label>
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder="e.g. 1-2, 3, 4-6"
                  className="w-full px-3 py-2 text-xs font-bold rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8] focus:ring-1 focus:ring-[#2860E8] font-mono"
                />
                <div className="flex items-start gap-1.5 text-[11px] text-[#556275]">
                  <Info className="w-3.5 h-3.5 text-[#2860E8] mt-0.5 flex-shrink-0" />
                  <span>
                    Separate with commas. For example: &ldquo;1-2, 3, 4-6&rdquo; creates 3 PDFs (pages 1-2, page 3, pages 4-6). Document has {totalPages} pages.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {processing && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-[#556275] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2860E8]" />
                  {progressStatus}
                </span>
                <span className="font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#F3F6FA] border border-[#D5DCE6] overflow-hidden">
                <div
                  className="h-full bg-[#2860E8] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Split action */}
          {!processing && (
            <button
              onClick={handleSplit}
              className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>SPLIT PDF DOCUMENT</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Result State */}
      {results && file && (
        <ResultCard
          title={results.length > 1 ? "Split PDFs Packaged in ZIP" : "Split PDF Ready"}
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
