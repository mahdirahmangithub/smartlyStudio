import { KeyboardShortcut } from "@sds/components/KeyboardShortcut";

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

export default function KeyboardShortcutPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Size comparison ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Sizes</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>sm</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <KeyboardShortcut keyText="⌘" />
              <KeyboardShortcut keyText="Shift" />
              <KeyboardShortcut keyText="K" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>lg</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <KeyboardShortcut keyText="⌘" size="lg" />
              <KeyboardShortcut keyText="Shift" size="lg" />
              <KeyboardShortcut keyText="K" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Combiner ──────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>With Combiner</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>sm — Copy</span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <KeyboardShortcut keyText="⌘" />
              <KeyboardShortcut keyText="+" combiner />
              <KeyboardShortcut keyText="C" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>sm — Screenshot</span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <KeyboardShortcut keyText="⌘" />
              <KeyboardShortcut keyText="+" combiner />
              <KeyboardShortcut keyText="Shift" />
              <KeyboardShortcut keyText="+" combiner />
              <KeyboardShortcut keyText="4" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>lg — Save</span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <KeyboardShortcut keyText="⌘" size="lg" />
              <KeyboardShortcut keyText="+" size="lg" combiner />
              <KeyboardShortcut keyText="S" size="lg" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>lg — Undo</span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <KeyboardShortcut keyText="Ctrl" size="lg" />
              <KeyboardShortcut keyText="+" size="lg" combiner />
              <KeyboardShortcut keyText="Z" size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Single keys ──────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Single Keys</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {["Esc", "Tab", "⇧", "⌃", "⌥", "⌘", "↑", "↓", "←", "→", "⏎", "⌫", "Space"].map((k) => (
            <KeyboardShortcut key={k} keyText={k} size="lg" />
          ))}
        </div>
      </section>
    </div>
  );
}
