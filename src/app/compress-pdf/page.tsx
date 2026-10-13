"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { compressPdfToTarget, CompressPdfResult } from "@/lib/pdf-utils";
import { FileDown, FileText, Loader2, Settings2, Info, CheckCircle2 } from "lucide-react";

interface Preset {
  label: string;
  bytes: number;
}

const PRESETS: Preset[] = [
  { label: "100 KB", bytes: 100 * 1024 },
  { label: "200 KB", bytes: 200 * 1024 },
  { label: "500 KB", bytes: 500 * 1024 },
  { label: "1 MB", bytes: 1024 * 1024 },
];

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedPresetBytes, setSelectedPresetBytes] = useState<number>(500 * 1024);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState<string>("500");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");

  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("Analyzing PDF...");
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
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
    setProgressPercent(15);
    setProgressStatus("Analyzing PDF...");

    try {
      const target = getTargetSizeBytes();
      const compressResult = await compressPdfToTarget(
        file,
        target,
        (percent, status) => {
          setProgressPercent(percent);
          if (percent < 35) {
            setProgressStatus("Analyzing PDF...");
          } else if (percent < 85) {
            setProgressStatus("Optimizing document...");
          } else {
            setProgressStatus("Preparing download...");
          }
        }
      );
      setProgressStatus("Preparing download...");
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
      title="Compress PDF"
      description="Reduce PDF file size to your exact target in KB or MB with client-side optimization."
    >
      {/* 1. Upload Dropzone */}
      {!file && !result && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your file here"
          buttonText="or browse files"
          helperText="PDF documents up to 50 MB"
          formatBadges={["PDF"]}
          maxSizeBytes={50 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration & Processing */}
      {file && !result && (
        <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6 max-w-xl mx-auto">
          {/* File summary card: Filename, File type, Original size, Status */}
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
                    <span>PDF Document</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{formatBytes(file.size)}</span>
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
                Ready to compress
              </span>
            </div>
          </div>

          {/* Configuration - Modern Segmented Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4 text-blue-600" />
                Target File Size
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {isCustom ? "Custom Target" : "Preset"}
              </span>
            </div>

            {/* Segmented Control Bar */}
            <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-5 gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    setSelectedPresetBytes(preset.bytes);
                    setIsCustom(false);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all truncate ${
                    !isCustom && selectedPresetBytes === preset.bytes
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <button
                type="button"
                disabled={processing}
                onClick={() => setIsCustom(true)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all truncate ${
                  isCustom
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Input */}
            {isCustom && (
              <div className="pt-2 flex items-center gap-2 animate-in fade-in duration-150">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  disabled={processing}
                  className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-mono"
                  placeholder="Target size"
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as "KB" | "MB")}
                  disabled={processing}
                  className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
            )}

            {/* Technical note */}
            <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Compressibility depends on document contents. Scanned documents and high-resolution images compress significantly; pure vector text and pre-optimized documents have less compressible data.
              </p>
            </div>
          </div>

          {/* Honest Animated Progress State */}
          {processing && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {progressStatus}
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

          {/* Action Button */}
          {!processing && (
            <button
              onClick={handleCompress}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
            >
              <FileDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              <span>Compress PDF</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Result State */}
      {result && file && (
        <ResultCard
          title="Compression complete"
          filename={file.name}
          originalSize={result.originalSize}
          resultSize={result.resultSize}
          reductionPercent={result.reductionPercent}
          targetSize={result.targetSize}
          targetAchieved={result.targetAchieved}
          recommendation={result.recommendation}
          onDownload={handleDownload}
          onReset={handleReset}
          downloadButtonText="Download PDF"
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
