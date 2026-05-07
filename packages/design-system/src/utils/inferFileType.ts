import type { FileType } from "../components/FileTypeThumbnail";

/* Extension tables — keep in sync with upload UX (formerly FileUploadFileItem). */

const IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
  "bmp",
  "ico",
  "tiff",
  "avif",
  "heic",
]);
const VIDEO_EXT = new Set([
  "mp4",
  "mov",
  "avi",
  "webm",
  "mkv",
  "flv",
  "wmv",
  "m4v",
]);
const FONT_EXT = new Set(["woff", "woff2", "ttf", "otf", "eot"]);
const DOC_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "odt",
  "ods",
  "odp",
  "pages",
  "numbers",
  "key",
  "md",
]);

/**
 * Infer SDS `FileType` from a file name (extension only).
 * Same rules as `FileUploadFileItem` when `fileType` is not overridden.
 */
export function inferFileTypeFromFileName(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (FONT_EXT.has(ext)) return "font";
  if (DOC_EXT.has(ext)) return "document";
  return "file";
}

/**
 * Prefer MIME when reliable; otherwise same as {@link inferFileTypeFromFileName}.
 */
export function inferFileTypeFromFile(file: File): FileType {
  const t = file.type.trim().toLowerCase();
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("font/")) return "font";
  if (t === "application/pdf") return "document";
  return inferFileTypeFromFileName(file.name);
}

export function isImageFile(file: File): boolean {
  return inferFileTypeFromFile(file) === "image";
}

export function isVideoFile(file: File): boolean {
  return inferFileTypeFromFile(file) === "video";
}
