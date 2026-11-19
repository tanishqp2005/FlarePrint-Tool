"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { BatchFileList, BatchFileItem } from "@/components/BatchFileList";
import { BatchProgress } from "@/components/BatchProgress";
import { BatchResultsView, BatchResultItem } from "@/components/BatchResultsView";
import { formatBytes, downloadBlob, yieldToEventLoop } from "@/lib/utils";
import { getPdfJs } from "@/lib/pdf-utils";
import { createZipBundle, ZipFileItem } from "@/lib/zip-utils";
import { PDFDocument } from "pdf-lib";
import {
  FileImage,
  Loader2,
  CheckSquare,
  Square,
  Settings2,
  Layers,
} from "lucide-react";

interface PdfToJpgItem extends BatchFileItem {
  pageCount?: number;
}

interface SinglePdfPagePreview {
  pageNumber: number;
  thumbnailUrl: string;
}

interface ProcessedPdfToJpgRecord {
  id: string;
  originalFileName: string;
  baseName: string;
  pageCount: number;
  images: { name: string; blob: Blob; previewUrl: string }[];
  status: "success" | "error";
  error?: string;
}

export default function PdfToJpgPage() {
  const [fileItems, setFileItems] = useState<PdfToJpgItem[]>([]);
  const [dpi, setDpi] = useState<150 | 300>(150);

  // Single-file interactive page selector state (preserved for 1-file uploads)
  const [singlePreviews, setSinglePreviews] = useState<SinglePdfPagePreview[]>([]);
  const [singleSelectedPages, setSingleSelectedPages] = useState<Set<number>>(new Set());
  const [loadingSinglePreviews, setLoadingSinglePreviews] = useState(false);

  // Batch execution state
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  // Results state
  const [processedRecords, setProcessedRecords] = useState<ProcessedPdfToJpgRecord[] | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  // Inspect page counts when files are selected
  const handleFilesSelected = async (newFiles: File[]) => {
    const newItems: PdfToJpgItem[] = [];

    for (const file of newFiles) {
      const id = Math.random().toString(36).substring(2, 9);
      try {
        const ab = await file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const count = doc.getPageCount();
        newItems.push({
          id,
          file,
          pageCount: count,
          extraInfo: `${count} ${count === 1 ? "page" : "pages"}`,
        });
      } catch {
        newItems.push({
          id,
          file,
          extraInfo: "PDF",
        });
      }
    }

    const updated = [...fileItems, ...newItems];
    setFileItems(updated);
    setProcessedRecords(null);

    // If exactly 1 file is loaded, generate thumbnails for page picker
    if (updated.length === 1) {
      loadSingleFilePreviews(updated[0].file);
    } else {
      setSinglePreviews([]);
    }
  };

  const loadSingleFilePreviews = async (file: File) => {
    setLoadingSinglePreviews(true);
    try {
      const pdfjs = await getPdfJs();
      const ab = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: ab }).promise;
      const count = pdf.numPages;

      const initialSelected = new Set<number>();
      for (let i = 1; i <= count; i++) initialSelected.add(i);
      setSingleSelectedPages(initialSelected);

      const previews: SinglePdfPagePreview[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          previews.push({
            pageNumber: i,
            thumbnailUrl: canvas.toDataURL("image/jpeg", 0.75),
          });
        }
      }
      setSinglePreviews(previews);
    } catch {
      // Ignore preview errors
    } finally {
      setLoadingSinglePreviews(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    const updated = fileItems.filter((item) => item.id !== id);
    setFileItems(updated);
    if (updated.length === 1) {
      loadSingleFilePreviews(updated[0].file);
    } else {
      setSinglePreviews([]);
    }
  };

  const handleClearAll = () => {
    setFileItems([]);
    setSinglePreviews([]);
    setSingleSelectedPages(new Set());
    setProcessedRecords(null);
  };

  const toggleSinglePage = (pageNum: number) => {
    setSingleSelectedPages((prev) => {
      const updated = new Set(prev);
      if (updated.has(pageNum)) updated.delete(pageNum);
      else updated.add(pageNum);
      return updated;
    });
  };

  const selectAllSingle = () => {
    if (fileItems.length === 1 && fileItems[0].pageCount) {
      const all = new Set<number>();
      for (let i = 1; i <= fileItems[0].pageCount; i++) all.add(i);
      setSingleSelectedPages(all);
    }
  };

  const deselectAllSingle = () => {
    setSingleSelectedPages(new Set());
  };

  const executeConversion = async () => {
    if (fileItems.length === 0) return;
    setProcessing(true);
    setProcessedRecords(null);
    setCurrentFileIndex(0);
    setOverallPercent(0);

    const pdfjs = await getPdfJs();
    const scale = dpi === 300 ? 4.16 : 2.08;
    const records: ProcessedPdfToJpgRecord[] = [];
    const totalFiles = fileItems.length;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    for (let fIdx = 0; fIdx < totalFiles; fIdx++) {
      const item = fileItems[fIdx];
      setCurrentFileIndex(fIdx + 1);
      setCurrentFileName(item.file.name);
      setProgressStatus(`Opening PDF...`);
      setOverallPercent(Math.round((fIdx / totalFiles) * 100));

      const baseName = item.file.name.replace(/\.pdf$/i, "");

      try {
        const ab = await item.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: ab }).promise;
        const totalDocPages = pdf.numPages;

        // If single file with selection, use selected pages; otherwise all pages
        const pagesToRender: number[] = [];
        if (totalFiles === 1 && singleSelectedPages.size > 0) {
          pagesToRender.push(...Array.from(singleSelectedPages).sort((a, b) => a - b));
        } else {
          for (let p = 1; p <= totalDocPages; p++) pagesToRender.push(p);
        }

        const generatedImages: { name: string; blob: Blob; previewUrl: string }[] = [];

        for (let pIdx = 0; pIdx < pagesToRender.length; pIdx++) {
          const pageNum = pagesToRender[pIdx];
          setProgressStatus(
            `Rendering page ${pageNum} (${pIdx + 1} of ${pagesToRender.length})...`
          );
          const pageStepPercent = Math.round(
            ((fIdx + (pIdx + 1) / pagesToRender.length) / totalFiles) * 100
          );
          setOverallPercent(pageStepPercent);

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error("Failed to render page to JPG"))),
                "image/jpeg",
                0.92
              );
            });

            generatedImages.push({
              name: `${baseName}_page-${pageNum}.jpg`,
              blob,
              previewUrl: URL.createObjectURL(blob),
            });
          }
        }

        records.push({
          id: item.id,
          originalFileName: item.file.name,
          baseName,
          pageCount: generatedImages.length,
          images: generatedImages,
          status: "success",
        });
      } catch (err: any) {
        records.push({
          id: item.id,
          originalFileName: item.file.name,
          baseName,
          pageCount: 0,
          images: [],
          status: "error",
          error: err.message || "Failed to process PDF",
        });
      }

      await yieldToEventLoop();
    }

    setOverallPercent(100);
    setProcessedRecords(records);
    setProcessing(false);
  };

  const handleDownloadSinglePdfResult = async (record: ProcessedPdfToJpgRecord) => {
    if (record.images.length === 0) return;
    if (record.images.length === 1) {
      downloadBlob(record.images[0].blob, record.images[0].name, "image/jpeg");
    } else {
      const zipItems: ZipFileItem[] = record.images.map((img) => ({
        name: img.name,
        data: img.blob,
      }));
      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, `${record.baseName}_pages.zip`, "application/zip");
    }
  };

  const handleDownloadAllZip = async () => {
    if (!processedRecords) return;
    const allSuccessful = processedRecords.filter((r) => r.status === "success" && r.images.length > 0);
    if (allSuccessful.length === 0) return;

    if (allSuccessful.length === 1 && allSuccessful[0].images.length === 1) {
      handleDownloadSinglePdfResult(allSuccessful[0]);
      return;
    }

    setIsZipping(true);
    try {
      const zipItems: ZipFileItem[] = [];
      const isMultiplePdfs = allSuccessful.length > 1;

      for (const record of allSuccessful) {
        for (const img of record.images) {
          // If multiple PDFs, organize in subfolders per source PDF
          const pathInZip = isMultiplePdfs
            ? `${record.baseName}/${img.name}`
            : img.name;
          zipItems.push({
            name: pathInZip,
            data: img.blob,
          });
        }
      }

      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, "FlarePrint_Converted_Images.zip", "application/zip");
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    processedRecords?.forEach((r) => {
      r.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    });
    setFileItems([]);
    setSinglePreviews([]);
    setSingleSelectedPages(new Set());
    setProcessedRecords(null);
    setProcessing(false);
    setOverallPercent(0);
  };

  const totalPagesAcrossAll = fileItems.reduce(
    (acc, it) => acc + (it.pageCount || 1),
    0
  );

  const batchResultItems: BatchResultItem[] = (processedRecords || []).map((r) => {
    const totalBytes = r.images.reduce((acc, img) => acc + img.blob.size, 0);
    return {
      id: r.id,
      originalFileName: r.originalFileName,
      downloadFileName:
        r.images.length === 1
          ? r.images[0].name
          : `${r.baseName}_pages.zip`,
      resultSize: totalBytes > 0 ? totalBytes : undefined,
      status: r.status,
      error: r.error,
      badge:
        r.status === "error"
          ? "FAILED"
          : `${r.pageCount} ${r.pageCount === 1 ? "PAGE" : "PAGES"} EXTRACTED`,
      badgeType: r.status === "error" ? "error" : "success",
      previewUrl: r.images[0]?.previewUrl,
      details: `${r.images.length} JPG files at ${dpi} DPI`,
      onDownload: () => handleDownloadSinglePdfResult(r),
    };
  });

  return (
    <ToolLayout
      category="PDF Utilities"
      title="PDF to JPG"
      description="Extract and convert PDF pages into high-resolution JPG images at 150 or 300 DPI with single-page or bulk ZIP download."
    >
      {/* 1. Upload Dropzone */}
      {fileItems.length === 0 && !processedRecords && (
        <Dropzone
          accept=".pdf,application/pdf"
          multiple={true}
          title="Drop your PDF files here"
          buttonText="Choose PDF Files"
          helperText="Upload single or multiple PDF documents up to 50 MB each"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. Files Selected - List & Settings */}
      {fileItems.length > 0 && !processedRecords && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* File list */}
          <BatchFileList
            files={fileItems}
            accept=".pdf,application/pdf"
            onAddFiles={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            disabled={processing}
          />

          {/* Interactive Page Selection for Single PDF */}
          {fileItems.length === 1 && singlePreviews.length > 0 && (
            <div className="bg-white border border-[#D5DCE6] rounded-sm p-4 sm:p-5 shadow-flare space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Select Pages to Convert
                  </h4>
                  <p className="text-[11px] text-[#556275]">
                    {singleSelectedPages.size} of {singlePreviews.length} pages selected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllSingle}
                    className="px-2.5 py-1 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[10px] font-bold uppercase tracking-wider text-[#111111]"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllSingle}
                    className="px-2.5 py-1 rounded-sm border border-[#D5DCE6] hover:bg-[#F3F6FA] text-[10px] font-bold uppercase tracking-wider text-[#556275]"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {singlePreviews.map((p) => {
                  const isSelected = singleSelectedPages.has(p.pageNumber);
                  return (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => toggleSinglePage(p.pageNumber)}
                      className={`relative border rounded-sm p-1.5 flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? "border-[#2860E8] bg-[#EBF1FD]/40 ring-1 ring-[#2860E8]"
                          : "border-[#D5DCE6] opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnailUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="w-full h-20 object-contain bg-white"
                      />
                      <span className="text-[10px] font-bold font-mono text-[#111111]">
                        P. {p.pageNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Configuration Form */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-7 shadow-flare space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-[#2860E8]" />
                Select Resolution (DPI)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setDpi(150)}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    dpi === 150
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wider">
                    150 DPI • Standard
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      dpi === 150 ? "text-white/80" : "text-[#556275]"
                    }`}
                  >
                    Faster processing, ideal for screens and presentations.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setDpi(300)}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    dpi === 300
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  <div className="font-extrabold text-xs uppercase tracking-wider">
                    300 DPI • Print Quality
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      dpi === 300 ? "text-white/80" : "text-[#556275]"
                    }`}
                  >
                    Ultra high resolution, maximum clarity for professional printing.
                  </p>
                </button>
              </div>
            </div>

            {/* Action button */}
            {!processing && (
              <button
                type="button"
                onClick={executeConversion}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <FileImage className="w-4 h-4" />
                <span>
                  {fileItems.length === 1
                    ? `CONVERT ${singleSelectedPages.size || totalPagesAcrossAll} PAGES TO JPG`
                    : `CONVERT ${fileItems.length} PDFS TO JPG`}
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
          <BatchResultsView
            title="PDF to JPG Conversion Complete"
            results={batchResultItems}
            onDownloadAllZip={handleDownloadAllZip}
            isZipping={isZipping}
            zipButtonText="Download All as ZIP"
            onReset={handleReset}
            resetButtonText="Convert More PDFs"
          />
        </div>
      )}
    </ToolLayout>
  );
}
