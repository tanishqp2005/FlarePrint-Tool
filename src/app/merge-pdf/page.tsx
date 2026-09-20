"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Dropzone } from "@/components/Dropzone";
import { ResultCard } from "@/components/ResultCard";
import { formatBytes, downloadBlob } from "@/lib/utils";
import { mergePdfFiles } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, Loader2, FileText } from "lucide-react";

interface PdfItem {
  id: string;
  file: File;
  pageCount: number;
}

export default function MergePdfPage() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [mergedResult, setMergedResult] = useState<{ data: Uint8Array; totalPages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    setError(null);
    const newItems: PdfItem[] = [];

    for (const file of files) {
      try {
        const ab = await file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          pageCount: doc.getPageCount(),
        });
      } catch {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          pageCount: 1,
        });
      }
    }

    setItems((prev) => [...prev, ...newItems]);
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
  };

  const totalInputBytes = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalInputPages = items.reduce((sum, item) => sum + item.pageCount, 0);

  return (
    <ToolLayout
      category="Organize"
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

      {/* 2. File List & Reorder */}
      {items.length > 0 && !mergedResult && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {items.length} {items.length === 1 ? "File" : "Files"} Selected ({totalInputPages} Pages)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total size: {formatBytes(totalInputBytes)} • Reorder files to adjust final page sequence
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Add PDFs</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Draggable/Reorderable List */}
          <div className="space-y-2.5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white border border-border hover:border-blue-300 rounded-xl p-3.5 sm:p-4 shadow-subtle flex items-center justify-between gap-3 transition-all"
              >
                {/* Index badge & file info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                      {item.file.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.pageCount} {item.pageCount === 1 ? "page" : "pages"} • {formatBytes(item.file.size)}
                    </p>
                  </div>
                </div>

                {/* Reorder and Delete Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    title="Move up"
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === items.length - 1}
                    title="Move down"
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    title="Remove file"
                    className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {processing && (
            <div className="bg-white border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {progressStatus}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Merge Action */}
          {!processing && (
            <button
              onClick={handleMerge}
              disabled={items.length < 2}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm sm:text-base shadow-button hover:shadow-button-hover transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>
                {items.length < 2
                  ? "Add at least 2 PDFs to merge"
                  : `Merge ${items.length} PDFs into 1 Document`}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 3. Result State */}
      {mergedResult && (
        <ResultCard
          title="PDFs Successfully Merged"
          filename="FlarePrint_Merged.pdf"
          resultSize={mergedResult.data.byteLength}
          onDownload={handleDownload}
          onReset={handleReset}
          resetButtonText="Merge more PDFs"
          extraStats={[
            { label: "Files Combined", value: `${items.length}` },
            { label: "Total Pages", value: `${mergedResult.totalPages}` },
          ]}
        />
      )}
    </ToolLayout>
  );
}
