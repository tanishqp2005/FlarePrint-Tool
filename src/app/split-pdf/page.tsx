"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { BatchFileList, BatchFileItem } from "@/components/BatchFileList";
import { BatchProgress } from "@/components/BatchProgress";
import { BatchResultsView, BatchResultItem } from "@/components/BatchResultsView";
import { formatBytes, downloadBlob, yieldToEventLoop } from "@/lib/utils";
import { splitPdfFile, SplitResultFile } from "@/lib/pdf-utils";
import { createZipBundle, ZipFileItem } from "@/lib/zip-utils";
import { PDFDocument } from "pdf-lib";
import {
  Scissors,
  Loader2,
  FileText,
  Settings2,
  Info,
  FileDown,
} from "lucide-react";

interface SplitPdfItem extends BatchFileItem {
  pageCount?: number;
}

interface ProcessedSplitRecord {
  id: string;
  originalFileName: string;
  baseName: string;
  results: SplitResultFile[];
  status: "success" | "error";
  error?: string;
}

export default function SplitPdfPage() {
  const [fileItems, setFileItems] = useState<SplitPdfItem[]>([]);
  const [splitMode, setSplitMode] = useState<"all" | "ranges">("all");
  const [customRange, setCustomRange] = useState<string>("1-2, 3");

  // Batch progress state
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  // Results state
  const [processedRecords, setProcessedRecords] = useState<ProcessedSplitRecord[] | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    const newItems: SplitPdfItem[] = [];

    for (const file of newFiles) {
      const id = Math.random().toString(36).substring(2, 9);
      try {
        const ab = await file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const count = doc.getPageCount();
        newItems.push({
          id,
          file,
          pageCount: count,
          extraInfo: `${count} ${count === 1 ? "page" : "pages"}`,
        });
      } catch {
        newItems.push({
          id,
          file,
          extraInfo: "PDF",
        });
      }
    }

    setFileItems((prev) => [...prev, ...newItems]);
    setProcessedRecords(null);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFileItems([]);
    setProcessedRecords(null);
  };

  const executeBatchSplit = async () => {
    if (fileItems.length === 0) return;
    setProcessing(true);
    setProcessedRecords(null);
    setCurrentFileIndex(0);
    setOverallPercent(0);

    const records: ProcessedSplitRecord[] = [];
    const total = fileItems.length;

    for (let i = 0; i < total; i++) {
      const item = fileItems[i];
      setCurrentFileIndex(i + 1);
      setCurrentFileName(item.file.name);
      setProgressStatus(`Analyzing structure...`);
      setOverallPercent(Math.round((i / total) * 100));

      const baseName = item.file.name.replace(/\.pdf$/i, "");

      try {
        const splitList = await splitPdfFile(
          item.file,
          splitMode,
          customRange,
          (percent, status) => {
            const stepOverall = Math.round(((i + percent / 100) / total) * 100);
            setOverallPercent(stepOverall);
            setProgressStatus(status);
          }
        );

        records.push({
          id: item.id,
          originalFileName: item.file.name,
          baseName,
          results: splitList,
          status: "success",
        });
      } catch (err: any) {
        records.push({
          id: item.id,
          originalFileName: item.file.name,
          baseName,
          results: [],
          status: "error",
          error: err.message || "Failed to split PDF document",
        });
      }

      await yieldToEventLoop();
    }

    setOverallPercent(100);
    setProcessedRecords(records);
    setProcessing(false);
  };

  const handleDownloadSinglePdfResult = async (record: ProcessedSplitRecord) => {
    if (record.results.length === 0) return;

    if (record.results.length === 1) {
      downloadBlob(record.results[0].data, record.results[0].filename, "application/pdf");
    } else {
      const zipItems: ZipFileItem[] = record.results.map((r) => ({
        name: r.filename,
        data: r.data,
      }));
      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, `${record.baseName}_split.zip`, "application/zip");
    }
  };

  const handleDownloadAllZip = async () => {
    if (!processedRecords) return;
    const allSuccessful = processedRecords.filter((r) => r.status === "success" && r.results.length > 0);
    if (allSuccessful.length === 0) return;

    if (allSuccessful.length === 1 && allSuccessful[0].results.length === 1) {
      handleDownloadSinglePdfResult(allSuccessful[0]);
      return;
    }

    setIsZipping(true);
    try {
      const zipItems: ZipFileItem[] = [];
      const isMultiplePdfs = allSuccessful.length > 1;

      for (const record of allSuccessful) {
        for (const fileItem of record.results) {
          const pathInZip = isMultiplePdfs
            ? `${record.baseName}/${fileItem.filename}`
            : fileItem.filename;
          zipItems.push({
            name: pathInZip,
            data: fileItem.data,
          });
        }
      }

      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, "FlarePrint_Split_PDFs.zip", "application/zip");
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    setFileItems([]);
    setProcessedRecords(null);
    setProcessing(false);
    setOverallPercent(0);
  };

  const batchResultItems: BatchResultItem[] = (processedRecords || []).map((r) => {
    const totalBytes = r.results.reduce((acc, f) => acc + f.data.byteLength, 0);
    return {
      id: r.id,
      originalFileName: r.originalFileName,
      downloadFileName:
        r.results.length === 1
          ? r.results[0].filename
          : `${r.baseName}_split.zip`,
      resultSize: totalBytes > 0 ? totalBytes : undefined,
      status: r.status,
      error: r.error,
      badge:
        r.status === "error"
          ? "FAILED"
          : `${r.results.length} ${r.results.length === 1 ? "FILE" : "FILES"} CREATED`,
      badgeType: r.status === "error" ? "error" : "success",
      details: `${r.results.length} extracted PDF parts`,
      onDownload: () => handleDownloadSinglePdfResult(r),
    };
  });

  return (
    <ToolLayout
      category="PDF Utilities"
      title="Split PDF"
      description="Separate your PDF documents into individual pages or extract custom page ranges into standalone PDF files."
    >
      {/* 1. Upload Dropzone */}
      {fileItems.length === 0 && !processedRecords && (
        <Dropzone
          accept=".pdf,application/pdf"
          multiple={true}
          title="Drop your PDF files here"
          buttonText="Choose PDF Files"
          helperText="Upload single or multiple PDF documents up to 50 MB each"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. Files Selected - List & Settings */}
      {fileItems.length > 0 && !processedRecords && (
        <div className="space-y-6 max-w-xl mx-auto">
          {/* File list */}
          <BatchFileList
            files={fileItems}
            accept=".pdf,application/pdf"
            onAddFiles={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            disabled={processing}
          />

          {/* Configuration Form */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-7 shadow-flare space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
                Splitting Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setSplitMode("all")}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    splitMode === "all"
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wider">
                    Extract All Pages
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      splitMode === "all" ? "text-white/80" : "text-[#556275]"
                    }`}
                  >
                    Separates every page of each document into its own PDF.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setSplitMode("ranges")}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    splitMode === "ranges"
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wider">
                    Custom Page Ranges
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      splitMode === "ranges" ? "text-white/80" : "text-[#556275]"
                    }`}
                  >
                    Extract specific pages or segments (e.g. 1-2, 3).
                  </p>
                </button>
              </div>

              {/* Custom Range Input */}
              {splitMode === "ranges" && (
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Page Ranges
                  </label>
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    disabled={processing}
                    placeholder="e.g. 1-2, 3"
                    className="w-full px-3 py-2 text-xs font-bold rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8]"
                  />
                  <div className="flex items-start gap-1.5 text-[11px] text-[#556275]">
                    <Info className="w-3.5 h-3.5 text-[#2860E8] flex-shrink-0 mt-0.5" />
                    <span>
                      Use commas to separate parts and hyphens for intervals (e.g. &ldquo;1-3, 5&rdquo;). This configuration will be applied to each PDF in the batch.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            {!processing && (
              <button
                type="button"
                onClick={executeBatchSplit}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                <span>
                  {fileItems.length === 1
                    ? "SPLIT PDF"
                    : `SPLIT ${fileItems.length} PDFS`}
                </span>
              </button>
            )}
          </div>

          {/* Progress Component */}
          {processing && (
            <BatchProgress
              current={currentFileIndex}
              total={fileItems.length}
              overallPercent={overallPercent}
              currentFileName={currentFileName}
              statusMessage={progressStatus}
            />
          )}
        </div>
      )}

      {/* 3. Results View */}
      {processedRecords && (
        <div className="space-y-6">
          <BatchResultsView
            title="PDF Splitting Complete"
            results={batchResultItems}
            onDownloadAllZip={handleDownloadAllZip}
            isZipping={isZipping}
            zipButtonText="Download All as ZIP"
            onReset={handleReset}
            resetButtonText="Split More PDFs"
          />
        </div>
      )}
    </ToolLayout>
  );
}
