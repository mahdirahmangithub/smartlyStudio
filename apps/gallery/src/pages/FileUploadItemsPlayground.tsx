import { type CSSProperties } from "react";
import { FileUploadFileItem } from "@sds/components/FileUploadFileItem";
import { FileUploadFolderItem } from "@sds/components/FileUploadFolderItem";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const listStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  maxWidth: 420,
};

function FileItemStatesDemo() {
  return (
    <div style={listStyle}>
      <FileUploadFileItem
        fileName="quarterly-report.pdf"
        status="loading"
        progress={50}
        fileType="document"
        onRemove={() => alert("Cancel upload")}
      />
      <FileUploadFileItem
        fileName="photo-album-vacation-summer-2025.jpg"
        status="normal"
        fileSize="2.4 MB"
        fileType="image"
        onRemove={() => alert("Remove file")}
      />
      <FileUploadFileItem
        fileName="presentation-final-draft.pptx"
        status="error"
        errorText="File size exceeds the 10 MB limit"
        fileType="document"
        onRemove={() => alert("Remove file")}
        onRetry={() => alert("Retry upload")}
      />
    </div>
  );
}

function FileItemLoadingProgressDemo() {
  return (
    <div style={listStyle}>
      <FileUploadFileItem
        fileName="video-intro.mp4"
        status="loading"
        fileType="video"
        onRemove={() => {}}
      />
      <FileUploadFileItem
        fileName="design-assets.zip"
        status="loading"
        progress={12}
        fileType="file"
        onRemove={() => {}}
      />
      <FileUploadFileItem
        fileName="brand-guidelines.pdf"
        status="loading"
        progress={87}
        fileType="document"
        onRemove={() => {}}
      />
    </div>
  );
}

function FileItemTruncationDemo() {
  return (
    <div style={{ ...listStyle, maxWidth: 340 }}>
      <FileUploadFileItem
        fileName="extremely-long-file-name-that-should-definitely-be-truncated-in-the-ui-component.pdf"
        status="normal"
        fileSize="1.1 MB"
        fileType="document"
        onRemove={() => {}}
      />
      <FileUploadFileItem
        fileName="short.png"
        status="normal"
        fileSize="240 KB"
        fileType="image"
        onRemove={() => {}}
      />
    </div>
  );
}

function FileItemFileTypesDemo() {
  const types = [
    { type: "document" as const, name: "report.pdf", size: "2.4 MB" },
    { type: "image" as const, name: "photo.jpg", size: "1.8 MB" },
    { type: "video" as const, name: "intro.mp4", size: "45 MB" },
    { type: "file" as const, name: "archive.zip", size: "12 MB" },
    { type: "font" as const, name: "custom-font.woff2", size: "320 KB" },
  ];
  return (
    <div style={listStyle}>
      {types.map((t) => (
        <FileUploadFileItem
          key={t.type}
          fileName={t.name}
          fileType={t.type}
          status="normal"
          fileSize={t.size}
          onRemove={() => {}}
        />
      ))}
    </div>
  );
}

function FileItemAutoDetectDemo() {
  const files = [
    { name: "annual-report.pdf", size: "3.1 MB" },
    { name: "vacation-photo.jpg", size: "1.8 MB" },
    { name: "product-demo.mp4", size: "52 MB" },
    { name: "brand-typeface.woff2", size: "320 KB" },
    { name: "backup.tar.gz", size: "800 MB" },
    { name: "notes.md", size: "4 KB" },
  ];
  return (
    <div style={listStyle}>
      {files.map((f) => (
        <FileUploadFileItem
          key={f.name}
          fileName={f.name}
          status="normal"
          fileSize={f.size}
          onRemove={() => {}}
        />
      ))}
    </div>
  );
}

function FolderItemStatesDemo() {
  return (
    <div style={listStyle}>
      <FileUploadFolderItem
        folderName="Brand Assets"
        status="loading"
        uploadedFiles={2}
        totalFiles={8}
        onRemove={() => alert("Cancel upload")}
      />
      <FileUploadFolderItem
        folderName="Design System Icons"
        status="normal"
        fileCount={10}
        onRemove={() => alert("Remove folder")}
        onClick={() => alert("Navigate into folder")}
      />
      <FileUploadFolderItem
        folderName="Campaign Materials"
        status="error"
        fileCount={10}
        errorText="2 files failed to upload"
        onRemove={() => alert("Remove folder")}
        onRetry={() => alert("Retry upload")}
      />
    </div>
  );
}

function FolderItemNavigableDemo() {
  return (
    <div style={listStyle}>
      <FileUploadFolderItem
        folderName="Documents"
        status="normal"
        fileCount={24}
        onRemove={() => {}}
        onClick={() => alert("Open Documents folder")}
      />
      <FileUploadFolderItem
        folderName="Images"
        status="normal"
        fileCount={156}
        onRemove={() => {}}
        onClick={() => alert("Open Images folder")}
      />
      <FileUploadFolderItem
        folderName="Very long folder name that should be truncated when it overflows"
        status="normal"
        fileCount={3}
        onRemove={() => {}}
        onClick={() => alert("Open folder")}
      />
    </div>
  );
}

function MixedListDemo() {
  return (
    <div style={listStyle}>
      <FileUploadFolderItem
        folderName="Project Assets"
        status="normal"
        fileCount={12}
        onRemove={() => {}}
        onClick={() => {}}
      />
      <FileUploadFileItem
        fileName="readme.md"
        status="normal"
        fileSize="4 KB"
        fileType="document"
        onRemove={() => {}}
      />
      <FileUploadFileItem
        fileName="logo.svg"
        status="loading"
        progress={73}
        fileType="image"
        onRemove={() => {}}
      />
      <FileUploadFolderItem
        folderName="Backup"
        status="loading"
        uploadedFiles={5}
        totalFiles={20}
        onRemove={() => {}}
      />
      <FileUploadFileItem
        fileName="data-export.csv"
        status="error"
        errorText="Network error"
        fileType="file"
        onRemove={() => {}}
        onRetry={() => {}}
      />
    </div>
  );
}

export default function FileUploadItemsPlayground() {
  return (
    <>
      <h1>FileUpload Items</h1>

      <section style={sectionStyle}>
        <h2>FileUploadFileItem — States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Loading (with progress), normal (uploaded), and error. Hover to see
          action buttons.
        </p>
        <div style={cardStyle}>
          <FileItemStatesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>FileUploadFileItem — Loading Progress</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Without progress, with low progress, and near completion.
        </p>
        <div style={cardStyle}>
          <FileItemLoadingProgressDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>FileUploadFileItem — Truncation</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Long file names are truncated with tooltip on hover.
        </p>
        <div style={cardStyle}>
          <FileItemTruncationDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>FileUploadFileItem — File Types (explicit)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Different file type thumbnails with explicit fileType prop.
        </p>
        <div style={cardStyle}>
          <FileItemFileTypesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>FileUploadFileItem — Auto-detected Types</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          No fileType prop — type is inferred from the file extension.
        </p>
        <div style={cardStyle}>
          <FileItemAutoDetectDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>FileUploadFolderItem — States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Loading (count-based progress), normal, and error with file count.
          Hover to see actions.
        </p>
        <div style={cardStyle}>
          <FolderItemStatesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>FileUploadFolderItem — Navigable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Clickable folders with pointer cursor. Long name truncation with
          tooltip.
        </p>
        <div style={cardStyle}>
          <FolderItemNavigableDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Mixed List</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Files and folders together in a single list, various states.
        </p>
        <div style={cardStyle}>
          <MixedListDemo />
        </div>
      </section>
    </>
  );
}
