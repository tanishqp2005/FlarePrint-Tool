"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { BatchFileList, BatchFileItem } from "@/components/BatchFileList";
import { BatchProgress } from "@/components/BatchProgress";
import { BatchResultsView, BatchResultItem } from "@/components/BatchResultsView";
import { formatBytes, downloadBlob, yieldToEventLoop } from "@/lib/utils";
import { getImageDimensions, resizeImage } from "@/lib/image-utils";
import { createZipBundle } from "@/lib/zip-utils";
import {
  Scaling,
  Lock,
  Unlock,
  Percent,
  Sparkles,
  Eye,
} from "lucide-react";

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

interface ResizeFileItem extends BatchFileItem {
  origWidth?: number;
  origHeight?: number;
}

interface ProcessedResizeRecord {
  id: string;
  originalFile: File;
  downloadFileName: string;
  result?: {
    blob: Blob;
    width: number;
    height: number;
    size: number;
    previewUrl: string;
  };
  error?: string;
  status: "success" | "error";
  mimeType: string;
}

export default function ResizeJpgPage() {
  const [fileItems, setFileItems] = useState<ResizeFileItem[]>([]);
  const [resizeMode, setResizeMode] = useState<"dimensions" | "percentage">("dimensions");

  // Exact dimensions mode state
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(800);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1.5); // width / height

  // Percentage mode state
  const [scalePercent, setScalePercent] = useState<number>(50);

  // Batch execution state
  const [processing, setProcessing] = useState<boolean>(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [overallPercent, setOverallPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");

  // Results state
  const [processedRecords, setProcessedRecords] = useState<ProcessedResizeRecord[] | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleFilesSelected = async (newFiles: File[]) => {
    const newItems: ResizeFileItem[] = [];

    for (const file of newFiles) {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      try {
        const dims = await getImageDimensions(file);
        newItems.push({
          id,
          file,
          previewUrl,
          origWidth: dims.width,
          origHeight: dims.height,
          extraInfo: `${dims.width}×${dims.height} px`,
        });
      } catch {
        newItems.push({
          id,
          file,
          previewUrl,
          extraInfo: "Image",
        });
      }
    }

    setFileItems((prev) => {
      const combined = [...prev, ...newItems];
      // If this is the initial batch, default width/height from the first item
      if (prev.length === 0 && newItems[0]?.origWidth && newItems[0]?.origHeight) {
        const firstW = newItems[0].origWidth;
        const firstH = newItems[0].origHeight;
        setWidth(firstW);
        setHeight(firstH);
        setAspectRatio(firstW / firstH);
      }
      return combined;
    });

    setProcessedRecords(null);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    fileItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setFileItems([]);
    setProcessedRecords(null);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && aspectRatio > 0) {
      setHeight(Math.max(1, Math.round(val / aspectRatio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && aspectRatio > 0) {
      setWidth(Math.max(1, Math.round(val * aspectRatio)));
    }
  };

  const handlePresetSelect = (preset: PresetDimension) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setAspectRatio(preset.width / preset.height);
  };

  const executeBatchResize = async () => {
    if (fileItems.length === 0) return;
    setProcessing(true);
    setProcessedRecords(null);
    setCurrentFileIndex(0);
    setOverallPercent(0);

    const records: ProcessedResizeRecord[] = [];
    const total = fileItems.length;

    for (let i = 0; i < total; i++) {
      const item = fileItems[i];
      setCurrentFileIndex(i + 1);
      setCurrentFileName(item.file.name);
      setProgressStatus(`Resizing image...`);
      setOverallPercent(Math.round((i / total) * 100));

      const isPng = item.file.type === "image/png" || item.file.name.toLowerCase().endsWith(".png");
      const mime = isPng ? "image/png" : "image/jpeg";
      const ext = isPng ? "png" : "jpg";
      const baseName = item.file.name.replace(/\.[^/.]+$/, "");

      try {
        let targetW = width;
        let targetH = height;

        if (resizeMode === "percentage") {
          const origW = item.origWidth || 1000;
          const origH = item.origHeight || 1000;
          targetW = Math.max(1, Math.round(origW * (scalePercent / 100)));
          targetH = Math.max(1, Math.round(origH * (scalePercent / 100)));
        } else if (lockAspectRatio && item.origWidth && item.origHeight) {
          // If locked aspect ratio, scale this specific item proportionally within target bounding box
          const itemRatio = item.origWidth / item.origHeight;
          const targetBoxRatio = width / height;
          if (itemRatio > targetBoxRatio) {
            targetW = width;
            targetH = Math.max(1, Math.round(width / itemRatio));
          } else {
            targetH = height;
            targetW = Math.max(1, Math.round(height * itemRatio));
          }
        }

        const res = await resizeImage(item.file, targetW, targetH, mime, 0.92);
        const downloadFileName = `${baseName}_${res.width}x${res.height}.${ext}`;

        records.push({
          id: item.id,
          originalFile: item.file,
          downloadFileName,
          result: res,
          mimeType: mime,
          status: "success",
        });
      } catch (err: any) {
        records.push({
          id: item.id,
          originalFile: item.file,
          downloadFileName: `${baseName}_resized.${ext}`,
          error: err.message || "Failed to resize image",
          mimeType: mime,
          status: "error",
        });
      }

      await yieldToEventLoop();
    }

    setOverallPercent(100);
    setProcessedRecords(records);
    setProcessing(false);
  };

  const handleDownloadSingle = (record: ProcessedResizeRecord) => {
    if (!record.result) return;
    downloadBlob(record.result.blob, record.downloadFileName, record.mimeType);
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
        data: r.result!.blob,
      }));
      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, "FlarePrint_Resized_Images.zip", "application/zip");
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    fileItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    processedRecords?.forEach((r) => {
      if (r.result?.previewUrl) URL.revokeObjectURL(r.result.previewUrl);
    });
    setFileItems([]);
    setProcessedRecords(null);
    setProcessing(false);
    setOverallPercent(0);
  };

  const batchResultItems: BatchResultItem[] = (processedRecords || []).map((r) => ({
    id: r.id,
    originalFileName: r.originalFile.name,
    downloadFileName: r.downloadFileName,
    originalSize: r.originalFile.size,
    resultSize: r.result?.size,
    reductionPercent:
      r.result && r.originalFile.size > r.result.size
        ? Math.round(((r.originalFile.size - r.result.size) / r.originalFile.size) * 100)
        : undefined,
    status: r.status,
    error: r.error,
    badge: r.status === "error" ? "FAILED" : `${r.result?.width}×${r.result?.height} PX`,
    badgeType: r.status === "error" ? "error" : "success",
    previewUrl: r.result?.previewUrl,
    onDownload: () => handleDownloadSingle(r),
  }));

  const singleRecord =
    processedRecords && processedRecords.length === 1 ? processedRecords[0] : null;

  return (
    <ToolLayout
      category="Image Utilities"
      title="Resize JPG"
      description="Change image dimensions with high-quality bicubic resampling and instant aspect-ratio calculation."
    >
      {/* 1. Upload Dropzone */}
      {fileItems.length === 0 && !processedRecords && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          multiple={true}
          title="Drop your JPG or PNG images here"
          buttonText="Choose Image Files"
          helperText="Upload single or multiple JPG and PNG images up to 25 MB each"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. Files Selected - List & Configuration */}
      {fileItems.length > 0 && !processedRecords && (
        <div className="space-y-6 max-w-xl mx-auto">
          {/* File list */}
          <BatchFileList
            files={fileItems}
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            onAddFiles={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            disabled={processing}
          />

          {/* Configuration */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-7 shadow-flare space-y-6">
            {/* Mode Tabs: Exact Dimensions vs Percentage Scale */}
            <div className="grid grid-cols-2 gap-2 border-b border-[#D5DCE6] pb-4">
              <button
                type="button"
                disabled={processing}
                onClick={() => setResizeMode("dimensions")}
                className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  resizeMode === "dimensions"
                    ? "bg-[#2860E8] text-white shadow-button"
                    : "bg-[#F3F6FA] text-[#556275] hover:text-[#111111]"
                }`}
              >
                <Scaling className="w-3.5 h-3.5" />
                <span>By Dimensions (px)</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => setResizeMode("percentage")}
                className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  resizeMode === "percentage"
                    ? "bg-[#2860E8] text-white shadow-button"
                    : "bg-[#F3F6FA] text-[#556275] hover:text-[#111111]"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>By Percentage (%)</span>
              </button>
            </div>

            {resizeMode === "dimensions" ? (
              <div className="space-y-4">
                {/* Width & Height Inputs */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={width || ""}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                      disabled={processing}
                      className="w-full px-3 py-2 text-xs font-bold rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={height || ""}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                      disabled={processing}
                      className="w-full px-3 py-2 text-xs font-bold rounded-sm border border-[#D5DCE6] bg-white text-[#111111] focus:outline-none focus:border-[#2860E8]"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Lock */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm border transition-colors ${
                      lockAspectRatio
                        ? "bg-[#EBF1FD] text-[#2860E8] border-[#2860E8]/30"
                        : "bg-white text-[#556275] border-[#D5DCE6]"
                    }`}
                  >
                    {lockAspectRatio ? (
                      <Lock className="w-3.5 h-3.5 text-[#2860E8]" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-[#556275]" />
                    )}
                    <span>{lockAspectRatio ? "Aspect Ratio Locked" : "Aspect Ratio Unlocked"}</span>
                  </button>
                </div>

                {/* Dimension Presets */}
                <div className="space-y-2 pt-2 border-t border-[#D5DCE6]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2860E8]" />
                    Standard Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        disabled={processing}
                        onClick={() => handlePresetSelect(p)}
                        className={`py-2 px-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border text-left truncate transition-colors ${
                          width === p.width && height === p.height
                            ? "bg-[#2860E8] text-white border-[#2860E8]"
                            : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Percentage Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Resize Percentage
                    </label>
                    <span className="text-sm font-bold font-mono text-[#2860E8]">
                      {scalePercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={scalePercent}
                    onChange={(e) => setScalePercent(parseInt(e.target.value, 10))}
                    disabled={processing}
                    className="w-full accent-[#2860E8]"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 150].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      disabled={processing}
                      onClick={() => setScalePercent(pct)}
                      className={`py-2 px-2 rounded-sm text-xs font-bold font-mono uppercase tracking-wider border transition-colors ${
                        scalePercent === pct
                          ? "bg-[#2860E8] text-white border-[#2860E8]"
                          : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#556275]">
                  Each image in the batch will be resized proportionally to {scalePercent}% of its own original dimensions.
                </p>
              </div>
            )}

            {/* Action button */}
            {!processing && (
              <button
                type="button"
                onClick={executeBatchResize}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <Scaling className="w-4 h-4" />
                <span>
                  {fileItems.length === 1
                    ? "RESIZE IMAGE"
                    : `RESIZE ${fileItems.length} IMAGES`}
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
          {singleRecord && singleRecord.status === "success" && singleRecord.result ? (
            <div className="space-y-6">
              <ResultCard
                title="Image Resized"
                filename={singleRecord.downloadFileName}
                originalSize={singleRecord.originalFile.size}
                resultSize={singleRecord.result.size}
                onDownload={() => handleDownloadSingle(singleRecord)}
                onReset={handleReset}
                resetButtonText="Resize more images"
                extraStats={[
                  {
                    label: "Dimensions",
                    value: `${singleRecord.result.width}×${singleRecord.result.height} px`,
                  },
                ]}
              />

              {singleRecord.result.previewUrl && (
                <div className="max-w-xl mx-auto bg-white border border-[#D5DCE6] rounded-sm p-5 shadow-flare space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#2860E8]" />
                    Resized Preview
                  </h4>
                  <div className="rounded-sm overflow-hidden border border-[#D5DCE6] max-h-80 flex items-center justify-center bg-[#F3F6FA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={singleRecord.result.previewUrl}
                      alt="Resized preview"
                      className="max-h-80 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-[#556275] text-center font-mono">
                    {singleRecord.result.width}×{singleRecord.result.height} px •{" "}
                    {formatBytes(singleRecord.result.size)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <BatchResultsView
              title="Image Resizing Complete"
              results={batchResultItems}
              onDownloadAllZip={handleDownloadAllZip}
              isZipping={isZipping}
              zipButtonText="Download All as ZIP"
              onReset={handleReset}
              resetButtonText="Resize More Images"
            />
          )}
        </div>
      )}
    </ToolLayout>
  );
}
