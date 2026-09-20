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
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group bg-white",
          isDragOver
            ? "border-blue-600 bg-blue-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/60 shadow-subtle"
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
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm",
              isDragOver
                ? "bg-blue-600 text-white scale-110"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            )}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
              {title}
            </h3>
            <p className="text-sm text-slate-400 font-medium">or</p>
          </div>

          <button
            type="button"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-button hover:shadow-button-hover transition-all pointer-events-none"
          >
            {buttonText}
          </button>

          {helperText && (
            <p className="text-xs text-slate-400 mt-2">{helperText}</p>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
