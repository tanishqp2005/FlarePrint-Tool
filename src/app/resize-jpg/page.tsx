"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { getImageDimensions, resizeImage } from "@/lib/image-utils";
import { Scaling, Lock, Unlock, Loader2, Sparkles, SlidersHorizontal } from "lucide-react";

interface PresetDimension {
  label: string;
  width: number;
  height: number;
}

const COMMON_PRESETS: PresetDimension[] = [
  { label: "Full HD (1920×1080)", width: 1920, height: 1080 },
  { label: "Square (1080×1080)", width: 1080, height: 1080 },
  { label: "Web (1200×800)", width: 1200, height: 800 },
  { label: "Email (800×600)", width: 800, height: 600 },
];

export default function ResizeJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<{
    blob: Blob;
    width: number;
    height: number;
    size: number;
    previewUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      try {
        const dims = await getImageDimensions(selected);
        setOriginalWidth(dims.width);
        setOriginalHeight(dims.height);
        setWidth(dims.width);
        setHeight(dims.height);
      } catch (err: any) {
        setError("Could not read image dimensions: " + err.message);
      }
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  const handleScalePercent = (percent: number) => {
    if (originalWidth > 0 && originalHeight > 0) {
      const w = Math.round(originalWidth * (percent / 100));
      const h = Math.round(originalHeight * (percent / 100));
      setWidth(w);
      setHeight(h);
    }
  };

  const handlePresetSelect = (preset: PresetDimension) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleResize = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setProcessing(true);
    setError(null);

    try {
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      const mime = isPng ? "image/png" : "image/jpeg";
      const res = await resizeImage(file, width, height, mime, 0.92);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to resize image");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const ext = isPng ? "png" : "jpg";
    const base = file.name.replace(/\.[^/.]+$/, "");
    const newName = `${base}_${result.width}x${result.height}.${ext}`;
    downloadBlob(result.blob, newName, isPng ? "image/png" : "image/jpeg");
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <ToolLayout
      category="Compress & Resize"
      title="Resize JPG"
      description="Change image dimensions with bicubic resampling, aspect-ratio preservation, and quick scaling presets."
    >
      {/* 1. Upload Dropzone */}
      {!file && !result && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          title="Drop your image here"
          buttonText="Browse Image"
          helperText="JPG, JPEG and PNG images up to 25 MB"
          formatBadges={["JPG", "PNG"]}
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration */}
      {file && !result && (
        <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6 max-w-xl mx-auto">
          {/* File summary & thumbnail */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            {previewUrl && (
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Original preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-slate-900 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Original: <span className="font-semibold text-slate-800">{originalWidth} × {originalHeight} px</span> • {formatBytes(file.size)}
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={processing}
              className="text-xs text-slate-400 hover:text-red-600 font-semibold px-2 py-1 rounded-md transition-colors"
            >
              Change
            </button>
          </div>

          {/* Dimension Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Target Dimensions
              </label>
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                  lockAspectRatio
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>Lock ratio</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width || ""}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height || ""}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Quick Scale Pills */}
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1.5">
                Quick Scale
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleScalePercent(pct)}
                    className="py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 transition-colors shadow-2xs"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Common Presets */}
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1.5">
                Common Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 text-left transition-colors truncate shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleResize}
            disabled={processing || width <= 0 || height <= 0}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resizing Image...</span>
              </>
            ) : (
              <>
                <Scaling className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Resize Image to {width} × {height} px</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 3. Result State */}
      {result && file && (
        <div className="space-y-6">
          <ResultCard
            title="Image resized"
            filename={`${file.name.replace(/\.[^/.]+$/, "")}_${result.width}x${result.height}`}
            originalSize={file.size}
            resultSize={result.size}
            onDownload={handleDownload}
            onReset={handleReset}
            downloadButtonText="Download Resized Image"
            resetButtonText="Resize another image"
            extraStats={[
              { label: "Original Dims", value: `${originalWidth}×${originalHeight} px` },
              { label: "New Dims", value: `${result.width}×${result.height} px` },
            ]}
          />

          {/* Resized image preview */}
          <div className="max-w-xl mx-auto bg-white border border-border rounded-3xl p-5 shadow-card space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Resized Image Preview
            </h4>
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-80 flex items-center justify-center bg-slate-900/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.previewUrl}
                alt="Resized output"
                className="max-h-80 max-w-full object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center font-mono">
              Rendered at {result.width} × {result.height} px • {formatBytes(result.size)}
            </p>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
