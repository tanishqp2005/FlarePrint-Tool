import JSZip from "jszip";

export interface ZipFileItem {
  name: string;
  data: Blob | Uint8Array | ArrayBuffer | string;
}

export async function createZipBundle(files: ZipFileItem[]): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.data);
  }
  return await zip.generateAsync({ type: "blob" });
}
