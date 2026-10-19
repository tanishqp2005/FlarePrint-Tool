import { formatBytes } from "./utils";

export type JpgCompressionMode = "balanced" | "strong" | "maximum";

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressImageResult {
  blob: Blob;
  originalSize: number;
  resultSize: number;
  targetSize: number;
  reductionPercent: number;
  targetAchieved: boolean;
  finalQuality: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  methodUsed: string;
  previewUrl: string;
  recommendation?: string;
  warningNote?: string;
}

/**
 * Loads an image preserving EXIF orientation where supported
 */
export async function loadImageWithExif(file: File | Blob): Promise<{
  drawable: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof window !== "undefined" && typeof window.createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        drawable: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          bitmap.close();
        },
      };
    } catch {
      // Fallback to standard Image element if createImageBitmap orientation is unsupported
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        drawable: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => {
          URL.revokeObjectURL(url);
        },
      });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image: " + err));
    };
    img.src = url;
  });
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  const loaded = await loadImageWithExif(file);
  const dims = { width: loaded.width, height: loaded.height };
  loaded.cleanup();
  return dims;
}

/**
 * Convert canvas to JPEG blob with white background for transparency
 */
function canvasToJpgBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      Math.max(0.05, Math.min(1.0, quality))
    );
  });
}

/**
 * Draw image onto a canvas with specified dimensions and background color
 */
function drawToCanvas(
  drawable: CanvasImageSource,
  targetWidth: number,
  targetHeight: number,
  bgColor: string = "#ffffff"
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(targetWidth));
  canvas.height = Math.max(1, Math.round(targetHeight));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Solid background to cleanly handle transparent PNGs converting to JPEG
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);

  return canvas;
}

/**
 * Resizes an image file directly
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg",
  quality: number = 0.92
): Promise<{ blob: Blob; width: number; height: number; size: number; previewUrl: string }> {
  const loaded = await loadImageWithExif(file);
  const canvas = drawToCanvas(loaded.drawable, targetWidth, targetHeight, "#ffffff");
  loaded.cleanup();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas blob conversion failed"));
        resolve({
          blob,
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
          previewUrl: URL.createObjectURL(blob),
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Binary search for optimal JPEG quality on a given canvas
 */
async function binarySearchQuality(
  canvas: HTMLCanvasElement,
  targetBytes: number,
  minQ: number,
  maxQ: number,
  iterations: number = 6
): Promise<{ blob: Blob; quality: number; sizeMatches: boolean }> {
  let low = minQ;
  let high = maxQ;
  let bestBlob: Blob | null = null;
  let bestQ = low;

  // First check if high quality already satisfies the target
  const maxBlob = await canvasToJpgBlob(canvas, maxQ);
  if (maxBlob.size <= targetBytes) {
    return { blob: maxBlob, quality: maxQ, sizeMatches: true };
  }

  // Check if minimum quality can satisfy the target
  const minBlob = await canvasToJpgBlob(canvas, minQ);
  if (minBlob.size > targetBytes) {
    return { blob: minBlob, quality: minQ, sizeMatches: false };
  }

  bestBlob = minBlob;
  bestQ = minQ;

  for (let i = 0; i < iterations; i++) {
    const mid = (low + high) / 2;
    const testBlob = await canvasToJpgBlob(canvas, mid);

    if (testBlob.size <= targetBytes) {
      bestBlob = testBlob;
      bestQ = mid;
      low = mid; // Try higher quality
    } else {
      high = mid; // Needs stronger compression
    }
  }

  return {
    blob: bestBlob || minBlob,
    quality: bestQ,
    sizeMatches: (bestBlob?.size ?? minBlob.size) <= targetBytes,
  };
}

/**
 * Intelligent, multi-stage JPEG Target Size Compression
 */
