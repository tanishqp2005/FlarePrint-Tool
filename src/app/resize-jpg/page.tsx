"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { getImageDimensions, resizeImage } from "@/lib/image-utils";
import { Scaling, Lock, Unlock, Loader2, Sparkles } from "lucide-react";

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
      category="Image Utilities"
      title="Resize JPG"
      description="Change image dimensions with high-quality bicubic resampling and instant aspect-ratio calculation."
    >
      {/* 1. Dropzone */}
      {!file && !result && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          title="Drop your JPG or PNG here"
          buttonText="Choose Image File"
          helperText="JPG, JPEG, and PNG images up to 25 MB"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File Selected - Configuration */}
      {file && !result && (
        <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-8 shadow-flare space-y-6 max-w-xl mx-auto">
          {/* File summary & thumbnail */}
          <div className="flex items-center gap-4 p-3.5 rounded-sm bg-[#F3F6FA] border border-[#D5DCE6]">
            {previewUrl && (
              <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#D5DCE6] bg-slate-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Original preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs uppercase tracking-tight text-[#111111] truncate">
                {file.name}
              </h3>
              <p className="text-[11px] text-[#556275] mt-0.5">
                Original: <span className="font-bold text-[#111111] font-mono">{originalWidth} × {originalHeight} px</span> • {formatBytes(file.size)}
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

          {/* Dimension Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Custom Dimensions
              </label>
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border flex items-center gap-1.5 transition-colors ${
                  lockAspectRatio
                    ? "bg-[#EBF1FD] text-[#2860E8] border-[#2860E8]/40"
                    : "bg-[#F3F6FA] text-[#556275] border-[#D5DCE6]"
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>Maintain aspect ratio</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#556275] block mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width || ""}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-bold font-mono rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8] focus:ring-1 focus:ring-[#2860E8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#556275] block mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height || ""}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-bold font-mono rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8] focus:ring-1 focus:ring-[#2860E8]"
                />
              </div>
            </div>

            {/* Quick Scale Buttons */}
            <div>
              <span className="text-[11px] text-[#556275] font-bold uppercase tracking-wider block mb-1.5">
                Quick Scale
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleScalePercent(pct)}
                    className="py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[#111111] transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Common presets */}
            <div>
              <span className="text-[11px] text-[#556275] font-bold uppercase tracking-wider block mb-1.5">
                Common Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="py-2 px-3 text-xs font-bold rounded-sm border border-[#D5DCE6] hover:border-[#2860E8] hover:bg-[#EBF1FD]/40 text-[#111111] text-left transition-colors truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleResize}
            disabled={processing || width <= 0 || height <= 0}
            className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resizing Image...</span>
              </>
            ) : (
              <>
                <Scaling className="w-4 h-4" />
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
            title="Image Resized"
            filename={`${file.name.replace(/\.[^/.]+$/, "")}_${result.width}x${result.height}`}
            originalSize={file.size}
            resultSize={result.size}
            onDownload={handleDownload}
            onReset={handleReset}
            resetButtonText="Resize another image"
            extraStats={[
              { label: "Original Dims", value: `${originalWidth}×${originalHeight}` },
              { label: "New Dims", value: `${result.width}×${result.height}` },
            ]}
          />

          {/* Resized image preview */}
          <div className="max-w-xl mx-auto bg-white border border-[#D5DCE6] rounded-sm p-5 shadow-flare space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2860E8]" />
              Resized Image Preview
            </h4>
            <div className="rounded-sm overflow-hidden border border-[#D5DCE6] max-h-80 flex items-center justify-center bg-[#F3F6FA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.previewUrl}
                alt="Resized output"
                className="max-h-80 max-w-full object-contain"
              />
            </div>
            <p className="text-[11px] text-[#556275] text-center font-mono">
              Rendered at {result.width} × {result.height} px • {formatBytes(result.size)}
            </p>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
