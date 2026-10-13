"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { downloadBlob } from "@/lib/utils";
import { getPdfJs } from "@/lib/pdf-utils";
import { createZipBundle } from "@/lib/zip-utils";
import { FileImage, Loader2, CheckSquare, Square, Settings2 } from "lucide-react";

interface PagePreview {
  pageNumber: number;
  thumbnailUrl: string;
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [dpi, setDpi] = useState<150 | 300>(150);

  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isZip, setIsZip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load and render page previews when PDF file is selected
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setResultBlob(null);
    setError(null);
    setLoadingPreviews(true);

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await selected.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const count = pdfDoc.numPages;
      setTotalPages(count);

      // Default: all pages selected
      const initialSelected = new Set<number>();
      for (let i = 1; i <= count; i++) initialSelected.add(i);
      setSelectedPages(initialSelected);

      // Render low-res thumbnails for preview grid
      const previews: PagePreview[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      for (let i = 1; i <= count; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const url = canvas.toDataURL("image/jpeg", 0.75);
          previews.push({ pageNumber: i, thumbnailUrl: url });
        }
      }

      setPagePreviews(previews);
    } catch (err: any) {
      setError(err.message || "Failed to load PDF pages for preview");
    } finally {
      setLoadingPreviews(false);
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const updated = new Set(prev);
      if (updated.has(pageNum)) {
        updated.delete(pageNum);
      } else {
        updated.add(pageNum);
      }
      return updated;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setSelectedPages(all);
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleConvert = async () => {
    if (!file || selectedPages.size === 0) return;
    setProcessing(true);
    setError(null);
    setProgressPercent(5);
    setProgressStatus("Initializing high-resolution renderer...");

    try {
      const pdfjs = await getPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      // Scale factor: standard PDF is 72 DPI. 150 DPI is scale 2.08; 300 DPI is scale 4.16.
      const scale = dpi === 300 ? 4.16 : 2.08;

      const pagesToProcess = Array.from(selectedPages).sort((a, b) => a - b);
      const generatedFiles: { name: string; data: Blob }[] = [];

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageNum = pagesToProcess[i];
        setProgressStatus(`Rendering page ${pageNum} (${i + 1} of ${pagesToProcess.length})...`);
        setProgressPercent(Math.round(10 + ((i + 1) / pagesToProcess.length) * 80));

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("Failed to create JPG blob"));
            },
            "image/jpeg",
            0.92
          );
        });

        generatedFiles.push({
          name: `page-${pageNum}.jpg`,
          data: blob,
        });
      }

      if (generatedFiles.length === 1) {
        setResultBlob(generatedFiles[0].data);
        setIsZip(false);
      } else {
        setProgressStatus("Packaging images into ZIP archive...");
        const zipBlob = await createZipBundle(generatedFiles);
        setResultBlob(zipBlob);
        setIsZip(true);
      }

      setProgressPercent(100);
      setProgressStatus("Done!");
    } catch (err: any) {
      setError(err.message || "Failed to convert PDF pages to JPG");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    if (isZip) {
      downloadBlob(resultBlob, `${baseName}_pages.zip`, "application/zip");
    } else {
      const pageNum = Array.from(selectedPages)[0] || 1;
      downloadBlob(resultBlob, `${baseName}_page-${pageNum}.jpg`, "image/jpeg");
    }
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setPagePreviews([]);
    setSelectedPages(new Set());
    setResultBlob(null);
    setError(null);
    setProcessing(false);
  };

  return (
    <ToolLayout
      category="Convert"
      title="PDF to JPG"
      description="Extract and convert PDF pages into crisp JPG images at 150 or 300 DPI with single-page or bulk ZIP download."
    >
      {/* 1. Dropzone */}
      {!file && !resultBlob && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          buttonText="Browse PDF"
          helperText="Standard PDF documents up to 50 MB"
          formatBadges={["PDF"]}
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* Loading PDF preview state */}
      {loadingPreviews && (
        <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-card max-w-xl mx-auto space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">
            Analyzing PDF & Generating Previews...
          </h3>
          <p className="text-xs text-slate-500">
            Rendering page thumbnails locally in your browser
          </p>
        </div>
      )}

      {/* 2. Page Selection & Settings */}
      {file && !loadingPreviews && !resultBlob && (
        <div className="space-y-6">
          {/* Top Info & Select all/none */}
          <div className="bg-white border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{file.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalPages} {totalPages === 1 ? "page" : "pages"} • {selectedPages.size} selected for extraction
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Page Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {pagePreviews.map((preview) => {
              const isSelected = selectedPages.has(preview.pageNumber);
              return (
                <div
                  key={preview.pageNumber}
                  onClick={() => togglePageSelection(preview.pageNumber)}
                  className={`group relative bg-white border rounded-2xl p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md scale-[1.01]"
                      : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                  }`}
                >
                  {/* Checkbox indicator */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600 bg-white rounded" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 bg-white rounded" />
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.thumbnailUrl}
                      alt={`Page ${preview.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-center text-xs font-bold text-slate-700 mt-2 font-mono">
                    Page {preview.pageNumber}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Resolution Configuration & Convert */}
          <div className="bg-white border border-border rounded-3xl p-6 sm:p-7 shadow-card space-y-4 max-w-xl mx-auto">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600" />
              Image Quality & Resolution
            </h4>

            {/* Segmented Resolution Selector */}
            <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setDpi(150)}
                className={`p-3 rounded-xl text-left transition-all ${
                  dpi === 150
                    ? "bg-white text-blue-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className="font-bold text-sm block">150 DPI</span>
                <span className="text-xs text-slate-500 font-normal">Standard (Fast, web & email)</span>
              </button>

              <button
                type="button"
                onClick={() => setDpi(300)}
                className={`p-3 rounded-xl text-left transition-all ${
                  dpi === 300
                    ? "bg-white text-blue-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className="font-bold text-sm block">300 DPI</span>
                <span className="text-xs text-slate-500 font-normal">High Res (Print quality)</span>
              </button>
            </div>

            {/* Progress bar */}
            {processing && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {progressStatus || "Rendering pages..."}
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

            {!processing && (
              <button
                onClick={handleConvert}
                disabled={selectedPages.size === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2 group"
              >
                <FileImage className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>
                  Convert {selectedPages.size} {selectedPages.size === 1 ? "Page to JPG" : "Pages to ZIP"}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Result State */}
      {resultBlob && file && (
        <ResultCard
          title={isZip ? "ZIP archive ready" : "JPG image ready"}
          filename={
            isZip
              ? `${file.name.replace(/\.pdf$/i, "")}_pages.zip`
              : `${file.name.replace(/\.pdf$/i, "")}_page-${Array.from(selectedPages)[0] || 1}.jpg`
          }
          resultSize={resultBlob.size}
          onDownload={handleDownload}
          onReset={handleReset}
          downloadButtonText={isZip ? "Download ZIP Archive" : "Download JPG Image"}
          resetButtonText="Convert another PDF"
          extraStats={[
            { label: "Pages Converted", value: `${selectedPages.size}` },
            { label: "Resolution", value: `${dpi} DPI` },
          ]}
        />
      )}
    </ToolLayout>
  );
}
