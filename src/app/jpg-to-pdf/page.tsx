"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { BatchFileList, BatchFileItem } from "@/components/BatchFileList";
import { BatchProgress } from "@/components/BatchProgress";
import { BatchResultsView, BatchResultItem } from "@/components/BatchResultsView";
import { formatBytes, downloadBlob, yieldToEventLoop } from "@/lib/utils";
import { convertImagesToPdf, ImageToPdfOptions } from "@/lib/pdf-utils";
import { createZipBundle } from "@/lib/zip-utils";
import {
  FileText,
  Files,
  Settings2,
  FileDown,
  Layers,
} from "lucide-react";

interface ProcessedPdfRecord {
  id: string;
  originalFileName: string;
  downloadFileName: string;
  data?: Uint8Array;
  size?: number;
  error?: string;
  status: "success" | "error";
  previewUrl?: string;
}

export default function JpgToPdfPage() {
  const [fileItems, setFileItems] = useState<BatchFileItem[]>([]);
  const [conversionTarget, setConversionTarget] = useState<"combined" | "separate">("combined");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [margin, setMargin] = useState<"none" | "small" | "normal">("none");

  // Batch progress state
  const [processing, setProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  // Results state
  const [combinedPdf, setCombinedPdf] = useState<Uint8Array | null>(null);
  const [separateRecords, setSeparateRecords] = useState<ProcessedPdfRecord[] | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const newItems: BatchFileItem[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFileItems((prev) => [...prev, ...newItems]);
    setCombinedPdf(null);
    setSeparateRecords(null);
  };

  const handleRemoveFile = (id: string) => {
    setFileItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleMoveFile = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fileItems.length) return;
    const newArr = [...fileItems];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setFileItems(newArr);
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    const newArr = [...fileItems];
    const [removed] = newArr.splice(startIndex, 1);
    newArr.splice(endIndex, 0, removed);
    setFileItems(newArr);
  };

  const handleClearAll = () => {
    fileItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setFileItems([]);
    setCombinedPdf(null);
    setSeparateRecords(null);
  };

  const handleConvert = async () => {
    if (fileItems.length === 0) return;
    setProcessing(true);
    setCombinedPdf(null);
    setSeparateRecords(null);
    setCurrentFileIndex(0);
    setOverallPercent(0);

    const options: ImageToPdfOptions = { orientation, margin };

    if (conversionTarget === "combined") {
      // Combine all images into 1 PDF
      setCurrentFileName("Combined Document");
      setProgressStatus("Compiling images into unified PDF...");
      try {
        const bytes = await convertImagesToPdf(
          fileItems.map((item) => ({ file: item.file })),
          options,
          (percent, status) => {
            setOverallPercent(percent);
            setProgressStatus(status);
          }
        );
        setCombinedPdf(bytes);
      } catch (err: any) {
        setSeparateRecords([
          {
            id: "error",
            originalFileName: "Combined PDF",
            downloadFileName: "Combined.pdf",
            error: err.message || "Failed to create combined PDF",
            status: "error",
          },
        ]);
      }
    } else {
      // Convert each image into a separate PDF
      const records: ProcessedPdfRecord[] = [];
      const total = fileItems.length;

      for (let i = 0; i < total; i++) {
        const item = fileItems[i];
        setCurrentFileIndex(i + 1);
        setCurrentFileName(item.file.name);
        setProgressStatus("Converting image to PDF...");
        setOverallPercent(Math.round((i / total) * 100));

        const baseName = item.file.name.replace(/\.[^/.]+$/, "");
        const downloadFileName = `${baseName}.pdf`;

        try {
          const bytes = await convertImagesToPdf(
            [{ file: item.file }],
            options
          );

          records.push({
            id: item.id,
            originalFileName: item.file.name,
            downloadFileName,
            data: bytes,
            size: bytes.byteLength,
            status: "success",
            previewUrl: item.previewUrl,
          });
        } catch (err: any) {
          records.push({
            id: item.id,
            originalFileName: item.file.name,
            downloadFileName,
            error: err.message || "Failed to convert image to PDF",
            status: "error",
          });
        }

        await yieldToEventLoop();
      }

      setOverallPercent(100);
      setSeparateRecords(records);
    }

    setProcessing(false);
  };

  const handleDownloadCombined = () => {
    if (!combinedPdf) return;
    const filename =
      fileItems.length === 1
        ? `${fileItems[0].file.name.replace(/\.[^/.]+$/, "")}.pdf`
        : "FlarePrint_Images.pdf";
    downloadBlob(combinedPdf, filename, "application/pdf");
  };

  const handleDownloadSingleSeparate = (record: ProcessedPdfRecord) => {
    if (!record.data) return;
    downloadBlob(record.data, record.downloadFileName, "application/pdf");
  };

  const handleDownloadAllZip = async () => {
    if (!separateRecords) return;
    const successful = separateRecords.filter((r) => r.status === "success" && r.data);
    if (successful.length === 0) return;

    if (successful.length === 1) {
      handleDownloadSingleSeparate(successful[0]);
      return;
    }

    setIsZipping(true);
    try {
      const zipItems = successful.map((r) => ({
        name: r.downloadFileName,
        data: r.data!,
      }));
      const zipBlob = await createZipBundle(zipItems);
      downloadBlob(zipBlob, "FlarePrint_Images_PDFs.zip", "application/zip");
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    fileItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setFileItems([]);
    setCombinedPdf(null);
    setSeparateRecords(null);
    setProcessing(false);
    setOverallPercent(0);
  };

  const totalInputBytes = fileItems.reduce((acc, item) => acc + item.file.size, 0);

  const separateBatchItems: BatchResultItem[] = (separateRecords || []).map((r) => ({
    id: r.id,
    originalFileName: r.originalFileName,
    downloadFileName: r.downloadFileName,
    resultSize: r.size,
    status: r.status,
    error: r.error,
    badge: r.status === "error" ? "FAILED" : "PDF READY",
    badgeType: r.status === "error" ? "error" : "success",
    previewUrl: r.previewUrl,
    onDownload: () => handleDownloadSingleSeparate(r),
  }));

  return (
    <ToolLayout
      category="PDF Utilities"
      title="JPG to PDF"
      description="Convert single or multiple JPG and PNG images into PDFs. Combine them into a single document or convert each into its own PDF."
    >
      {/* 1. Upload Dropzone */}
      {fileItems.length === 0 && !combinedPdf && !separateRecords && (
        <Dropzone
          accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
          multiple={true}
          title="Drop one or multiple images here"
          buttonText="Choose Image Files"
          helperText="Upload JPG or PNG files to convert into PDF"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. Files Selected - List & Settings */}
      {fileItems.length > 0 && !combinedPdf && !separateRecords && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* File list */}
          <BatchFileList
            files={fileItems}
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            onAddFiles={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            allowReorder={conversionTarget === "combined"}
            onMove={handleMoveFile}
            onReorder={handleReorder}
            disabled={processing}
          />

          {/* Configuration */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-7 shadow-flare space-y-6">
            {/* Target Output Choice: Combined vs Separate */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2860E8]" />
                Output Document Mode
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setConversionTarget("combined")}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    conversionTarget === "combined"
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Combine All into One PDF
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${
                      conversionTarget === "combined" ? "text-white/80" : "text-[#556275]"
                    }`}
                  >
                    Merges all {fileItems.length} images into a single multi-page PDF.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => setConversionTarget("separate")}
                  className={`p-3 rounded-sm border text-left transition-all ${
                    conversionTarget === "separate"
                      ? "bg-[#2860E8] text-white border-[#2860E8] shadow-button"
                      : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Files className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Separate PDFs per Image
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 ${
                      conversionTarget === "separate" ? "text-white/80" : "text-[#556275]"
                    }`}
                  >
                    Converts each image into its own independent PDF with ZIP download.
                  </p>
                </button>
              </div>
            </div>

            {/* Page Layout Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#D5DCE6]">
              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["auto", "portrait", "landscape"] as const).map((o) => (
                    <button
                      key={o}
                      type="button"
                      disabled={processing}
                      onClick={() => setOrientation(o)}
                      className={`py-2 px-1 rounded-sm text-xs font-bold uppercase tracking-wider border transition-colors text-center ${
                        orientation === o
                          ? "bg-[#2860E8] text-white border-[#2860E8]"
                          : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Page Margins
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["none", "small", "normal"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={processing}
                      onClick={() => setMargin(m)}
                      className={`py-2 px-1 rounded-sm text-xs font-bold uppercase tracking-wider border transition-colors text-center ${
                        margin === m
                          ? "bg-[#2860E8] text-white border-[#2860E8]"
                          : "bg-white text-[#111111] border-[#D5DCE6] hover:bg-[#F3F6FA]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            {!processing && (
              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>
                  {conversionTarget === "combined"
                    ? `CONVERT ${fileItems.length} IMAGES TO 1 PDF`
                    : `CONVERT ${fileItems.length} IMAGES TO INDIVIDUAL PDFS`}
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
      {/* 3A. Combined PDF Result */}
      {combinedPdf && (
        <div className="space-y-6">
          <ResultCard
            title="PDF Document Created"
            filename={
              fileItems.length === 1
                ? `${fileItems[0].file.name.replace(/\.[^/.]+$/, "")}.pdf`
                : "FlarePrint_Images.pdf"
            }
            originalSize={totalInputBytes}
            resultSize={combinedPdf.byteLength}
            onDownload={handleDownloadCombined}
            onReset={handleReset}
            resetButtonText="Convert more images"
            extraStats={[
              { label: "Pages Added", value: `${fileItems.length}` },
              { label: "Mode", value: "Combined PDF" },
            ]}
          />
        </div>
      )}

      {/* 3B. Separate PDFs Result */}
      {separateRecords && (
        <div className="space-y-6">
          <BatchResultsView
            title="Image to PDF Conversion Complete"
            results={separateBatchItems}
            onDownloadAllZip={handleDownloadAllZip}
            isZipping={isZipping}
            zipButtonText="Download All as ZIP"
            onReset={handleReset}
            resetButtonText="Convert More Images"
          />
        </div>
      )}
    </ToolLayout>
  );
}
