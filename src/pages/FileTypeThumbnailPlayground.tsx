import { useState } from "react";
import {
  FileTypeThumbnail,
  type FileTypeThumbnailSize,
  type FileType,
} from "../components/FileTypeThumbnail";

const SIZES: FileTypeThumbnailSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const FILE_TYPES: FileType[] = [
  "document",
  "file",
  "video",
  "image",
  "font",
  "folder",
];

export default function FileTypeThumbnailPlayground() {
  const [size, setSize] = useState<FileTypeThumbnailSize>("md");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <h2>FileTypeThumbnail</h2>

      {/* size selector */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span>Size:</span>
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            style={{
              fontWeight: s === size ? 700 : 400,
              textDecoration: s === size ? "underline" : "none",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* all file types at selected size */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {FILE_TYPES.map((ft) => (
          <div
            key={ft}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FileTypeThumbnail size={size} fileType={ft} />
            <span style={{ fontSize: 12, opacity: 0.6 }}>{ft}</span>
          </div>
        ))}
      </div>

      {/* size comparison for one type */}
      <h3>Size Comparison (document)</h3>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        {SIZES.map((s) => (
          <div
            key={s}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FileTypeThumbnail size={s} fileType="document" />
            <span style={{ fontSize: 12, opacity: 0.6 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
