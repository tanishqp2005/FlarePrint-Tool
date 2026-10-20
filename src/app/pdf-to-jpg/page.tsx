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
      category="PDF Utilities"
      title="PDF to JPG"
      description="Extract and convert PDF pages into high-resolution JPG images at 150 or 300 DPI with single-page or bulk ZIP download."
    >
      {/* 1. Dropzone */}
      {!file && !resultBlob && (
        <Dropzone
          accept=".pdf,application/pdf"
          title="Drop your PDF here"
          buttonText="Choose PDF File"
          helperText="Standard PDF documents up to 50 MB"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* Loading PDF preview state */}
      {loadingPreviews && (
        <div className="bg-white border border-[#D5DCE6] rounded-sm p-10 text-center shadow-flare max-w-xl mx-auto space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2860E8] mx-auto" />
          <h3 className="font-extrabold uppercase tracking-tight text-[#111111] text-sm">
            Analyzing PDF & Generating Previews...
          </h3>
          <p className="text-xs text-[#556275]">
            Rendering page thumbnails locally in your browser memory
          </p>
        </div>
      )}

      {/* 2. Page Selection & Settings */}
      {file && !loadingPreviews && !resultBlob && (
        <div className="space-y-6">
          {/* Top Info & Select all/none */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-flare">
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-tight text-[#111111] truncate max-w-md">
                {file.name}
              </h3>
              <p className="text-[11px] text-[#556275] mt-0.5">
                {totalPages} {totalPages === 1 ? "page" : "pages"} • <span className="font-bold text-[#2860E8] font-mono">{selectedPages.size}</span> selected for extraction
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[11px] font-bold uppercase tracking-wider text-[#111111] transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[11px] font-bold uppercase tracking-wider text-[#111111] transition-colors"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:bg-red-50 text-[11px] font-bold uppercase tracking-wider text-[#556275] hover:text-red-600 transition-colors"
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
                  className={`group relative bg-white border rounded-sm p-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#2860E8] ring-2 ring-[#2860E8]/20 shadow-sm"
                      : "border-[#D5DCE6] opacity-60 hover:opacity-100 hover:border-[#111111]"
                  }`}
                >
                  {/* Checkbox indicator */}
                  <div className="absolute top-3 right-3 z-10">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#2860E8] bg-white rounded-none" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8C9BAE] bg-white rounded-none" />
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-full aspect-[3/4] bg-[#F3F6FA] rounded-sm overflow-hidden border border-[#D5DCE6] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.thumbnailUrl}
                      alt={`Page ${preview.pageNumber}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-center text-[11px] font-extrabold uppercase tracking-wider text-[#111111] mt-2">
                    Page {preview.pageNumber}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Resolution Configuration & Convert */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-7 shadow-flare space-y-5 max-w-xl mx-auto">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
              Image Quality & Resolution
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDpi(150)}
                className={`p-3.5 rounded-sm border text-left transition-all ${
                  dpi === 150
                    ? "bg-[#EBF1FD] border-[#2860E8] text-[#111111]"
                    : "bg-white border-[#D5DCE6] text-[#556275] hover:bg-[#F3F6FA]"
                }`}
              >
                <span className="font-extrabold text-xs uppercase tracking-wider block text-[#111111]">
                  150 DPI
                </span>
                <span className="text-[11px] text-[#556275] mt-0.5 block">
                  Standard Web & Email (Faster)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDpi(300)}
                className={`p-3.5 rounded-sm border text-left transition-all ${
                  dpi === 300
                    ? "bg-[#EBF1FD] border-[#2860E8] text-[#111111]"
                    : "bg-white border-[#D5DCE6] text-[#556275] hover:bg-[#F3F6FA]"
                }`}
              >
                <span className="font-extrabold text-xs uppercase tracking-wider block text-[#111111]">
                  300 DPI
                </span>
                <span className="text-[11px] text-[#556275] mt-0.5 block">
                  High Resolution (Print Quality)
                </span>
              </button>
            </div>

            {/* Progress bar */}
            {processing && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-[#556275] font-medium">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-[#111111]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2860E8]" />
                    {progressStatus}
                  </span>
                  <span className="font-mono font-bold text-[#2860E8]">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-none bg-[#E8EEF5] overflow-hidden">
                  <div
                    className="h-full bg-[#2860E8] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {!processing && (
              <button
                onClick={handleConvert}
                disabled={selectedPages.size === 0}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1E4DC0] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <FileImage className="w-4 h-4" />
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
          title={isZip ? "ZIP Archive Ready" : "JPG Image Ready"}
          filename={
            isZip
              ? `${file.name.replace(/\.pdf$/i, "")}_pages.zip`
              : `${file.name.replace(/\.pdf$/i, "")}_page-${Array.from(selectedPages)[0] || 1}.jpg`
          }
          resultSize={resultBlob.size}
          onDownload={handleDownload}
          onReset={handleReset}
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
