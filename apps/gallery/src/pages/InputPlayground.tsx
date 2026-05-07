import { useState } from "react";
import { Input, type InputSize } from "@sds/components/Input";
import { PasswordInput } from "@sds/components/PasswordInput";
import { Icon } from "@sds/components/Icon";

const SIZES: InputSize[] = ["md", "lg", "xl"];

const ICON_SIZE: Record<InputSize, number> = {
  md: 16,
  lg: 16,
  xl: 20,
};

export default function InputPlayground() {
  const [size, setSize] = useState<InputSize>("md");
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [clearable, setClearable] = useState(true);
  const [showLeading, setShowLeading] = useState(true);
  const [showTrailing, setShowTrailing] = useState(true);
  const [showSuffix, setShowSuffix] = useState(true);
  const [controlledValue, setControlledValue] = useState("");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Input</h2>

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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as InputSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
              <span style={captionStyle}>Error</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={clearable} onChange={(e) => setClearable(e.target.checked)} />
              <span style={captionStyle}>Clearable</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showLeading} onChange={(e) => setShowLeading(e.target.checked)} />
              <span style={captionStyle}>Leading Icon</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showTrailing} onChange={(e) => setShowTrailing(e.target.checked)} />
              <span style={captionStyle}>Trailing Icon</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showSuffix} onChange={(e) => setShowSuffix(e.target.checked)} />
              <span style={captionStyle}>Suffix</span>
            </label>
          </div>

          <div style={{ maxWidth: 420 }}>
            <Input
              size={size}
              error={error}
              disabled={disabled}
              clearable={clearable}
              placeholder="placeholder"
              value={controlledValue}
              onChange={(e) => setControlledValue(e.target.value)}
              onClear={() => setControlledValue("")}
              leadingIcon={showLeading ? <Icon name="favorite" size={ICON_SIZE[size]} /> : undefined}
              trailingIcon={showTrailing ? <Icon name="favorite" size={ICON_SIZE[size]} /> : undefined}
              suffix={showSuffix ? "suffix-text" : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── Size comparison ────────────────────────────────────────── */}
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
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{s}</span>
              <div style={{ maxWidth: 420 }}>
                <Input
                  size={s}
                  placeholder="placeholder"
                  leadingIcon={<Icon name="favorite" size={ICON_SIZE[s]} />}
                  trailingIcon={<Icon name="favorite" size={ICON_SIZE[s]} />}
                  suffix="suffix-text"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── States grid ────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>States</h2>

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
            <span style={captionStyle}>Empty</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Filled + Clearable</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                defaultValue="Typed text"
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
                clearable
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Error</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                error
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Error + Filled</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                defaultValue="Typed text"
                error
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
                clearable
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Disabled (Empty)</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                disabled
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Disabled (Filled)</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                defaultValue="Typed text"
                disabled
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Disabled + Error (Filled)</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                defaultValue="Typed text"
                disabled
                error
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Read-only (Filled)</span>
            <div style={{ maxWidth: 420 }}>
              <Input
                placeholder="placeholder"
                defaultValue="Read-only value"
                readOnly
                leadingIcon={<Icon name="favorite" size={16} />}
                trailingIcon={<Icon name="favorite" size={16} />}
                suffix="suffix-text"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>No icons, no suffix</span>
            <div style={{ maxWidth: 420 }}>
              <Input placeholder="Just a plain input" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Password ────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Password</h2>

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
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{s}</span>
              <div style={{ maxWidth: 420 }}>
                <PasswordInput
                  size={s}
                  placeholder="Enter password"
                  leadingIcon={<Icon name="lock" size={ICON_SIZE[s]} />}
                  clearable
                />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Password (Disabled)</span>
            <div style={{ maxWidth: 420 }}>
              <PasswordInput
                placeholder="Enter password"
                defaultValue="secret123"
                disabled
                leadingIcon={<Icon name="lock" size={16} />}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