export async function compressJpgToTarget(
  file: File,
  targetSizeBytes: number,
  mode: JpgCompressionMode = "strong",
  onProgress?: (percent: number, status?: string) => void
): Promise<CompressImageResult> {
  const originalSize = file.size;
  onProgress?.(10, "Decoding image & EXIF orientation...");

  const loaded = await loadImageWithExif(file);
  const origW = loaded.width;
  const origH = loaded.height;

  // Determine compression limits based on selected mode
  let minQuality = 0.35;
  let minScale = 0.50;
  if (mode === "strong") {
    minQuality = 0.20;
    minScale = 0.25;
  } else if (mode === "maximum") {
    minQuality = 0.10;
    minScale = 0.10;
  }

  onProgress?.(25, "Testing quality compression at 100% dimensions...");
  const fullCanvas = drawToCanvas(loaded.drawable, origW, origH, "#ffffff");

  // Step 1: Attempt to meet target size using quality reduction at original dimensions
  const fullDimResult = await binarySearchQuality(fullCanvas, targetSizeBytes, minQuality, 0.95, 7);

  if (fullDimResult.sizeMatches) {
    loaded.cleanup();
    onProgress?.(100, "Done");
    const resultSize = fullDimResult.blob.size;
    const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));

    return {
      blob: fullDimResult.blob,
      originalSize,
      resultSize,
      targetSize: targetSizeBytes,
      reductionPercent,
      targetAchieved: resultSize <= targetSizeBytes,
      finalQuality: Math.round(fullDimResult.quality * 100),
      width: origW,
      height: origH,
      originalWidth: origW,
      originalHeight: origH,
      methodUsed: `Quality Optimization (${Math.round(fullDimResult.quality * 100)}% quality, 100% dimensions)`,
      previewUrl: URL.createObjectURL(fullDimResult.blob),
    };
  }

  // Step 2: Quality alone at full resolution cannot reach target size.
  // Progressively downscale dimensions while searching quality at each step.
  onProgress?.(45, "Quality alone insufficient. Adjusting dimensions...");

  // Approximate required scale based on area scaling (size ~ width * height)
  const estimatedScale = Math.sqrt(targetSizeBytes / fullDimResult.blob.size) * 0.95;

  // Candidate scale steps ordered from largest dimensions to smallest
  const standardScales = [0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.25, 0.20, 0.15, 0.10];
  const candidateScales = Array.from(
    new Set(
      [estimatedScale, ...standardScales]
        .filter((s) => s <= 0.95 && s >= minScale)
        .map((s) => parseFloat(s.toFixed(2)))
    )
  ).sort((a, b) => b - a);

  let bestMatchingResult: {
    blob: Blob;
    quality: number;
    width: number;
    height: number;
    scale: number;
  } | null = null;

  let closestFallbackResult: {
    blob: Blob;
    quality: number;
    width: number;
    height: number;
    scale: number;
  } | null = null;

  for (let idx = 0; idx < candidateScales.length; idx++) {
    const scale = candidateScales[idx];
    const progress = 45 + Math.round(((idx + 1) / candidateScales.length) * 50);
    const currW = Math.max(16, Math.round(origW * scale));
    const currH = Math.max(16, Math.round(origH * scale));

    onProgress?.(progress, `Testing dimensions ${currW}×${currH} (${Math.round(scale * 100)}%)...`);

    const scaledCanvas = drawToCanvas(loaded.drawable, currW, currH, "#ffffff");
    const scaledResult = await binarySearchQuality(scaledCanvas, targetSizeBytes, minQuality, 0.92, 6);

    if (scaledResult.sizeMatches) {
      const candidate = {
        blob: scaledResult.blob,
        quality: scaledResult.quality,
        width: currW,
        height: currH,
        scale,
      };

      if (!bestMatchingResult) {
        bestMatchingResult = candidate;
      } else {
        // Prefer higher visual quality if previous match had lower quality
        if (scaledResult.quality >= 0.65 && bestMatchingResult.quality < 0.65) {
          bestMatchingResult = candidate;
        }
      }

      // If quality is high (>= 0.70), this is an optimal balance of dimension and quality
      if (scaledResult.quality >= 0.70) {
        break;
      }
    } else {
      // Track the closest attempt (lowest file size) in case target cannot be reached
      if (!closestFallbackResult || scaledResult.blob.size < closestFallbackResult.blob.size) {
        closestFallbackResult = {
          blob: scaledResult.blob,
          quality: scaledResult.quality,
          width: currW,
          height: currH,
          scale,
        };
      }
    }
  }

  loaded.cleanup();
  onProgress?.(100, "Done");

  const bestResult = bestMatchingResult || closestFallbackResult || {
    blob: fullDimResult.blob,
    quality: fullDimResult.quality,
    width: origW,
    height: origH,
    scale: 1.0,
  };

  const resultSize = bestResult.blob.size;
  const targetAchieved = resultSize <= targetSizeBytes; // Strict check
  const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));

  let methodUsed = `Quality & Dimension Scaling (${Math.round(bestResult.scale * 100)}% scale, ${Math.round(bestResult.quality * 100)}% quality)`;
  let recommendation: string | undefined = undefined;
  let warningNote: string | undefined = undefined;

  if (targetAchieved) {
    if (bestResult.scale < 0.50 || bestResult.quality < 0.40) {
      warningNote = "Strong dimension scaling or lower quality was required to reach this target size.";
    }
  } else {
    const suggestedKb = Math.ceil((resultSize * 1.05) / 1024 / 10) * 10;
    if (mode === "balanced") {
      recommendation = `Target size (${formatBytes(targetSizeBytes)}) could not be reached within Balanced mode constraints (best achieved: ${formatBytes(resultSize)} at ${bestResult.width}×${bestResult.height} px). Switch to Strong or Maximum mode for more aggressive compression, or select a larger target size (e.g. ${suggestedKb} KB).`;
    } else if (mode === "strong") {
      recommendation = `Target size (${formatBytes(targetSizeBytes)}) could not be reached within Strong mode constraints (best achieved: ${formatBytes(resultSize)} at ${bestResult.width}×${bestResult.height} px). Try choosing Maximum Compression mode or select a more realistic target size (e.g. ${suggestedKb} KB).`;
    } else {
      recommendation = `Target size (${formatBytes(targetSizeBytes)}) could not be reached even within Maximum mode constraints (best achieved: ${formatBytes(resultSize)} at ${bestResult.width}×${bestResult.height} px). Try selecting a more realistic target size (e.g. ${suggestedKb} KB).`;
    }
  }

  return {
    blob: bestResult.blob,
    originalSize,
    resultSize,
    targetSize: targetSizeBytes,
    reductionPercent,
    targetAchieved,
    finalQuality: Math.round(bestResult.quality * 100),
    width: bestResult.width,
    height: bestResult.height,
    originalWidth: origW,
    originalHeight: origH,
    methodUsed,
    previewUrl: URL.createObjectURL(bestResult.blob),
    recommendation,
    warningNote,
  };
}
