"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { convertImagesToPdf, ImageToPdfOptions } from "@/lib/pdf-utils";
import { FileText, Plus, Trash2, ArrowLeft, ArrowRight, Loader2, Settings2 } from "lucide-react";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState<"none" | "small" | "normal">("none");

  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
    setError(null);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const newArr = [...images];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setImages(newArr);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgressPercent(15);
    setProgressStatus("Preparing images for PDF document...");

    try {
      const options: ImageToPdfOptions = { orientation, margin };
      const bytes = await convertImagesToPdf(
        images.map((img) => ({ file: img.file })),
        options,
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );
      setPdfResult(bytes);
    } catch (err: any) {
      setError(err.message || "Failed to convert images to PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfResult) return;
    const filename =
      images.length === 1
        ? `${images[0].file.name.replace(/\.[^/.]+$/, "")}.pdf`
        : "FlarePrint_Images.pdf";
    downloadBlob(pdfResult, filename, "application/pdf");
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setPdfResult(null);
    setError(null);
    setProcessing(false);
  };

  const totalInputBytes = images.reduce((acc, img) => acc + img.file.size, 0);

  return (
    <ToolLayout
      category="Convert"
      title="JPG to PDF"
      description="Convert single or multiple JPG and PNG images into a clean, unified PDF document in seconds."
    >
      {/* 1. Initial Dropzone if empty */}
      {images.length === 0 && !pdfResult && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          multiple={true}
          title="Drop one or multiple images here"
          buttonText="Browse Images"
          helperText="Upload multiple JPG or PNG images to merge into a single PDF"
          formatBadges={["JPG", "PNG"]}
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. Uploaded Images Grid & Configuration */}
      {images.length > 0 && !pdfResult && (
        <div className="space-y-6">
          {/* Top toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {images.length} {images.length === 1 ? "Image" : "Images"} Selected
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total size: {formatBytes(totalInputBytes)} • Reorder pages using arrows
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="cursor-pointer px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add more</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Thumbnails Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-white border border-border hover:border-blue-400 rounded-2xl p-2.5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                {/* Page number badge */}
                <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  #{index + 1}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  title="Remove image"
                  className="absolute top-4 right-4 z-10 w-7 h-7 rounded-lg bg-white/90 text-slate-500 hover:text-red-600 hover:bg-white shadow-xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Thumbnail image */}
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Caption & Reorder arrows */}
                <div className="pt-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[110px]" title={item.file.name}>
                    {item.file.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, "left")}
                      disabled={index === 0}
                      title="Move left"
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "right")}
                      disabled={index === images.length - 1}
                      title="Move right"
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Options Card with Segmented Controls */}
          <div className="bg-white border border-border rounded-3xl p-6 sm:p-7 shadow-card space-y-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600" />
              Document Layout Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Orientation Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Page Orientation
                </label>
                <div className="p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-3 gap-1">
                  {[
                    { id: "auto", label: "Auto" },
                    { id: "portrait", label: "Portrait" },
                    { id: "landscape", label: "Landscape" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOrientation(opt.id as any)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        orientation === opt.id
                          ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Margins
                </label>
                <div className="p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-3 gap-1">
                  {[
                    { id: "none", label: "No Margin" },
                    { id: "small", label: "Small" },
                    { id: "normal", label: "Normal" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMargin(opt.id as any)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        margin === opt.id
                          ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {processing && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {progressStatus || "Building PDF document..."}
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

            {/* Convert CTA */}
            {!processing && (
              <button
                onClick={handleConvert}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
              >
                <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Convert {images.length} {images.length === 1 ? "Image" : "Images"} to PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Result State */}
      {pdfResult && (
        <ResultCard
          title="PDF document ready"
          filename={images.length === 1 ? `${images[0].file.name.replace(/\.[^/.]+$/, "")}.pdf` : "FlarePrint_Images.pdf"}
          resultSize={pdfResult.byteLength}
          onDownload={handleDownload}
          onReset={handleReset}
          downloadButtonText="Download PDF Document"
          resetButtonText="Convert more images"
          extraStats={[
            { label: "Pages Added", value: `${images.length}` },
            { label: "Format", value: "PDF Document" },
          ]}
        />
      )}
    </ToolLayout>
  );
}
