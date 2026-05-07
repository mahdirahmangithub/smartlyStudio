import { useState } from "react";
import { InlineInput } from "@sds/components/InlineInput";

export default function InlineInputPlayground() {
  const [controlled, setControlled] = useState("Editable value");
  const [autoVal, setAutoVal] = useState("Auto");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>InlineInput</h2>

      {/* ── Size: sm ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: sm (default)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 240 }}>
          <InlineInput placeholder="Empty placeholder" />
          <InlineInput defaultValue="Pre-filled value" />
          <InlineInput placeholder="Disabled empty" disabled />
          <InlineInput defaultValue="Disabled filled" disabled />
        </div>
      </section>

      {/* ── Size: lg ─────────────────────────────────────────────── */}
      <section>
        <h3>Size: lg</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 240 }}>
          <InlineInput size="lg" placeholder="Empty placeholder" />
          <InlineInput size="lg" defaultValue="Pre-filled value" />
          <InlineInput size="lg" placeholder="Disabled empty" disabled />
          <InlineInput size="lg" defaultValue="Disabled filled" disabled />
        </div>
      </section>

      {/* ── Controlled ───────────────────────────────────────────── */}
      <section>
        <h3>Controlled</h3>
        <div style={{ maxWidth: 240 }}>
          <InlineInput
            value={controlled}
            onChange={(e) => setControlled(e.target.value)}
            placeholder="Type something…"
          />
        </div>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
          Value: "{controlled}"
        </p>
      </section>

      {/* ── Focus indicator off (table-cell usage) ───────────────── */}
      <section>
        <h3>focusIndicator=false (table cell usage)</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          No purple focus ring — the parent container would indicate focus instead.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            maxWidth: 400,
          }}
        >
          <div style={{ padding: "4px 8px", borderRight: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0" }}>
            <InlineInput
              focusIndicator={false}
              defaultValue="Cell A1"
            />
          </div>
          <div style={{ padding: "4px 8px", borderBottom: "1px solid #e0e0e0" }}>
            <InlineInput
              focusIndicator={false}
              defaultValue="Cell B1"
            />
          </div>
          <div style={{ padding: "4px 8px", borderRight: "1px solid #e0e0e0" }}>
            <InlineInput
              focusIndicator={false}
              placeholder="Empty cell"
            />
          </div>
          <div style={{ padding: "4px 8px" }}>
            <InlineInput
              focusIndicator={false}
              defaultValue="Cell B2"
            />
          </div>
        </div>
      </section>

      {/* ── Hover indicator off ──────────────────────────────────── */}
      <section>
        <h3>hoverIndicator=false</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          No edit pencil icon on hover.
        </p>
        <div style={{ maxWidth: 240 }}>
          <InlineInput
            hoverIndicator={false}
            defaultValue="No edit icon on hover"
          />
        </div>
      </section>

      {/* ── Both indicators off ──────────────────────────────────── */}
      <section>
        <h3>Both indicators off</h3>
        <div style={{ maxWidth: 240 }}>
          <InlineInput
            focusIndicator={false}
            hoverIndicator={false}
            defaultValue="Minimal inline input"
          />
        </div>
      </section>

      {/* ── autoWidth ────────────────────────────────────────────── */}
      <section>
        <h3>autoWidth</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          Width shrinks to fit the value plus room for the edit indicator.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>sm:</span>
            <InlineInput
              autoWidth
              value={autoVal}
              onChange={(e) => setAutoVal(e.target.value)}
              placeholder="Type…"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>lg:</span>
            <InlineInput
              autoWidth
              size="lg"
              defaultValue="Resize me"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>empty:</span>
            <InlineInput autoWidth placeholder="Placeholder" />
          </div>
        </div>
      </section>
    </div>
  );
}
