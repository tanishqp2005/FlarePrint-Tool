"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { BatchFileList, BatchFileItem } from "@/components/BatchFileList";
import { BatchProgress } from "@/components/BatchProgress";
import { BatchResultsView, BatchResultItem } from "@/components/BatchResultsView";
import { formatBytes, downloadBlob, yieldToEventLoop } from "@/lib/utils";
import {
  compressPdfToTarget,
  CompressPdfResult,
  PdfCompressionMode,
} from "@/lib/pdf-utils";
import { createZipBundle } from "@/lib/zip-utils";
import {
  FileDown,
  Settings2,
  Layers,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Preset {
  label: string;
  bytes: number;
}

const PRESETS: Preset[] = [
  { label: "100 KB", bytes: 100 * 1024 },
  { label: "200 KB", bytes: 200 * 1024 },
  { label: "500 KB", bytes: 500 * 1024 },
  { label: "1 MB", bytes: 1024 * 1024 },
  { label: "2 MB", bytes: 2 * 1024 * 1024 },
];

interface ProcessedPdfRecord {
  id: string;
  originalFile: File;
  downloadFileName: string;
  result?: CompressPdfResult;
  error?: string;
  status: "success" | "error";
}

export default function CompressPdfPage() {
  const [fileItems, setFileItems] = useState<BatchFileItem[]>([]);
  const [selectedPresetBytes, setSelectedPresetBytes] = useState<number>(500 * 1024);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState<string>("500");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");
  const [mode, setMode] = useState<PdfCompressionMode>("strong");

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);
  const [filePercent, setFilePercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  // Results state
  const [processedRecords, setProcessedRecords] = useState<ProcessedPdfRecord[] | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const newItems: BatchFileItem[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
    }));

    setFileItems((prev) => {
      const combined = [...prev, ...newItems];
      // If first file is smaller than default 500KB preset, pick a lower preset
      if (prev.length === 0 && newFiles[0].size < 500 * 1024) {
        setSelectedPresetBytes(100 * 1024);
      }
      return combined;
    });

    setProcessedRecords(null);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFileItems([]);
    setProcessedRecords(null);
  };

  const getTargetSizeBytes = (): number => {
    if (!isCustom) return selectedPresetBytes;
    const val = parseFloat(customValue) || 100;
    return customUnit === "KB" ? val * 1024 : val * 1024 * 1024;
  };

  const executeBatchCompression = async (targetMode: PdfCompressionMode) => {
    if (fileItems.length === 0) return;

    setProcessing(true);
    setProcessedRecords(null);
    setCurrentFileIndex(0);
    setOverallPercent(0);

    const targetBytes = getTargetSizeBytes();
    const records: ProcessedPdfRecord[] = [];
    const total = fileItems.length;

    for (let i = 0; i < total; i++) {
      const item = fileItems[i];
      setCurrentFileIndex(i + 1);
      setCurrentFileName(item.file.name);
      setProgressStatus(`Starting compression...`);
      setFilePercent(5);
      setOverallPercent(Math.round((i / total) * 100));

      const downloadFileName = item.file.name.replace(/\.pdf$/i, "_compressed.pdf");

      try {
        const result = await compressPdfToTarget(item.file, targetBytes, {
          mode: targetMode,
          onProgress: (p, status) => {
            setFilePercent(p);
            setProgressStatus(status);
            const stepOverall = Math.round(((i + (p / 100)) / total) * 100);
            setOverallPercent(stepOverall);
          },
        });

        records.push({
          id: item.id,
          originalFile: item.file,
          downloadFileName,
          result,
          status: "success",
        });
      } catch (err: any) {
        records.push({
          id: item.id,
          originalFile: item.file,
          downloadFileName,
          error: err.message || "Failed to compress PDF",
          status: "error",
        });
      }

      await yieldToEventLoop();
    }

    setOverallPercent(100);
    setProcessedRecords(records);
    setProcessing(false);
  };

  const handleCompress = () => executeBatchCompression(mode);

  const handleDownloadSingle = (record: ProcessedPdfRecord) => {
    if (!record.result) return;
    downloadBlob(record.result.data, record.downloadFileName, "application/pdf");
  };

  const handleDownloadAllZip = async () => {
    if (!processedRecords) return;
    const successful = processedRecords.filter((r) => r.status === "success" && r.result);
    if (successful.length === 0) return;

    if (successful.length === 1) {
      handleDownloadSingle(successful[0]);
      return;
    }

    setIsZipping(true);
    try {
      const zipItems = successful.map((r) => ({
        name: r.downloadFileName,
        data: r.result!.data,
      }));
      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, "FlarePrint_Compressed_PDFs.zip", "application/zip");
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

  // Convert processed records into BatchResultItems for BatchResultsView
  const batchResultItems: BatchResultItem[] = (processedRecords || []).map((r) => ({
    id: r.id,
    originalFileName: r.originalFile.name,
    downloadFileName: r.downloadFileName,
    originalSize: r.originalFile.size,
    resultSize: r.result?.resultSize,
    reductionPercent: r.result?.reductionPercent,
    status: r.status,
    error: r.error,
    badge: r.status === "error"
      ? "FAILED"
      : r.result?.targetAchieved
      ? "TARGET ACHIEVED"
      : "OPTIMIZED",
    badgeType: r.status === "error"
      ? "error"
      : r.result?.targetAchieved
      ? "success"
      : "warning",
    details: r.result
      ? `${r.result.totalPages} pages • ${r.result.methodUsed}`
      : undefined,
    previewUrl: r.result?.previewUrl,
    onDownload: () => handleDownloadSingle(r),
  }));

  // Single file special case for showing the rich ResultCard with preview if exactly 1 file was processed
  const singleRecord =
    processedRecords && processedRecords.length === 1 ? processedRecords[0] : null;

  return (
    <ToolLayout
      category="PDF Utilities"
      title="Compress PDF"
      description="Reduce PDF file size as close as possible to your desired target size while preserving vector typography and document structure."
    >
      {/* 1. Upload Dropzone when empty */}
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

      {/* 2. Files Selected - List & Configuration */}
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
            {/* Target Presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
                Select Target File Size
              </label>

              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      setSelectedPresetBytes(preset.bytes);
                      setIsCustom(false);
                    }}
                    className={`py-2.5 px-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all ${
                      !isCustom && selectedPresetBytes === preset.bytes
                        ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                        : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setIsCustom(true)}
                  className={`py-2.5 px-3 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all ${
                    isCustom
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Input */}
              {isCustom && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    disabled={processing}
                    className="flex-1 px-3 py-2 text-xs font-bold rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8] focus:ring-1 focus:ring-[#2860E8]"
                    placeholder="Target size"
                  />
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as "KB" | "MB")}
                    disabled={processing}
                    className="px-3 py-2 text-xs font-bold rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8]"
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
              )}
            </div>

            {/* Mode Selector */}
            <div className="space-y-2 pt-3 border-t border-[#D5DCE6]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2860E8]" />
                Compression Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["balanced", "strong", "maximum"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={processing}
                    onClick={() => setMode(m)}
                    className={`py-2 px-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all text-center capitalize ${
                      mode === m
                        ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                        : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#556275] leading-relaxed">
                {mode === "balanced" &&
                  "Preserves selectable text, fonts, and vector graphics. Optimizes object streams and embedded raster photos."}
                {mode === "strong" &&
                  "Aggressive compression. Automatically uses page rasterization fallback if vector optimization alone cannot reach the target."}
                {mode === "maximum" &&
                  "Prioritizes meeting the target size at all costs. Tests down to 50 DPI and lower quality where needed."}
              </p>

              {mode !== "balanced" && (
                <div className="flex items-start gap-1.5 p-2.5 rounded-sm bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Notice: If rasterization is required to meet your target, pages are flattened into compressed images.
                  </span>
                </div>
              )}
            </div>

            {/* Action button */}
            {!processing && (
              <button
                type="button"
                onClick={handleCompress}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>
                  {fileItems.length === 1
                    ? "COMPRESS PDF"
                    : `COMPRESS ${fileItems.length} PDFS`}
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
              filePercent={filePercent}
            />
          )}
        </div>
      )}

      {/* 3. Results View */}
      {processedRecords && (
        <div className="space-y-6">
          {singleRecord && singleRecord.status === "success" && singleRecord.result ? (
            // For a single file, present the dedicated ResultCard with Page 1 preview
            <div className="space-y-6">
              <ResultCard
                title={
                  singleRecord.result.targetAchieved
                    ? "PDF Compressed"
                    : "Optimization Completed"
                }
                filename={singleRecord.originalFile.name}
                originalSize={singleRecord.result.originalSize}
                resultSize={singleRecord.result.resultSize}
                reductionPercent={singleRecord.result.reductionPercent}
                targetSize={singleRecord.result.targetSize}
                targetAchieved={singleRecord.result.targetAchieved}
                methodUsed={singleRecord.result.methodUsed}
                recommendation={singleRecord.result.recommendation}
                warningNote={singleRecord.result.warningNote}
                onDownload={() => handleDownloadSingle(singleRecord)}
                onReset={handleReset}
                resetButtonText="Compress more PDFs"
                extraStats={[
                  { label: "Target", value: formatBytes(singleRecord.result.targetSize) },
                  { label: "Pages", value: `${singleRecord.result.totalPages}` },
                ]}
              />

              {singleRecord.result.previewUrl && (
                <div className="max-w-xl mx-auto bg-white border border-[#D5DCE6] rounded-sm p-5 shadow-flare space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#2860E8]" />
                    Page 1 Quality Preview
                  </h4>
                  <div className="rounded-sm overflow-hidden border border-[#D5DCE6] max-h-80 flex items-center justify-center bg-[#F3F6FA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={singleRecord.result.previewUrl}
                      alt="Page 1 preview"
                      className="max-h-80 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-[#556275] text-center font-mono">
                    Rendered at {singleRecord.result.dpi || 72} DPI • Output:{" "}
                    {formatBytes(singleRecord.result.resultSize)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // For multiple files, present the unified BatchResultsView
            <BatchResultsView
              title="PDF Compression Complete"
              results={batchResultItems}
              onDownloadAllZip={handleDownloadAllZip}
              isZipping={isZipping}
              zipButtonText="Download All as ZIP"
              onReset={handleReset}
              resetButtonText="Compress More PDFs"
            />
          )}
        </div>
      )}
    </ToolLayout>
  );
}
