/* ── Dropped entry types (from drag-and-drop) ──────────────────────── */

export interface DroppedFile {
  type: "file";
  name: string;
  file: File;
}

export interface DroppedFolder {
  type: "folder";
  name: string;
  children: DroppedEntry[];
}

export type DroppedEntry = DroppedFile | DroppedFolder;

function readFileEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

function readDirectoryEntries(
  reader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

async function walkEntry(entry: FileSystemEntry): Promise<DroppedEntry> {
  if (entry.isFile) {
    const file = await readFileEntry(entry as FileSystemFileEntry);
    return { type: "file", name: entry.name, file };
  }

  const dirEntry = entry as FileSystemDirectoryEntry;
  const reader = dirEntry.createReader();
  const children: DroppedEntry[] = [];
  let batch: FileSystemEntry[];

  // readEntries may return results in batches
  do {
    batch = await readDirectoryEntries(reader);
    for (const child of batch) {
      children.push(await walkEntry(child));
    }
  } while (batch.length > 0);

  return { type: "folder", name: entry.name, children };
}

/** Read DataTransfer items into a structured array preserving folder hierarchy. */
export async function readDroppedEntries(
  dataTransfer: DataTransfer
): Promise<DroppedEntry[]> {
  // Collect entries synchronously — DataTransfer is cleared after the event handler returns
  const rawEntries: FileSystemEntry[] = [];
  for (let i = 0; i < dataTransfer.items.length; i++) {
    const entry = dataTransfer.items[i].webkitGetAsEntry?.();
    if (entry) rawEntries.push(entry);
  }

  return Promise.all(rawEntries.map(walkEntry));
}

/**
 * Reconstruct a DroppedEntry tree from a flat FileList (e.g. from an
 * input with webkitdirectory). Uses File.webkitRelativePath to rebuild
 * the folder hierarchy.
 */
export function buildEntriesFromFileList(files: File[]): DroppedEntry[] {
  const root: DroppedEntry[] = [];

  for (const file of files) {
    const relPath = (file as any).webkitRelativePath as string | undefined;
    const parts = relPath ? relPath.split("/") : [file.name];
    let level = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        level.push({ type: "file", name, file });
      } else {
        let folder = level.find(
          (e): e is DroppedFolder => e.type === "folder" && e.name === name
        );
        if (!folder) {
          folder = { type: "folder", name, children: [] };
          level.push(folder);
        }
        level = folder.children;
      }
    }
  }

  return root;
}

/* ── File upload item model ─────────────────────────────────────────── */

export interface FileUploadItem {
  id: string;
  name: string;
  type: "file" | "folder";
  status?: "loading" | "normal" | "error";
  /** Upload progress 0–100 (file only) */
  progress?: number;
  /** Formatted file size e.g. "10 MB" (file only) */
  fileSize?: string;
  errorText?: string;
  /** Nested children (folder only) */
  children?: FileUploadItem[];
}

/** Walk the tree along `path` (array of folder IDs) and return the items at that level. */
export function getItemsAtPath(
  items: FileUploadItem[],
  path: string[]
): FileUploadItem[] | null {
  let current = items;
  for (const id of path) {
    const folder = current.find((i) => i.id === id && i.type === "folder");
    if (!folder?.children) return null;
    current = folder.children;
  }
  return current;
}

/** Build breadcrumb segments from the navigation path. */
export function getPathSegments(
  items: FileUploadItem[],
  path: string[]
): { id: string; name: string }[] {
  const segments: { id: string; name: string }[] = [];
  let current = items;
  for (const id of path) {
    const folder = current.find((i) => i.id === id);
    if (!folder) break;
    segments.push({ id: folder.id, name: folder.name });
    current = folder.children ?? [];
  }
  return segments;
}

/** Count files and folders at a single level (non-recursive). */
export function countAtLevel(items: FileUploadItem[]): {
  folders: number;
  files: number;
} {
  let folders = 0;
  let files = 0;
  for (const item of items) {
    if (item.type === "folder") folders++;
    else files++;
  }
  return { folders, files };
}

/** Format summary string, e.g. "1 folder • 15 files", "0 file". */
export function formatSummary(items: FileUploadItem[]): string {
  const { folders, files } = countAtLevel(items);
  const parts: string[] = [];
  if (folders > 0) parts.push(`${folders} folder${folders !== 1 ? "s" : ""}`);
  if (files > 0 || parts.length === 0)
    parts.push(`${files} file${files !== 1 ? "s" : ""}`);
  return parts.join(" • ");
}

/** Recursively count all files inside an item (file = 1, folder = sum of children). */
export function countFilesRecursive(item: FileUploadItem): number {
  if (item.type === "file") return 1;
  if (!item.children) return 0;
  return item.children.reduce((s, c) => s + countFilesRecursive(c), 0);
}

/** Derive folder upload status from its descendants. */
export function deriveFolderStatus(
  folder: FileUploadItem
): "loading" | "normal" | "error" {
  if (!folder.children?.length) return folder.status ?? "normal";

  const hasError = folder.children.some((c) =>
    c.type === "file"
      ? c.status === "error"
      : deriveFolderStatus(c) === "error"
  );
  if (hasError) return "error";

  const hasLoading = folder.children.some((c) =>
    c.type === "file"
      ? c.status === "loading"
      : deriveFolderStatus(c) === "loading"
  );
  if (hasLoading) return "loading";

  return "normal";
}

/** Derive uploaded/total counts from folder descendants. */
export function deriveFolderProgress(folder: FileUploadItem): {
  uploaded: number;
  total: number;
} {
  if (!folder.children) return { uploaded: 0, total: 0 };
  let uploaded = 0;
  let total = 0;
  for (const child of folder.children) {
    if (child.type === "file") {
      total++;
      if (child.status === "normal") uploaded++;
    } else {
      const sub = deriveFolderProgress(child);
      uploaded += sub.uploaded;
      total += sub.total;
    }
  }
  return { uploaded, total };
}

/** Build an error message from descendant failures. */
export function deriveFolderErrorText(
  folder: FileUploadItem
): string | undefined {
  if (!folder.children) return undefined;
  let errorCount = 0;
  for (const child of folder.children) {
    if (child.type === "file" && child.status === "error") {
      errorCount++;
    } else if (child.type === "folder" && deriveFolderStatus(child) === "error") {
      errorCount++;
    }
  }
  if (errorCount === 0) return undefined;
  return `${errorCount} file${errorCount !== 1 ? "s" : ""} failed to upload`;
}
