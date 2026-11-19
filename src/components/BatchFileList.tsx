"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  X,
  UploadCloud,
} from "lucide-react";
import { formatBytes, getFileExtension } from "@/lib/utils";

export interface BatchFileItem {
  id: string;
  file: File;
  extraInfo?: string;
  previewUrl?: string;
}

interface BatchFileListProps {
  files: BatchFileItem[];
  accept: string;
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  allowReorder?: boolean;
  onMove?: (index: number, direction: "up" | "down") => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
  disabled?: boolean;
  title?: string;
}

export function BatchFileList({
  files,
  accept,
  onAddFiles,
  onRemoveFile,
  onClearAll,
  allowReorder = false,
  onMove,
  onReorder,
  disabled = false,
  title,
}: BatchFileListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const totalBytes = files.reduce((acc, item) => acc + item.file.size, 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || !e.dataTransfer.files) return;

    const filesArray = Array.from(e.dataTransfer.files);
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const validFiles = filesArray.filter((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const mime = file.type.toLowerCase();
      return acceptedTypes.some((type) => {
        if (type.startsWith(".")) return ext === type;
        if (type.endsWith("/*")) return mime.startsWith(type.replace("/*", ""));
        return mime === type || ext === type;
      });
    });

    if (validFiles.length > 0) {
      onAddFiles(validFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  // Drag and drop reordering between list items
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    if (!allowReorder || disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    if (!allowReorder || disabled || draggedIndex === null) return;
    e.preventDefault();
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!allowReorder || disabled || draggedIndex === null || draggedIndex === targetIndex) return;
    e.preventDefault();
    if (onReorder) {
      onReorder(draggedIndex, targetIndex);
    } else if (onMove) {
      const diff = targetIndex - draggedIndex;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) onMove(draggedIndex + i, "down");
      } else {
        for (let i = 0; i < Math.abs(diff); i++) onMove(draggedIndex - i, "up");
      }
    }
    setDraggedIndex(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white border rounded-sm p-4 sm:p-5 shadow-flare transition-colors ${
        isDragOver ? "border-[#2860E8] bg-[#EBF1FD]/30 ring-2 ring-[#2860E8]/20" : "border-[#D5DCE6]"
      }`}
    >
      {/* Top Bar with Counts and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D5DCE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#2860E8]" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111111]">
              {title || `${files.length} ${files.length === 1 ? "FILE" : "FILES"} SELECTED`}
            </h3>
          </div>
          <p className="text-[11px] text-[#556275] mt-0.5">
            Total size: <span className="font-bold text-[#111111] font-mono">{formatBytes(totalBytes)}</span>
            {allowReorder && " • Drag or use arrows to reorder"}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:border-[#2860E8] hover:bg-[#F3F6FA] text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-[#2860E8]" />
            <span>Add More</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <button
            type="button"
            disabled={disabled}
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-sm border border-[#D5DCE6] hover:bg-red-50 hover:border-red-200 text-xs font-bold uppercase tracking-wider text-[#556275] hover:text-red-600 transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="mt-3 divide-y divide-[#D5DCE6]/60 max-h-80 overflow-y-auto pr-1">
        {files.map((item, index) => {
          const ext = getFileExtension(item.file.name) || "FILE";
          const isPdf = ext === "PDF" || item.file.type === "application/pdf";

          return (
            <div
              key={item.id}
              draggable={allowReorder && !disabled}
              onDragStart={(e) => handleItemDragStart(e, index)}
              onDragOver={(e) => handleItemDragOver(e, index)}
              onDrop={(e) => handleItemDrop(e, index)}
              className={`py-2.5 px-2 flex items-center gap-3 transition-colors rounded-sm ${
                draggedIndex === index
                  ? "opacity-50 bg-[#F3F6FA]"
                  : "hover:bg-[#F3F6FA]/70"
              }`}
            >
              {/* Optional reorder handle / index badge */}
              {allowReorder && (
                <div className="flex items-center gap-0.5 text-[#556275] flex-shrink-0">
                  <div className="cursor-grab active:cursor-grabbing p-0.5" title="Drag to reorder">
                    <GripVertical className="w-4 h-4 text-[#556275]/70" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#556275] w-4 text-center">
                    {index + 1}
                  </span>
                </div>
              )}

              {/* Thumbnail or File Type Icon */}
              {item.previewUrl ? (
                <div className="w-9 h-9 rounded-sm overflow-hidden border border-[#D5DCE6] bg-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-sm bg-[#F3F6FA] border border-[#D5DCE6] text-[#2860E8] flex items-center justify-center flex-shrink-0">
                  {isPdf ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
              )}

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-bold text-[#111111] truncate max-w-[240px] sm:max-w-sm">
                    {item.file.name}
                  </p>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-[#F3F6FA] border border-[#D5DCE6] text-[#556275]">
                    {ext}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#556275] mt-0.5">
                  <span className="font-mono font-semibold">{formatBytes(item.file.size)}</span>
                  {item.extraInfo && (
                    <>
                      <span>•</span>
                      <span>{item.extraInfo}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Reorder Arrows (if enabled) */}
              {allowReorder && onMove && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => onMove(index, "up")}
                    className="p-1 rounded-sm border border-[#D5DCE6] hover:bg-white text-[#556275] disabled:opacity-30 disabled:pointer-events-none"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === files.length - 1}
                    onClick={() => onMove(index, "down")}
                    className="p-1 rounded-sm border border-[#D5DCE6] hover:bg-white text-[#556275] disabled:opacity-30 disabled:pointer-events-none"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveFile(item.id)}
                className="p-1.5 rounded-sm hover:bg-red-50 text-[#556275] hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-30"
                title="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Drag more helper at bottom */}
      <div className="mt-3 pt-2 border-t border-[#D5DCE6]/60 flex items-center justify-between text-[11px] text-[#556275]">
        <span className="flex items-center gap-1">
          <UploadCloud className="w-3.5 h-3.5 text-[#2860E8]" />
          <span>Drop more files here anytime to append</span>
        </span>
        <span className="font-mono font-medium">{files.length} items</span>
      </div>
    </div>
  );
}
