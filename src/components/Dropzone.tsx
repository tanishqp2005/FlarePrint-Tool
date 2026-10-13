"use client";

import React, { useState, useRef } from "react";
import { ArrowUp, AlertCircle, UploadCloud } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  title?: string;
  buttonText?: string;
  helperText?: string;
  formatBadges?: string[];
  maxSizeBytes?: number; // e.g. 50 * 1024 * 1024
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function Dropzone({
  accept,
  multiple = false,
  title = "Drop your file here",
  buttonText = "or browse files",
  helperText,
  formatBadges,
  maxSizeBytes = 50 * 1024 * 1024,
  onFilesSelected,
  className,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive format badges if not explicitly passed
  const badges =
    formatBadges ||
    (accept.includes("pdf") && (accept.includes("image") || accept.includes("jpg"))
      ? ["PDF", "JPG", "PNG"]
      : accept.includes("pdf")
      ? ["PDF"]
      : ["JPG", "JPEG", "PNG"]);

  const handleFiles = (fileList: FileList | null) => {
    setErrorMessage(null);
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // Validate file sizes
    const oversized = filesArray.find((f) => f.size > maxSizeBytes);
    if (oversized) {
      setErrorMessage(
        `File "${oversized.name}" exceeds the maximum supported size of ${formatBytes(
          maxSizeBytes
        )}.`
      );
      return;
    }

    // Validate mime types or extension
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

    if (validFiles.length === 0) {
      setErrorMessage(`Please upload a supported file matching: ${badges.join(", ")}`);
      return;
    }

    if (!multiple && validFiles.length > 1) {
      onFilesSelected([validFiles[0]]);
    } else {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
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
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 group bg-white select-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
          isDragOver
            ? "border-blue-600 bg-blue-50/60 scale-[1.01] shadow-glow-blue"
            : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/50 shadow-card hover:shadow-card-hover"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          {/* Upload icon inside a subtle circular/pill container */}
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-2xs",
              isDragOver
                ? "bg-blue-600 text-white scale-110"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105"
            )}
          >
            <ArrowUp className="w-6 h-6 stroke-[2.5]" />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              <span className="text-blue-600 font-semibold group-hover:underline">{buttonText}</span>
            </p>
          </div>

          {/* Supported formats */}
          <div className="flex items-center gap-1.5 pt-1 text-slate-400 text-xs font-semibold">
            {badges.map((b, i) => (
              <React.Fragment key={b}>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] border border-slate-200/80">
                  {b}
                </span>
                {i < badges.length - 1 && <span className="text-slate-300">•</span>}
              </React.Fragment>
            ))}
          </div>

          {helperText && (
            <p className="text-[11px] text-slate-400 font-normal">{helperText}</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
