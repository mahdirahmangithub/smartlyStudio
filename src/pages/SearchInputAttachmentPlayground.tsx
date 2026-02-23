import { useState } from "react";
import { SearchInputAttachment } from "../components/SearchInputAttachment";

const SAMPLE_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=80&h=80&fit=crop";

export default function SearchInputAttachmentPlayground() {
  const [mdSrc, setMdSrc] = useState<string | null>(null);
  const [lgSrc, setLgSrc] = useState<string | null>(null);

  const handleAttach = (
    file: File,
    setter: (src: string | null) => void
  ) => {
    const url = URL.createObjectURL(file);
    setter(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>SearchInputAttachment</h2>

      {/* ── Size: md ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: md</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, opacity: 0.6, width: 60 }}>Normal:</span>
            <SearchInputAttachment size="md" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, opacity: 0.6, width: 60 }}>Filled:</span>
            <SearchInputAttachment
              size="md"
              attachmentSrc={SAMPLE_IMAGE}
              onClear={() => {}}
            />
          </div>
        </div>
      </section>

      {/* ── Size: lg ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: lg</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, opacity: 0.6, width: 60 }}>Normal:</span>
            <SearchInputAttachment size="lg" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, opacity: 0.6, width: 60 }}>Filled:</span>
            <SearchInputAttachment
              size="lg"
              attachmentSrc={SAMPLE_IMAGE}
              onClear={() => {}}
            />
          </div>
        </div>
      </section>

      {/* ── Interactive: md ──────────────────────────────────────── */}
      <section>
        <h3>Interactive (md)</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          Click the icon to attach a file. Click the clear button to remove it.
        </p>
        <SearchInputAttachment
          size="md"
          attachmentSrc={mdSrc}
          onAttach={(file) => handleAttach(file, setMdSrc)}
          onClear={() => setMdSrc(null)}
        />
      </section>

      {/* ── Interactive: lg ──────────────────────────────────────── */}
      <section>
        <h3>Interactive (lg)</h3>
        <SearchInputAttachment
          size="lg"
          attachmentSrc={lgSrc}
          onAttach={(file) => handleAttach(file, setLgSrc)}
          onClear={() => setLgSrc(null)}
        />
      </section>
    </div>
  );
}
