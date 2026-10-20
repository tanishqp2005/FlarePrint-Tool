"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  title: string;
  buttonText: string;
  helperText?: string;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function Dropzone({
  accept,
  multiple = false,
  title,
  buttonText,
  helperText,
  onFilesSelected,
  className,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    setErrorMessage(null);
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

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
      setErrorMessage(`Please upload a valid file matching: ${accept}`);
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
    <div className={cn("w-full max-w-xl mx-auto", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload document or image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "relative border-2 border-dashed rounded-sm p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group bg-white focus:outline-none focus:ring-2 focus:ring-[#2860E8] focus:border-[#2860E8]",
          isDragOver
            ? "border-[#2860E8] bg-[#EBF1FD]/40 scale-[1.01]"
            : "border-[#D5DCE6] hover:border-[#2860E8] hover:bg-[#F3F6FA]/60 shadow-subtle"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div
            className={cn(
              "w-14 h-14 rounded-sm border flex items-center justify-center transition-all duration-200",
              isDragOver
                ? "bg-[#2860E8] text-white border-[#2860E8] scale-105"
                : "bg-[#F3F6FA] text-[#2860E8] border-[#D5DCE6] group-hover:bg-[#2860E8] group-hover:text-white group-hover:border-[#2860E8]"
            )}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#111111]">
              {title}
            </h3>
            <p className="text-xs text-[#556275] uppercase font-bold tracking-wider">or</p>
          </div>

          <button
            type="button"
            className="px-6 py-2.5 rounded-sm bg-[#2860E8] group-hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider shadow-button transition-all pointer-events-none"
          >
            {buttonText.toUpperCase()}
          </button>

          {helperText && (
            <p className="text-[11px] text-[#556275] pt-1 font-medium">{helperText}</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
