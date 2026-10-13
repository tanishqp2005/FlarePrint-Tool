import { PDFDocument, PDFName, PDFNumber, PDFRawStream } from "pdf-lib";
import { formatBytes } from "./utils";

// Configure PDF.js worker dynamically in browser
export async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }
  return pdfjs;
}

export type PdfCompressionMode = "balanced" | "strong" | "maximum";

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
  methodUsed: string;
  isRasterized: boolean;
  dpi?: number;
  previewUrl?: string;
  recommendation?: string;
  warningNote?: string;
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
 * Re-encodes raw JPEG bytes using HTML Canvas at a lower quality or scaled dimension
 */
async function reencodeJpegBytes(
  jpegBytes: Uint8Array,
  quality: number,
  maxDimension: number = 2000
): Promise<Uint8Array | null> {
  if (typeof window === "undefined") return null;

  try {
    const blob = new Blob([jpegBytes as any], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    URL.revokeObjectURL(url);

    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (w <= 0 || h <= 0) return null;

    if (Math.max(w, h) > maxDimension) {
      const scale = maxDimension / Math.max(w, h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    const newBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!newBlob) return null;
    const buf = await newBlob.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

/**
 * Render a single page of a PDF via PDF.js to a compressed JPEG
 */
async function renderPageToJpg(
  pdf: any,
  pageNumber: number,
  dpi: number,
  quality: number
): Promise<{
  jpgBytes: Uint8Array;
  pageWidthPt: number;
  pageHeightPt: number;
  previewDataUrl?: string;
}> {
  const page = await pdf.getPage(pageNumber);
  const scale = dpi / 72.0;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas 2D context");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // White background for pages
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      quality
    );
  });

  const arrayBuf = await blob.arrayBuffer();
  const previewDataUrl = pageNumber === 1 ? canvas.toDataURL("image/jpeg", 0.65) : undefined;

  return {
    jpgBytes: new Uint8Array(arrayBuf),
    pageWidthPt: viewport.width / scale,
    pageHeightPt: viewport.height / scale,
    previewDataUrl,
  };
}

/**
 * Multi-Stage Target-Size PDF Compression
 */
export async function compressPdfToTarget(
  file: File,
  targetSizeBytes: number,
  options: {
    mode?: PdfCompressionMode;
    allowRasterization?: boolean;
    onProgress?: (percent: number, status: string) => void;
  } = {}
): Promise<CompressPdfResult> {
  const { mode = "balanced", allowRasterization = false, onProgress } = options;
  const originalSize = file.size;

  onProgress?.(10, "Loading PDF structure & dictionaries...");
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  // -------------------------------------------------------------
  // STAGE 1: Lossless Stream Compaction & Metadata Optimization
  // -------------------------------------------------------------
  onProgress?.(20, "Stage 1: Removing redundant metadata and optimizing object streams...");

  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("FlarePrint Tools");
  pdfDoc.setCreator("FlarePrint Tools");

  // Remove XML metadata stream if present in catalog
  try {
    const catalog = pdfDoc.catalog;
    if (catalog.has(PDFName.of("Metadata"))) {
      catalog.delete(PDFName.of("Metadata"));
    }
  } catch {
    // Ignore catalog metadata deletion errors
  }

  const stage1Bytes = await pdfDoc.save({ useObjectStreams: true });
  let bestResultBytes = stage1Bytes;
  let bestMethod = "Lossless Stream Compaction (Metadata & Object Streams)";
  let isRasterized = false;

  // Strict check: Is target achieved without modifying visual content?
  if (stage1Bytes.byteLength <= targetSizeBytes) {
    onProgress?.(100, "Done");
    const resultSize = stage1Bytes.byteLength;
    const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));

    return {
      data: stage1Bytes,
      originalSize,
      resultSize,
      targetSize: targetSizeBytes,
      reductionPercent,
      targetAchieved: true,
      totalPages,
      methodUsed: bestMethod,
      isRasterized: false,
    };
  }

  // -------------------------------------------------------------
  // STAGE 2: Embedded Image Optimization (Preserves vectors & text)
  // -------------------------------------------------------------
  onProgress?.(35, "Stage 2: Scanning for embedded raster images...");

  const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
  const imageStreamRefs: { ref: any; stream: PDFRawStream }[] = [];

  for (const [ref, obj] of indirectObjects) {
    if (obj instanceof PDFRawStream) {
      const subtype = obj.dict.get(PDFName.of("Subtype"));
      if (subtype && subtype.toString() === "/Image") {
        const filter = obj.dict.get(PDFName.of("Filter"));
        // Check for JPEG images encoded as DCTDecode
        if (filter && filter.toString().includes("DCTDecode")) {
          imageStreamRefs.push({ ref, stream: obj });
        }
      }
    }
  }

  if (imageStreamRefs.length > 0) {
    onProgress?.(
      45,
      `Stage 2: Found ${imageStreamRefs.length} embedded images. Optimizing compression...`
    );

    let imageQuality = 0.70;
    let maxDim = 2000;
    if (mode === "strong") {
      imageQuality = 0.55;
      maxDim = 1600;
    } else if (mode === "maximum") {
      imageQuality = 0.40;
      maxDim = 1200;
    }

    let optimizedAny = false;
    for (let i = 0; i < imageStreamRefs.length; i++) {
      const item = imageStreamRefs[i];
      const reencoded = await reencodeJpegBytes(item.stream.contents, imageQuality, maxDim);

      if (reencoded && reencoded.length < item.stream.contents.length) {
        optimizedAny = true;
        const newStream = PDFRawStream.of(item.stream.dict, reencoded);
        item.stream.dict.set(PDFName.of("Length"), PDFNumber.of(reencoded.length));
        pdfDoc.context.assign(item.ref, newStream);
      }
    }

    if (optimizedAny) {
      onProgress?.(60, "Stage 2: Recompiling PDF with optimized images...");
      const stage2Bytes = await pdfDoc.save({ useObjectStreams: true });

      if (stage2Bytes.byteLength < bestResultBytes.byteLength) {
        bestResultBytes = stage2Bytes;
        bestMethod = "Embedded Image Optimization (Searchable text & vector paths preserved)";
      }

      if (stage2Bytes.byteLength <= targetSizeBytes) {
        onProgress?.(100, "Done");
        const resultSize = stage2Bytes.byteLength;
        const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));

        return {
          data: stage2Bytes,
          originalSize,
          resultSize,
          targetSize: targetSizeBytes,
          reductionPercent,
          targetAchieved: true,
          totalPages,
          methodUsed: bestMethod,
          isRasterized: false,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // STAGE 3: Aggressive Page Rasterization Fallback
  // -------------------------------------------------------------
  const canRasterize = mode === "strong" || mode === "maximum" || allowRasterization;

  if (canRasterize) {
    onProgress?.(65, "Stage 3: Preparing adaptive page rasterization...");

    try {
      const pdfjs = await getPdfJs();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      // Approximate allowable size per page
      const overheadBytes = Math.min(16000, 2048 + numPages * 1024);
      const targetPerImage = Math.max(4000, (targetSizeBytes - overheadBytes) / numPages);

      // Define candidate configurations [DPI, quality]
      const candidates: [number, number][] = [
        [150, 0.75],
        [150, 0.60],
        [120, 0.70],
        [120, 0.55],
        [96, 0.65],
        [96, 0.50],
        [72, 0.65],
        [72, 0.50],
        [72, 0.35],
        [50, 0.45],
        [50, 0.30],
      ];

      // Filter candidates based on mode
      let filteredCandidates = candidates;
      if (mode === "strong") {
        filteredCandidates = candidates.filter(([dpi, q]) => dpi >= 72 || q >= 0.40);
      } else if (mode === "maximum") {
        filteredCandidates = candidates;
      }

      // Sample page 1 to find best DPI and quality that fits the target per page
      let bestDpi = 72;
      let bestQ = 0.50;
      let matchedCandidate = false;

      for (let c = 0; c < filteredCandidates.length; c++) {
        const [dpi, q] = filteredCandidates[c];
        const sample = await renderPageToJpg(pdf, 1, dpi, q);

        if (sample.jpgBytes.byteLength <= targetPerImage) {
          bestDpi = dpi;
          bestQ = q;
          matchedCandidate = true;
          break;
        }
      }

      // If even lowest candidate exceeds sample target, pick the lowest candidate
      if (!matchedCandidate) {
        const lastCand = filteredCandidates[filteredCandidates.length - 1];
        bestDpi = lastCand[0];
        bestQ = lastCand[1];
      }

      onProgress?.(75, `Stage 3: Rendering ${numPages} pages at ${bestDpi} DPI (${Math.round(bestQ * 100)}% quality)...`);

      const rasterPdf = await PDFDocument.create();
      let firstPagePreview: string | undefined = undefined;

      for (let p = 1; p <= numPages; p++) {
        onProgress?.(
          75 + Math.round((p / numPages) * 20),
          `Rendering & compressing page ${p} of ${numPages}...`
        );

        const rendered = await renderPageToJpg(pdf, p, bestDpi, bestQ);
        if (p === 1 && rendered.previewDataUrl) {
          firstPagePreview = rendered.previewDataUrl;
        }

        const embeddedJpg = await rasterPdf.embedJpg(rendered.jpgBytes);
        const newPage = rasterPdf.addPage([rendered.pageWidthPt, rendered.pageHeightPt]);
        newPage.drawImage(embeddedJpg, {
          x: 0,
          y: 0,
          width: rendered.pageWidthPt,
          height: rendered.pageHeightPt,
        });
      }

      onProgress?.(96, "Stage 3: Compacting rasterized PDF streams...");
      const rasterBytes = await rasterPdf.save({ useObjectStreams: true });

      // Compare if rasterized output is smaller or met the target
      if (rasterBytes.byteLength <= targetSizeBytes || rasterBytes.byteLength < bestResultBytes.byteLength) {
        bestResultBytes = rasterBytes;
        isRasterized = true;
        bestMethod = `Page Rasterization (${bestDpi} DPI, ${Math.round(bestQ * 100)}% Quality)`;
      }

      onProgress?.(100, "Done");
      const resultSize = bestResultBytes.byteLength;
      const targetAchieved = resultSize <= targetSizeBytes; // Strict check
      const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));

      let recommendation: string | undefined = undefined;
      let warningNote: string | undefined = undefined;

      if (isRasterized) {
        warningNote = "Notice: Pages were flattened to compressed images to reach your target size. Selectable text and vector paths have been converted to image format.";
      }

      if (!targetAchieved) {
        recommendation = `This ${numPages}-page document could not be reduced below ${formatBytes(resultSize)} without unreadable resolution. Try selecting a larger target size (e.g. ${formatBytes(Math.ceil(resultSize / 1024 / 50) * 50 * 1024)}).`;
      }

      return {
        data: bestResultBytes,
        originalSize,
        resultSize,
        targetSize: targetSizeBytes,
        reductionPercent,
        targetAchieved,
        totalPages,
        methodUsed: bestMethod,
        isRasterized,
        dpi: bestDpi,
        previewUrl: firstPagePreview,
        recommendation,
        warningNote,
      };
    } catch {
      // If rasterization encounters an error (e.g. password-protected or unsupported worker), proceed with best lossless result
    }
  }

  // If rasterization was not enabled (e.g. Balanced mode) and target remains unmet:
  onProgress?.(100, "Done");
  const resultSize = bestResultBytes.byteLength;
  const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));
  const targetAchieved = resultSize <= targetSizeBytes;

  const recommendation = `Target size (${formatBytes(targetSizeBytes)}) could not be reached with lossless and image optimization alone (best achieved: ${formatBytes(resultSize)}). Switch to Strong or Maximum mode to enable page rasterization fallback, or select a larger target size.`;

  return {
    data: bestResultBytes,
    originalSize,
    resultSize,
    targetSize: targetSizeBytes,
    reductionPercent,
    targetAchieved,
    totalPages,
    methodUsed: bestMethod,
    isRasterized: false,
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
