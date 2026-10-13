"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { compressJpgToTarget, CompressImageResult } from "@/lib/image-utils";
import { ImageIcon, Loader2, Settings2, Eye, CheckCircle2 } from "lucide-react";

interface Preset {
  label: string;
  bytes: number;
}

const PRESETS: Preset[] = [
  { label: "50 KB", bytes: 50 * 1024 },
  { label: "100 KB", bytes: 100 * 1024 },
  { label: "200 KB", bytes: 200 * 1024 },
  { label: "500 KB", bytes: 500 * 1024 },
  { label: "1 MB", bytes: 1024 * 1024 },
];

export default function CompressJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPresetBytes, setSelectedPresetBytes] = useState<number>(100 * 1024);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState<string>("100");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");

  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("Analyzing image...");
  const [result, setResult] = useState<CompressImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
      if (selected.size < 200 * 1024) {
        setSelectedPresetBytes(50 * 1024);
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
    setProgressStatus("Optimizing image quality...");

    try {
      const target = getTargetSizeBytes();
      const res = await compressJpgToTarget(file, target, (p) => {
        setProgressPercent(p);
        if (p < 50) {
          setProgressStatus("Optimizing image quality...");
        } else {
          setProgressStatus("Encoding JPEG output...");
        }
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to compress image");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const ext = file.name.split(".").pop() || "jpg";
    const newName = file.name.replace(new RegExp(`\\.${ext}$`, "i"), "_compressed.jpg");
    downloadBlob(result.blob, newName, "image/jpeg");
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <ToolLayout
      category="Compress & Resize"
      title="Compress JPG"
      description="Reduce image file size to your exact target in KB or MB with automatic quality preservation."
    >
      {/* 1. Upload Dropzone */}
      {!file && !result && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          title="Drop your file here"
          buttonText="or browse files"
          helperText="JPG, JPEG and PNG images up to 25 MB"
          formatBadges={["JPG", "PNG"]}
          maxSizeBytes={25 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration */}
      {file && !result && (
        <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6 max-w-xl mx-auto">
          {/* File summary & thumbnail */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                {previewUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Original preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Image</span>
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

          {/* Preset Segmented Control */}
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

            <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-6 gap-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    setSelectedPresetBytes(preset.bytes);
                    setIsCustom(false);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all truncate ${
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
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all truncate ${
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
                  min="5"
                  max="50000"
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
          </div>

          {/* Processing State */}
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

          {/* Action button */}
          {!processing && (
            <button
              onClick={handleCompress}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
            >
              <ImageIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Compress Image</span>
            </button>
          )}
        </div>
      )}

      {/* 3. Result State */}
      {result && file && (
        <div className="space-y-6">
          <ResultCard
            title="Compression complete"
            filename={file.name}
            originalSize={result.originalSize}
            resultSize={result.resultSize}
            reductionPercent={result.reductionPercent}
            targetSize={result.targetSize}
            targetAchieved={result.targetAchieved}
            onDownload={handleDownload}
            onReset={handleReset}
            downloadButtonText="Download JPG"
            resetButtonText="Compress another image"
            extraStats={[
              { label: "Target", value: formatBytes(result.targetSize) },
              { label: "Dimensions", value: `${result.width}×${result.height} px` },
            ]}
          />

          {/* Before & After visual comparison */}
          <div className="max-w-xl mx-auto bg-white border border-border rounded-3xl p-6 shadow-card space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              Before / After Comparison
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Original</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-900/5 flex items-center justify-center">
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Before"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* After */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="text-blue-600">Compressed</span>
                  <span className="font-bold text-slate-900">{formatBytes(result.resultSize)}</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-blue-200 aspect-[4/3] bg-blue-50/20 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.previewUrl}
                    alt="After"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-mono pt-1">
              Output: {result.width} × {result.height} px • {result.reductionPercent}% saved
            </p>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
