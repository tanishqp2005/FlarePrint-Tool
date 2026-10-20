"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import {
  compressPdfToTarget,
  CompressPdfResult,
  PdfCompressionMode,
} from "@/lib/pdf-utils";
import {
  FileDown,
  FileText,
  Loader2,
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

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPresetBytes, setSelectedPresetBytes] = useState<number>(500 * 1024);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState<string>("500");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");
  const [mode, setMode] = useState<PdfCompressionMode>("strong");

  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
      // If file is smaller than default 500KB preset, pick a lower preset or 100KB
      if (files[0].size < 500 * 1024) {
        setSelectedPresetBytes(100 * 1024);
      }
    }
  };

  const getTargetSizeBytes = (): number => {
    if (!isCustom) return selectedPresetBytes;
    const val = parseFloat(customValue) || 100;
    return customUnit === "KB" ? val * 1024 : val * 1024 * 1024;
  };

  const executeCompression = async (targetMode: PdfCompressionMode) => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgressPercent(10);
    setProgressStatus("Preparing PDF for compression...");

    try {
      const target = getTargetSizeBytes();
      const compressResult = await compressPdfToTarget(file, target, {
        mode: targetMode,
        onProgress: (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        },
      });
      setResult(compressResult);
    } catch (err: any) {
      setError(err.message || "Failed to process PDF compression");
    } finally {
      setProcessing(false);
    }
  };

  const handleCompress = () => executeCompression(mode);

  const handleRecompressWithRasterization = () => {
    setMode("strong");
    executeCompression("strong");
  };

  const handleRetryWithMaximum = () => {
    setMode("maximum");
    executeCompression("maximum");
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const newName = file.name.replace(/\.pdf$/i, "_compressed.pdf");
    downloadBlob(result.data, newName, "application/pdf");
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <ToolLayout
      category="PDF Utilities"
      title="Compress PDF"
      description="Reduce PDF file size as close as possible to your desired target size while preserving vector typography and document structure."
    >
      {/* 1. Upload Dropzone */}
      {!file && !result && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          buttonText="Choose PDF File"
          helperText="Standard PDF documents up to 50 MB"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration & Processing */}
      {file && !result && (
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
                Original size: <span className="font-bold text-[#111111] font-mono">{formatBytes(file.size)}</span>
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

          {/* Configuration - Target Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
                Select Target File Size
              </label>
            </div>

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

          {/* Compression Mode Selector */}
          <div className="space-y-2 pt-2 border-t border-[#D5DCE6]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2860E8]" />
              Compression Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={processing}
                onClick={() => setMode("balanced")}
                className={`py-2 px-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                  mode === "balanced"
                    ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                    : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                }`}
              >
                Balanced
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => setMode("strong")}
                className={`py-2 px-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                  mode === "strong"
                    ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                    : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                }`}
              >
                Strong
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => setMode("maximum")}
                className={`py-2 px-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all text-center ${
                  mode === "maximum"
                    ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                    : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                }`}
              >
                Maximum
              </button>
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
                  Notice: If rasterization is required to meet your target, pages are flattened into compressed images. Selectable text and vector paths will be converted to image format.
                </span>
              </div>
            )}
          </div>

          {/* Progress state */}
          {processing && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-[#556275] font-semibold">
                <span className="flex items-center gap-1.5 truncate max-w-[80%]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2860E8] flex-shrink-0" />
                  <span className="truncate">{progressStatus}</span>
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

          {/* Action button */}
          {!processing && (
            <button
              onClick={handleCompress}
              className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>COMPRESS PDF</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Result State */}
      {result && file && (
        <div className="space-y-6">
          <ResultCard
            title={result.targetAchieved ? "PDF Compressed" : "Optimization Completed"}
            filename={file.name}
            originalSize={result.originalSize}
            resultSize={result.resultSize}
            reductionPercent={result.reductionPercent}
            targetSize={result.targetSize}
            targetAchieved={result.targetAchieved}
            methodUsed={result.methodUsed}
            recommendation={result.recommendation}
            warningNote={result.warningNote}
            onDownload={handleDownload}
            onReset={handleReset}
            resetButtonText="Compress another PDF"
            onAction={
              !result.targetAchieved
                ? mode === "balanced"
                  ? handleRecompressWithRasterization
                  : mode === "strong"
                  ? handleRetryWithMaximum
                  : undefined
                : undefined
            }
            actionText={
              mode === "balanced"
                ? "Enable Rasterization & Re-compress"
                : "Try Maximum Compression Mode"
            }
            extraStats={[
              { label: "Target", value: formatBytes(result.targetSize) },
              { label: "Pages", value: `${result.totalPages}` },
            ]}
          />

          {/* Visual Quality Preview (if first page was rasterized) */}
          {result.previewUrl && (
            <div className="max-w-xl mx-auto bg-white border border-[#D5DCE6] rounded-sm p-5 shadow-flare space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#2860E8]" />
                Page 1 Quality Preview
              </h4>
              <div className="rounded-sm overflow-hidden border border-[#D5DCE6] max-h-80 flex items-center justify-center bg-[#F3F6FA]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.previewUrl}
                  alt="Page 1 preview"
                  className="max-h-80 max-w-full object-contain"
                />
              </div>
              <p className="text-[11px] text-[#556275] text-center font-mono">
                Rendered at {result.dpi || 72} DPI • Output: {formatBytes(result.resultSize)}
              </p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
