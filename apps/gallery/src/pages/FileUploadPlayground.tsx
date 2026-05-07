import { useState, useCallback, type CSSProperties } from "react";
import { FileUpload, type FileUploadItem, type DroppedEntry } from "@sds/components/FileUpload";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  maxWidth: 560,
};

/** Remove an item by ID at a given path depth in the tree. */
function removeFromTree(
  items: FileUploadItem[],
  id: string,
  path: string[]
): FileUploadItem[] {
  if (path.length === 0) {
    return items.filter((i) => i.id !== id);
  }
  return items.map((item) => {
    if (item.id === path[0] && item.children) {
      return {
        ...item,
        children: removeFromTree(item.children, id, path.slice(1)),
      };
    }
    return item;
  });
}

let idCounter = 0;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function entriesToItems(entries: DroppedEntry[]): FileUploadItem[] {
  return entries.map((entry) => {
    if (entry.type === "file") {
      return {
        id: `file-${++idCounter}`,
        name: entry.name,
        type: "file" as const,
        status: "normal" as const,
        fileSize: formatSize(entry.file.size),
      };
    }
    return {
      id: `folder-${++idCounter}`,
      name: entry.name,
      type: "folder" as const,
      children: entriesToItems(entry.children),
    };
  });
}

/* ── Interactive demo — attach real files ───────────────────────────── */

