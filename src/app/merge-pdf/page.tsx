"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { BatchFileList, BatchFileItem } from "@/components/BatchFileList";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { mergePdfFiles } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";
import { Layers, Loader2, FileDown } from "lucide-react";

interface MergePdfItem extends BatchFileItem {
  pageCount: number;
}

export default function MergePdfPage() {
  const [items, setItems] = useState<MergePdfItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [mergedResult, setMergedResult] = useState<{ data: Uint8Array; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);
    const newItems: MergePdfItem[] = [];

    for (const file of files) {
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
          pageCount: 1,
          extraInfo: "1 page",
        });
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    setMergedResult(null);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newArr = [...items];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setItems(newArr);
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    const newArr = [...items];
    const [removed] = newArr.splice(startIndex, 1);
    newArr.splice(endIndex, 0, removed);
    setItems(newArr);
  };

  const handleClearAll = () => {
    setItems([]);
    setMergedResult(null);
    setError(null);
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    setProcessing(true);
    setError(null);
    setProgressPercent(10);
    setProgressStatus("Preparing documents for merging...");

    try {
      const res = await mergePdfFiles(
        items.map((it) => it.file),
        (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        }
      );
      setMergedResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to merge PDF files");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    downloadBlob(mergedResult.data, "FlarePrint_Merged.pdf", "application/pdf");
  };

  const handleReset = () => {
    setItems([]);
    setMergedResult(null);
    setError(null);
    setProcessing(false);
    setProgressPercent(0);
  };

  const totalInputBytes = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalInputPages = items.reduce((sum, item) => sum + item.pageCount, 0);

  return (
    <ToolLayout
      category="PDF Utilities"
      title="Merge PDF"
      description="Combine multiple PDF documents into a single, perfectly structured PDF file with custom ordering."
    >
      {/* 1. Initial Dropzone if empty */}
      {items.length === 0 && !mergedResult && (
        <Dropzone
          accept=".pdf,application/pdf"
          multiple={true}
          title="Drop multiple PDF files here"
          buttonText="Choose PDF Files"
          helperText="Select two or more PDF files to combine"
          onFilesSelected={handleFilesSelected}
        />
      )}

      {/* 2. File List & Merge Action */}
      {items.length > 0 && !mergedResult && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* File list with drag & drop reorder */}
          <BatchFileList
            files={items}
            accept=".pdf,application/pdf"
            onAddFiles={handleFilesSelected}
            onRemoveFile={handleRemove}
            onClearAll={handleClearAll}
            allowReorder={true}
            onMove={handleMove}
            onReorder={handleReorder}
            disabled={processing}
            title={`${items.length} ${items.length === 1 ? "FILE" : "FILES"} (${totalInputPages} PAGES)`}
          />

          {/* Merge Card */}
          <div className="bg-white border border-[#D5DCE6] rounded-sm p-6 sm:p-7 shadow-flare space-y-4">
            <div className="flex items-center justify-between text-xs text-[#556275]">
              <span className="font-bold uppercase tracking-wider text-[#111111]">
                Sequence Preview
              </span>
              <span>
                Total Size: <strong className="text-[#111111] font-mono">{formatBytes(totalInputBytes)}</strong>
              </span>
            </div>

            <p className="text-[11px] text-[#556275] leading-relaxed">
              Files will be merged in the exact order shown above. Drag rows or use the arrow buttons to rearrange before merging.
            </p>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Progress Bar */}
            {processing && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-[#556275] font-semibold">
                  <span className="flex items-center gap-1.5 truncate max-w-[80%]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2860E8] flex-shrink-0" />
                    <span className="truncate">{progressStatus}</span>
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

            {/* Action button */}
            {!processing && (
              <button
                type="button"
                onClick={handleMerge}
                className="w-full py-3.5 px-6 rounded-sm bg-[#2860E8] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-button transition-all flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>MERGE {items.length} PDF FILES</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Result State */}
      {mergedResult && (
        <div className="space-y-6">
          <ResultCard
            title="PDFs Successfully Merged"
            filename="FlarePrint_Merged.pdf"
            originalSize={totalInputBytes}
            resultSize={mergedResult.data.byteLength}
            onDownload={handleDownload}
            onReset={handleReset}
            resetButtonText="Merge more PDFs"
            extraStats={[
              { label: "Merged Files", value: `${items.length}` },
              { label: "Total Pages", value: `${mergedResult.totalPages}` },
            ]}
          />
        </div>
      )}
    </ToolLayout>
  );
}
