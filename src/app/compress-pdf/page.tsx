"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { compressPdfToTarget, CompressPdfResult } from "@/lib/pdf-utils";
import { FileDown, FileText, Loader2, Settings2, Info } from "lucide-react";

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

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setProgressPercent(10);
    setProgressStatus("Preparing PDF for compression...");

    try {
      const target = getTargetSizeBytes();
      const compressResult = await compressPdfToTarget(
        file,
        target,
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );
      setResult(compressResult);
    } catch (err: any) {
      setError(err.message || "Failed to process PDF compression");
    } finally {
      setProcessing(false);
    }
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

            {/* Technical note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Compression efficiency depends on document content. Scanned documents and embedded images compress significantly; purely vector text or pre-optimized PDFs have less compressible redundancy.
              </p>
            </div>
          </div>

          {/* Progress state */}
          {processing && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {progressStatus}
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
        <ResultCard
          title="PDF Compressed"
          filename={file.name}
          originalSize={result.originalSize}
          resultSize={result.resultSize}
          reductionPercent={result.reductionPercent}
          targetSize={result.targetSize}
          targetAchieved={result.targetAchieved}
          recommendation={result.recommendation}
          onDownload={handleDownload}
          onReset={handleReset}
          resetButtonText="Compress another PDF"
          extraStats={[
            { label: "Target", value: formatBytes(result.targetSize) },
            { label: "Pages", value: `${result.totalPages}` },
          ]}
        />
      )}
    </ToolLayout>
  );
}
