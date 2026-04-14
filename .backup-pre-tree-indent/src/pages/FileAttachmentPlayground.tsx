import { FileAttachment } from "../components/FileAttachment";
import { Thumbnail } from "../components/Thumbnail";
import { FileTypeThumbnail } from "../components/FileTypeThumbnail";

export default function FileAttachmentPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>FileAttachment</h2>

      {/* ── Compact (thumbnail-only) ── */}
      <h3>Compact (thumbnail only)</h3>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <FileAttachment
            thumbnail={<Thumbnail size="lg" type="media" src="https://picsum.photos/200" />}
            title="Photo.jpg"
            onRemove={() => alert("Remove")}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>normal (hover for tooltip)</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <FileAttachment
            state="loading"
            thumbnail={<Thumbnail size="lg" type="media" src="https://picsum.photos/201" loading />}
            title="Uploading.png"
            onRemove={() => alert("Remove")}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>loading</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <FileAttachment
            state="error"
            thumbnail={<Thumbnail size="lg" type="icon" error />}
            title="Failed.pdf"
            onRemove={() => alert("Remove")}
            onRetry={() => alert("Retry")}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>error</span>
        </div>
      </div>

      {/* ── Expanded (with description) ── */}
      <h3>Expanded (with title & description)</h3>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FileAttachment
            thumbnail={<FileTypeThumbnail size="md" fileType="document" />}
            title="Document.pdf"
            description="2.4 MB"
            onRemove={() => alert("Remove")}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>normal</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FileAttachment
            state="loading"
            thumbnail={<FileTypeThumbnail size="md" fileType="image" loading />}
            title="Photo.jpg"
            description="Uploading..."
            onRemove={() => alert("Remove")}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>loading</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FileAttachment
            state="error"
            thumbnail={<Thumbnail size="md" type="icon" error />}
            title="Report.xlsx"
            description="Upload failed"
            onRemove={() => alert("Remove")}
            onRetry={() => alert("Retry")}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>error</span>
        </div>
      </div>

      {/* ── Truncation / tooltip ── */}
      <h3>Long file name (tooltip on truncate)</h3>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <FileAttachment
          thumbnail={<FileTypeThumbnail size="md" fileType="document" />}
          title="very-long-project-report-final-draft-v23-reviewed-by-team.pdf"
          description="A detailed quarterly performance analysis document"
          onRemove={() => {}}
        />
        <FileAttachment
          thumbnail={<Thumbnail size="lg" type="media" src="https://picsum.photos/202" />}
          title="screenshot-2026-02-22-at-14.32.05-meeting-notes.png"
          onRemove={() => {}}
        />
      </div>

      {/* ── File types ── */}
      <h3>Different file types</h3>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {(["document", "file", "video", "image", "font", "folder"] as const).map((ft) => (
          <FileAttachment
            key={ft}
            thumbnail={<FileTypeThumbnail size="md" fileType={ft} />}
            title={`${ft}.ext`}
            description="1.2 MB"
            onRemove={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
