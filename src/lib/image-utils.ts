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
  previewUrl: string;
}

export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image: " + err));
    };
    img.src = url;
  });
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg",
  quality: number = 0.92
): Promise<{ blob: Blob; width: number; height: number; size: number; previewUrl: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(targetWidth));
  canvas.height = Math.max(1, Math.round(targetHeight));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2D context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // White background for transparent PNG converted to JPEG
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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

export async function compressJpgToTarget(
  file: File,
  targetSizeBytes: number,
  onProgress?: (percent: number) => void
): Promise<CompressImageResult> {
  const originalSize = file.size;
  const img = await loadImage(file);
  let currentWidth = img.naturalWidth;
  let currentHeight = img.naturalHeight;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context initialization failed");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Helper to test a canvas at a given quality
  const testCanvas = (q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/jpeg",
        q
      );
    });
  };

  const drawCurrent = () => {
    canvas.width = Math.max(1, Math.round(currentWidth));
    canvas.height = Math.max(1, Math.round(currentHeight));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  drawCurrent();

  // Binary search for JPEG quality
  let low = 0.05;
  let high = 0.95;
  let bestBlob: Blob | null = null;
  let bestQuality = high;

  for (let iter = 0; iter < 7; iter++) {
    const mid = (low + high) / 2;
    onProgress?.(Math.round(((iter + 1) / 8) * 70));
    const testBlob = await testCanvas(mid);

    if (testBlob.size <= targetSizeBytes) {
      bestBlob = testBlob;
      bestQuality = mid;
      low = mid; // Try to get higher quality while staying under target
    } else {
      high = mid;
    }
  }

  // If even lowest quality is larger than target size, downscale dimensions
  let scaleIter = 0;
  while ((!bestBlob || bestBlob.size > targetSizeBytes) && scaleIter < 4) {
    scaleIter++;
    const scaleFactor = 0.8;
    currentWidth *= scaleFactor;
    currentHeight *= scaleFactor;
    drawCurrent();

    onProgress?.(70 + Math.round((scaleIter / 4) * 25));
    const blobAtLowQ = await testCanvas(0.65);
    if (blobAtLowQ.size <= targetSizeBytes || scaleIter === 4) {
      bestBlob = blobAtLowQ;
      bestQuality = 0.65;
      break;
    }
  }

  onProgress?.(100);

  // If no blob under target could be found, use the smallest one achieved
  if (!bestBlob) {
    bestBlob = await testCanvas(0.1);
    bestQuality = 0.1;
  }

  const resultSize = bestBlob.size;
  const reductionPercent = Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100));
  const targetAchieved = resultSize <= targetSizeBytes * 1.08; // 8% tolerance threshold

  return {
    blob: bestBlob,
    originalSize,
    resultSize,
    targetSize: targetSizeBytes,
    reductionPercent,
    targetAchieved,
    finalQuality: Math.round(bestQuality * 100),
    width: Math.round(currentWidth),
    height: Math.round(currentHeight),
    previewUrl: URL.createObjectURL(bestBlob),
  };
}
