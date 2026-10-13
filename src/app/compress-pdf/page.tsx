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
  const [mode, setMode] = useState<PdfCompressionMode>("balanced");

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
      category="Compress & Resize"
      title="Compress PDF to Target Size"
      description="Reduce your PDF file size as close as possible to your desired target size while preserving document fidelity."
    >
      {/* 1. Upload Dropzone */}
      {!file && !result && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          buttonText="Choose PDF"
          helperText="Standard PDF documents up to 50 MB"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration & Processing */}
      {file && !result && (
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6 max-w-xl mx-auto">
          {/* File summary */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-slate-800 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Original size: <span className="font-medium text-slate-700">{formatBytes(file.size)}</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={processing}
              className="text-xs text-slate-400 hover:text-red-600 font-medium transition-colors"
            >
              Change
            </button>
          </div>

          {/* Configuration - Target Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-blue-600" />
                Select Target File Size
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    setSelectedPresetBytes(preset.bytes);
                    setIsCustom(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    !isCustom && selectedPresetBytes === preset.bytes
                      ? "bg-blue-600 text-white border-blue-600 shadow-button"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <button
                type="button"
                disabled={processing}
                onClick={() => setIsCustom(true)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                  isCustom
                    ? "bg-blue-600 text-white border-blue-600 shadow-button"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-slate-50"
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
                  className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  placeholder="Target size"
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as "KB" | "MB")}
                  disabled={processing}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
            )}
          </div>

          {/* Compression Mode Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Compression Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={processing}
                onClick={() => setMode("balanced")}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  mode === "balanced"
                    ? "bg-blue-600 text-white border-blue-600 shadow-button"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                Balanced
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => setMode("strong")}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  mode === "strong"
                    ? "bg-blue-600 text-white border-blue-600 shadow-button"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                Strong
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => setMode("maximum")}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  mode === "maximum"
                    ? "bg-blue-600 text-white border-blue-600 shadow-button"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                Maximum
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {mode === "balanced" &&
                "Preserves selectable text, fonts, and vector graphics. Optimizes object streams and embedded raster photos."}
              {mode === "strong" &&
                "Aggressive compression. Automatically uses page rasterization fallback if vector optimization alone cannot reach the target."}
              {mode === "maximum" &&
                "Prioritizes meeting the target size at all costs. Tests down to 50 DPI and lower quality where needed."}
            </p>

            {mode !== "balanced" && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-800 leading-relaxed">
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
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 truncate max-w-[80%]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 flex-shrink-0" />
                  <span className="truncate">{progressStatus}</span>
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Action button */}
          {!processing && (
            <button
              onClick={handleCompress}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Compress PDF</span>
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
              !result.targetAchieved && mode === "balanced"
                ? handleRecompressWithRasterization
                : undefined
            }
            actionText="Enable Rasterization & Re-compress"
            extraStats={[
              { label: "Target", value: formatBytes(result.targetSize) },
              { label: "Pages", value: `${result.totalPages}` },
            ]}
          />

          {/* Visual Quality Preview (if first page was rasterized) */}
          {result.previewUrl && (
            <div className="max-w-xl mx-auto bg-white border border-border rounded-2xl p-5 shadow-card space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Page 1 Quality Preview
              </h4>
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 flex items-center justify-center bg-slate-900/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.previewUrl}
                  alt="Page 1 preview"
                  className="max-h-80 max-w-full object-contain shadow-xs"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Rendered at {result.dpi || 72} DPI • Output: {formatBytes(result.resultSize)}
              </p>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
