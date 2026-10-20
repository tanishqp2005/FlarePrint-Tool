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
    setProgressPercent(10);
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
    const filename = images.length === 1
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
      category="PDF Utilities"
      title="JPG to PDF"
      description="Convert single or multiple JPG and PNG images into a clean, unified PDF document in seconds."
    >
      {/* 1. Initial Dropzone if empty */}
      {images.length === 0 && !pdfResult && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          multiple={true}
          title="Drop one or multiple images here"
          buttonText="Choose Images"
          helperText="Upload JPG or PNG files to merge into a single PDF"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. Uploaded Images Grid & Configuration */}
      {images.length > 0 && !pdfResult && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Top toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-sm border border-[#D5DCE6] shadow-subtle">
            <div>
              <h3 className="font-bold text-[#111111] text-xs uppercase tracking-wider">
                {images.length} {images.length === 1 ? "Image" : "Images"} Selected
              </h3>
              <p className="text-[11px] text-[#556275] mt-0.5">
                Total size: <span className="font-bold text-[#111111] font-mono">{formatBytes(totalInputBytes)}</span> • Drag or use arrows to reorder pages
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="cursor-pointer px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5 text-[#2860E8]" />
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
                className="px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:bg-red-50 text-xs font-bold uppercase tracking-wider text-[#556275] hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Thumbnails Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-white border border-[#D5DCE6] rounded-sm p-2 shadow-subtle flex flex-col justify-between"
              >
                {/* Page number badge */}
                <div className="absolute top-3 left-3 z-10 bg-[#172033] text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm">
                  #{index + 1}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  title="Remove image"
                  className="absolute top-3 right-3 z-10 w-6 h-6 rounded-sm bg-white/90 border border-[#D5DCE6] text-[#556275] hover:text-red-600 hover:bg-white shadow-xs flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Thumbnail image */}
                <div className="w-full aspect-[4/3] rounded-sm overflow-hidden bg-[#F3F6FA] flex items-center justify-center border border-[#D5DCE6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Caption & Reorder arrows */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#556275] truncate max-w-[90px]">
                    {item.file.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, "left")}
                      disabled={index === 0}
                      title="Move left"
                      className="p-1 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[#556275] disabled:opacity-30"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMove(index, "right")}
                      disabled={index === images.length - 1}
                      title="Move right"
                      className="p-1 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[#556275] disabled:opacity-30"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Options Card */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 shadow-flare space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
              Document Layout Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#556275] block mb-1.5">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "auto", label: "Auto" },
                    { id: "portrait", label: "Portrait" },
                    { id: "landscape", label: "Landscape" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setOrientation(opt.id as any)}
                      className={`py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
                        orientation === opt.id
                          ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                          : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#556275] block mb-1.5">
                  Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "none", label: "No Margin" },
                    { id: "small", label: "Small" },
                    { id: "normal", label: "Normal" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMargin(opt.id as any)}
                      className={`py-2 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all ${
                        margin === opt.id
                          ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                          : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
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
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-[#556275] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2860E8]" />
                    {progressStatus}
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

            {/* Convert CTA */}
            {!processing && (
              <button
                onClick={handleConvert}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>CONVERT {images.length} {images.length === 1 ? "IMAGE" : "IMAGES"} TO PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Result State */}
      {pdfResult && (
        <ResultCard
          title="PDF Document Ready"
          filename={images.length === 1 ? `${images[0].file.name.replace(/\.[^/.]+$/, "")}.pdf` : "FlarePrint_Images.pdf"}
          resultSize={pdfResult.byteLength}
          onDownload={handleDownload}
          onReset={handleReset}
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
