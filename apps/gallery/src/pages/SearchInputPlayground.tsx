import { useState } from "react";
import { SearchInput, type SearchInputSize } from "@sds/components/SearchInput";
import { Icon } from "@sds/components/Icon";

const SIZES: SearchInputSize[] = ["md", "lg", "xl"];

export default function SearchInputPlayground() {
  const [cfgVal, setCfgVal] = useState("");
  const [cfgSize, setCfgSize] = useState<SearchInputSize>("md");
  const [cfgPrefix, setCfgPrefix] = useState(true);
  const [cfgContext, setCfgContext] = useState(true);
  const [cfgContextText, setCfgContextText] = useState("Files");
  const [cfgAttachment, setCfgAttachment] = useState(true);
  const [cfgAttachSrc, setCfgAttachSrc] = useState<string | null>(null);
  const [cfgClearable, setCfgClearable] = useState(true);
  const [cfgDisabled, setCfgDisabled] = useState(false);

  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [attachSrc, setAttachSrc] = useState<string | null>(null);

  const checkboxStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 13 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>SearchInput</h2>

      {/* ── Configurable example ──────────────────────────────────── */}
      <section>
        <h3>Configurable</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5 }}>Size</span>
            <div style={{ display: "flex", gap: 4 }}>
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setCfgSize(s)}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: cfgSize === s ? "#222" : "#fff",
                    color: cfgSize === s ? "#fff" : "#222",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <label style={checkboxStyle}>
            <input type="checkbox" checked={cfgPrefix} onChange={(e) => setCfgPrefix(e.target.checked)} />
            prefix
          </label>
          <label style={checkboxStyle}>
            <input type="checkbox" checked={cfgContext} onChange={(e) => setCfgContext(e.target.checked)} />
            context
          </label>
          <label style={checkboxStyle}>
            <input type="checkbox" checked={cfgAttachment} onChange={(e) => setCfgAttachment(e.target.checked)} />
            attachment
          </label>
          <label style={checkboxStyle}>
            <input type="checkbox" checked={cfgClearable} onChange={(e) => setCfgClearable(e.target.checked)} />
            clearable
          </label>
          <label style={checkboxStyle}>
            <input type="checkbox" checked={cfgDisabled} onChange={(e) => setCfgDisabled(e.target.checked)} />
            disabled
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5 }}>Context text</span>
            <input
              type="text"
              value={cfgContextText}
              onChange={(e) => setCfgContextText(e.target.value)}
              style={{ padding: "2px 6px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, width: 80 }}
            />
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          <SearchInput
            size={cfgSize}
            prefix={cfgPrefix}
            context={cfgContext}
            contextText={cfgContextText}
            contextIcon={<Icon name="smartly" size={cfgSize === "xl" ? 20 : 16} />}
            attachment={cfgAttachment}
            attachmentSrc={cfgAttachSrc}
            onAttach={(file) => setCfgAttachSrc(URL.createObjectURL(file))}
            onAttachClear={() => setCfgAttachSrc(null)}
            clearable={cfgClearable}
            disabled={cfgDisabled}
            value={cfgVal}
            onChange={(e) => setCfgVal(e.target.value)}
            onClear={() => setCfgVal("")}
          />
        </div>
      </section>

      {/* ── Size: md ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: md</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <SearchInput
            size="md"
            value={val1}
            onChange={(e) => setVal1(e.target.value)}
            onClear={() => setVal1("")}
          />
          <SearchInput size="md" defaultValue="Filled value" />
          <SearchInput size="md" disabled placeholder="Disabled" />
          <SearchInput size="md" disabled defaultValue="Disabled filled" />
        </div>
      </section>

      {/* ── Size: lg ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: lg</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <SearchInput
            size="lg"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            onClear={() => setVal2("")}
          />
          <SearchInput size="lg" defaultValue="Filled value" />
          <SearchInput size="lg" disabled placeholder="Disabled" />
        </div>
      </section>

      {/* ── Size: xl ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: xl</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <SearchInput
            size="xl"
            value={val3}
            onChange={(e) => setVal3(e.target.value)}
            onClear={() => setVal3("")}
          />
          <SearchInput size="xl" defaultValue="Filled value" />
          <SearchInput size="xl" disabled placeholder="Disabled" />
        </div>
      </section>

      {/* ── With prefix (context) ────────────────────────────────── */}
      <section>
        <h3>With context</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <SearchInput
            size="md"
            prefix
            context
            contextText="Files"
            contextIcon={<Icon name="smartly" size={16} />}
          />
          <SearchInput
            size="lg"
            prefix
            context
            contextText="Projects"
            contextIcon={<Icon name="folder" size={16} />}
          />
        </div>
      </section>

      {/* ── With context + attachment ────────────────────────────── */}
      <section>
        <h3>With context + attachment</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <SearchInput
            size="md"
            prefix
            context
            contextText="Files"
            contextIcon={<Icon name="smartly" size={16} />}
            attachment
            attachmentSrc={attachSrc}
            onAttach={(file) => setAttachSrc(URL.createObjectURL(file))}
            onAttachClear={() => setAttachSrc(null)}
          />
          <SearchInput
            size="lg"
            prefix
            context
            contextText="Files"
            contextIcon={<Icon name="smartly" size={16} />}
            attachment
          />
        </div>
      </section>

      {/* ── Attachment only (no context) ─────────────────────────── */}
      <section>
        <h3>Attachment only (no context)</h3>
        <div style={{ maxWidth: 420 }}>
          <SearchInput
            size="md"
            prefix
            attachment
          />
        </div>
      </section>
    </div>
  );
}