function InteractiveDemo() {
  const [items, setItems] = useState<FileUploadItem[]>([]);

  const handleFiles = useCallback((files: File[]) => {
    const newItems: FileUploadItem[] = files.map((f) => ({
      id: `file-${++idCounter}`,
      name: f.name,
      type: "file" as const,
      status: "normal" as const,
      fileSize: formatSize(f.size),
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleDropEntries = useCallback((entries: DroppedEntry[]) => {
    setItems((prev) => [...prev, ...entriesToItems(entries)]);
  }, []);

  return (
    <FileUpload
      items={items}
      onFiles={handleFiles}
      onDropEntries={handleDropEntries}
      onItemRemove={(id, path) =>
        setItems((prev) => removeFromTree(prev, id, path))
      }
      onItemRetry={(id) => alert(`Retry: ${id}`)}
      onDeleteAll={() => setItems([])}
      onUndoDeleteAll={(snapshot) => setItems(snapshot)}
    />
  );
}

/* ── Interactive demo — attach folders ──────────────────────────────── */

function InteractiveFolderDemo() {
  const [items, setItems] = useState<FileUploadItem[]>([]);

  const handleFiles = useCallback((files: File[]) => {
    const folderMap = new Map<string, FileUploadItem>();
    const rootItems: FileUploadItem[] = [];

    for (const f of files) {
      const parts = f.webkitRelativePath?.split("/") ?? [f.name];
      if (parts.length > 1) {
        const folderName = parts[0];
        if (!folderMap.has(folderName)) {
          folderMap.set(folderName, {
            id: `folder-${++idCounter}`,
            name: folderName,
            type: "folder",
            children: [],
          });
        }
        folderMap.get(folderName)!.children!.push({
          id: `file-${++idCounter}`,
          name: f.name,
          type: "file",
          status: "normal",
          fileSize: formatSize(f.size),
        });
      } else {
        rootItems.push({
          id: `file-${++idCounter}`,
          name: f.name,
          type: "file",
          status: "normal",
          fileSize: formatSize(f.size),
        });
      }
    }

    setItems((prev) => [...prev, ...Array.from(folderMap.values()), ...rootItems]);
  }, []);

  const handleDropEntries = useCallback((entries: DroppedEntry[]) => {
    setItems((prev) => [...prev, ...entriesToItems(entries)]);
  }, []);

  return (
    <FileUpload
      directory
      items={items}
      onFiles={handleFiles}
      onDropEntries={handleDropEntries}
      onItemRemove={(id, path) =>
        setItems((prev) => removeFromTree(prev, id, path))
      }
      onItemRetry={(id) => alert(`Retry: ${id}`)}
      onDeleteAll={() => setItems([])}
      onUndoDeleteAll={(snapshot) => setItems(snapshot)}
    />
  );
}

/* ── Pre-filled demo with mixed states ─────────────────────────────── */

function buildPrefilledItems(): FileUploadItem[] {
  return [
    {
      id: "folder-brand",
      name: "Brand Assets",
      type: "folder",
      children: [
        {
          id: "folder-icons",
          name: "Icons and Illustrations for Marketing Materials",
          type: "folder",
          children: [
            { id: "f-arrow", name: "arrow.svg", type: "file", status: "normal", fileSize: "2 KB" },
            { id: "f-check", name: "check.svg", type: "file", status: "normal", fileSize: "1 KB" },
            { id: "f-close", name: "close.svg", type: "file", status: "normal", fileSize: "1 KB" },
            { id: "f-star", name: "star.svg", type: "file", status: "loading", progress: 45 },
          ],
        },
        {
          id: "folder-logos",
          name: "Logos",
          type: "folder",
          children: [
            { id: "f-logo-dark", name: "logo-dark.png", type: "file", status: "normal", fileSize: "120 KB" },
            { id: "f-logo-light", name: "logo-light.png", type: "file", status: "error", errorText: "Upload timed out" },
          ],
        },
        { id: "f-guidelines", name: "brand-guidelines.pdf", type: "file", status: "normal", fileSize: "3.2 MB" },
      ],
    },
    { id: "f-report", name: "quarterly-report.pdf", type: "file", status: "loading", progress: 72 },
    { id: "f-photo", name: "team-photo.jpg", type: "file", status: "normal", fileSize: "2.4 MB" },
    { id: "f-spreadsheet", name: "budget-2026.xlsx", type: "file", status: "normal", fileSize: "890 KB" },
    { id: "f-archive", name: "backup.zip", type: "file", status: "error", errorText: "File size exceeds the 100 MB limit" },
    { id: "f-video", name: "product-demo.mp4", type: "file", status: "loading", progress: 15 },
    { id: "f-slides", name: "pitch-deck.pptx", type: "file", status: "normal", fileSize: "5.1 MB" },
    { id: "f-cover", name: "cover-image.png", type: "file", status: "normal", fileSize: "4.5 MB" },
  ];
}

function PrefilledDemo() {
  const [items, setItems] = useState<FileUploadItem[]>(buildPrefilledItems);

  return (
    <FileUpload
      items={items}
      onItemRemove={(id, path) =>
        setItems((prev) => removeFromTree(prev, id, path))
      }
      onItemRetry={(id) => alert(`Retry: ${id}`)}
      onDeleteAll={() => setItems([])}
      onUndoDeleteAll={(snapshot) => setItems(snapshot)}
    />
  );
}

/* ── Error state demo ──────────────────────────────────────────────── */

function ErrorDemo() {
  const [items, setItems] = useState<FileUploadItem[]>([
    {
      id: "folder-campaign",
      name: "Campaign Materials",
      type: "folder",
      children: [
        { id: "e-banner", name: "banner.jpg", type: "file", status: "error", errorText: "Upload failed" },
        { id: "e-flyer", name: "flyer.pdf", type: "file", status: "error", errorText: "Network error" },
        { id: "e-ad", name: "ad-copy.docx", type: "file", status: "normal", fileSize: "45 KB" },
      ],
    },
    { id: "e-video", name: "promo-video.mp4", type: "file", status: "error", errorText: "File too large" },
    { id: "e-img", name: "hero-image.png", type: "file", status: "error", errorText: "Unsupported format" },
  ]);

  return (
    <FileUpload
      errorText="Some files failed to upload"
      items={items}
      onItemRemove={(id, path) =>
        setItems((prev) => removeFromTree(prev, id, path))
      }
      onItemRetry={(id) => alert(`Retry: ${id}`)}
      onDeleteAll={() => setItems([])}
      onUndoDeleteAll={(snapshot) => setItems(snapshot)}
    />
  );
}

/* ── Disabled demo ─────────────────────────────────────────────────── */

function DisabledDemo() {
  return <FileUpload disabled />;
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function FileUploadPlayground() {
  return (
    <>
      <h1>FileUpload</h1>

      <section style={sectionStyle}>
        <h2>Interactive</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Attach real files via button. Drag-and-drop supports both files and
          folders with full hierarchy preserved.
        </p>
        <div style={cardStyle}>
          <InteractiveDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Interactive (folders)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Button opens folder picker. Drag-and-drop supports both files and
          folders with nested structure preserved.
        </p>
        <div style={cardStyle}>
          <InteractiveFolderDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Pre-filled (mixed states)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Folder with nested subfolders, files in loading/normal/error states.
          Click folders to navigate, use breadcrumb to go back.
        </p>
        <div style={cardStyle}>
          <PrefilledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Error state</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Dropzone shows error message. Folder and files with failures.
        </p>
        <div style={cardStyle}>
          <ErrorDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Dropzone is disabled, no list shown.
        </p>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>
    </>
  );
}
