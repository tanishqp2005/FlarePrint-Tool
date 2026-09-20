import { PDFDocument } from "pdf-lib";
import { formatBytes } from "./utils";

// Configure PDF.js worker dynamically in browser
export async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }
  return pdfjs;
}

export interface SplitResultFile {
  filename: string;
  data: Uint8Array;
  pageCount: number;
}

export interface CompressPdfResult {
  data: Uint8Array;
  originalSize: number;
  resultSize: number;
  targetSize: number;
  reductionPercent: number;
  targetAchieved: boolean;
  totalPages: number;
  recommendation?: string;
}

export interface ImageToPdfOptions {
  orientation: "auto" | "portrait" | "landscape";
  margin: "none" | "small" | "normal"; // 0, 18pt, 36pt
}

/**
 * Merges multiple PDF files in sequential order
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (percent: number, status: string) => void
): Promise<{ data: Uint8Array; totalPages: number }> {
  if (files.length === 0) throw new Error("No PDF files selected");

  onProgress?.(10, "Initializing merger...");
  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(
      Math.round(15 + ((i + 1) / files.length) * 75),
      `Merging ${file.name} (${i + 1} of ${files.length})...`
    );
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
      totalPages++;
    }
  }

  onProgress?.(95, "Compacting output PDF...");
  const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
  onProgress?.(100, "Done");
  return { data: pdfBytes, totalPages };
}

/**
 * Splits a PDF file by all pages or custom ranges
 */
export async function splitPdfFile(
  file: File,
  mode: "all" | "ranges",
  customRangeStr: string = "",
  onProgress?: (percent: number, status: string) => void
): Promise<SplitResultFile[]> {
  onProgress?.(10, "Loading PDF structure...");
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourceDoc.getPageCount();
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  const results: SplitResultFile[] = [];

  if (mode === "all") {
    for (let i = 0; i < totalPages; i++) {
      onProgress?.(
        Math.round(20 + ((i + 1) / totalPages) * 75),
        `Extracting page ${i + 1} of ${totalPages}...`
      );
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(sourceDoc, [i]);
      newDoc.addPage(copiedPage);
      const data = await newDoc.save({ useObjectStreams: true });
      results.push({
        filename: `${baseName}_page_${i + 1}.pdf`,
        data,
        pageCount: 1,
      });
    }
  } else {
    // Parse custom ranges: "1-2, 3, 4-6"
    const segments = customRangeStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (segments.length === 0) {
      throw new Error("Please specify at least one page or range (e.g. 1-2, 3)");
    }

    for (let idx = 0; idx < segments.length; idx++) {
      const seg = segments[idx];
      let pageIndices: number[] = [];
      let label = "";

      if (seg.includes("-")) {
        const parts = seg.split("-").map((p) => parseInt(p.trim(), 10));
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
          throw new Error(`Invalid range syntax: "${seg}". Format must be like 1-3`);
        }
        const start = Math.min(parts[0], parts[1]);
        const end = Math.max(parts[0], parts[1]);
        if (start < 1 || end > totalPages) {
          throw new Error(`Range "${seg}" is out of bounds (Document has ${totalPages} pages)`);
        }
        for (let p = start; p <= end; p++) {
          pageIndices.push(p - 1);
        }
        label = `pages_${start}-${end}`;
      } else {
        const p = parseInt(seg, 10);
        if (isNaN(p)) {
          throw new Error(`Invalid page number: "${seg}"`);
        }
        if (p < 1 || p > totalPages) {
          throw new Error(`Page ${p} is out of bounds (Document has ${totalPages} pages)`);
        }
        pageIndices.push(p - 1);
        label = `page_${p}`;
      }

      onProgress?.(
        Math.round(20 + ((idx + 1) / segments.length) * 75),
        `Extracting ${label}...`
      );

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
      for (const page of copiedPages) {
        newDoc.addPage(page);
      }
      const data = await newDoc.save({ useObjectStreams: true });
      results.push({
        filename: `${baseName}_${label}.pdf`,
        data,
        pageCount: pageIndices.length,
      });
    }
  }

  onProgress?.(100, "Done");
  return results;
}

/**
 * Converts multiple images to a single PDF
 */
export async function convertImagesToPdf(
  images: { file: File }[],
  options: ImageToPdfOptions,
  onProgress?: (percent: number, status: string) => void
): Promise<Uint8Array> {
  if (images.length === 0) throw new Error("No images provided");

  onProgress?.(10, "Creating PDF document...");
  const pdfDoc = await PDFDocument.create();

  // Margins in points: 72 points = 1 inch
  let marginPt = 0;
  if (options.margin === "small") marginPt = 18;
  if (options.margin === "normal") marginPt = 36;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    onProgress?.(
      Math.round(15 + ((i + 1) / images.length) * 80),
      `Processing image ${i + 1} of ${images.length}...`
    );
    const arrayBuffer = await item.file.arrayBuffer();

    let embeddedImage;
    const isPng = item.file.type === "image/png" || item.file.name.toLowerCase().endsWith(".png");
    if (isPng) {
      try {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } catch {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      }
    } else {
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      }
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    // Standard A4 dimensions: 595.28 x 841.89 points
    let pageWidth = 595.28;
    let pageHeight = 841.89;

    if (options.orientation === "landscape") {
      pageWidth = 841.89;
      pageHeight = 595.28;
    } else if (options.orientation === "auto") {
      if (imgWidth > imgHeight) {
        pageWidth = 841.89;
        pageHeight = 595.28;
      } else {
        pageWidth = 595.28;
        pageHeight = 841.89;
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate fitted dimensions within margins
    const availableWidth = pageWidth - marginPt * 2;
    const availableHeight = pageHeight - marginPt * 2;
    const scaleFactor = Math.min(availableWidth / imgWidth, availableHeight / imgHeight, 1);

    const drawWidth = imgWidth * scaleFactor;
    const drawHeight = imgHeight * scaleFactor;

    const x = marginPt + (availableWidth - drawWidth) / 2;
    const y = marginPt + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  onProgress?.(96, "Finalizing PDF...");
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  onProgress?.(100, "Done");
  return pdfBytes;
}

/**
 * Realistic, honest PDF Compression
 */
export async function compressPdfToTarget(
  file: File,
  targetSizeBytes: number,
  onProgress?: (percent: number, status: string) => void
): Promise<CompressPdfResult> {
  const originalSize = file.size;
  onProgress?.(15, "Analyzing PDF structure & dictionaries...");

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  // Strip excessive metadata to compact structure
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("FlarePrint Tools");
  pdfDoc.setCreator("FlarePrint Tools");

  onProgress?.(45, "Compacting cross-reference tables & streams...");
  let compressedBytes = await pdfDoc.save({ useObjectStreams: true });

  onProgress?.(85, "Evaluating achieved size vs target...");
  let resultSize = compressedBytes.byteLength;

  // Tolerance: within 8% or less of target
  let targetAchieved = resultSize <= targetSizeBytes * 1.08;
  let recommendation: string | undefined = undefined;

  // If the target is significantly lower than original and could not be met via stream compaction alone:
  if (!targetAchieved) {
    const recommendedPreset =
      targetSizeBytes < 500 * 1024
        ? "500 KB or 1 MB"
        : targetSizeBytes < 1024 * 1024
        ? "2 MB"
        : "a larger target";

    recommendation = `This PDF contains vector graphics, embedded typography, or is already optimized. We couldn't safely reduce it to ${formatBytes(
      targetSizeBytes
    )} without destructive data loss. Try selecting ${recommendedPreset}.`;
  }

  const reductionPercent = Math.max(
    0,
    Math.round(((originalSize - resultSize) / originalSize) * 100)
  );

  onProgress?.(100, "Compression complete");

  return {
    data: compressedBytes,
    originalSize,
    resultSize,
    targetSize: targetSizeBytes,
    reductionPercent,
    targetAchieved,
    totalPages,
    recommendation,
  };
}

/**
 * Render a specific page of a PDF file to an HTML Canvas
 */
export async function renderPdfPageToCanvas(
  pdfData: ArrayBuffer | Uint8Array,
  pageNumber: number,
  scale: number = 1.0,
  canvas: HTMLCanvasElement
): Promise<void> {
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get canvas context");

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
}
