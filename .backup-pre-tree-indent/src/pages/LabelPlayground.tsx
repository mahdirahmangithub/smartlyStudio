import { useState } from "react";
import { Label, type LabelSize, type LabelDensity } from "../components/Label";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";

const SIZES: LabelSize[] = ["sm", "lg"];
const DENSITIES: LabelDensity[] = ["none", "xs", "sm", "md"];

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelCtrlStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const sectionCard = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

export default function LabelPlayground() {
  const [size, setSize] = useState<LabelSize>("sm");
  const [density, setDensity] = useState<LabelDensity>("none");
  const [strong, setStrong] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [required, setRequired] = useState(true);
  const [optional, setOptional] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showAction, setShowAction] = useState(true);
  const [labelText, setLabelText] = useState("Label");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Label</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as LabelSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Density</span>
              <select value={density} onChange={(e) => setDensity(e.target.value as LabelDensity)} style={selectStyle}>
                {DENSITIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={strong} onChange={(e) => setStrong(e.target.checked)} />
              <span style={captionStyle}>Strong</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showIcon} onChange={(e) => setShowIcon(e.target.checked)} />
              <span style={captionStyle}>Leading icon</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={required} onChange={(e) => { setRequired(e.target.checked); if (e.target.checked) setOptional(false); }} />
              <span style={captionStyle}>Required</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={optional} onChange={(e) => { setOptional(e.target.checked); if (e.target.checked) setRequired(false); }} />
              <span style={captionStyle}>Optional</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showHint} onChange={(e) => setShowHint(e.target.checked)} />
              <span style={captionStyle}>Hint</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
              <span style={captionStyle}>Description</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showAction} onChange={(e) => setShowAction(e.target.checked)} />
              <span style={captionStyle}>Action</span>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Text</span>
              <input type="text" value={labelText} onChange={(e) => setLabelText(e.target.value)} style={{ ...selectStyle, width: 180 }} />
            </label>
          </div>

          <div style={{ maxWidth: 400 }}>
            <Label
              label={labelText}
              size={size}
              density={density}
              strong={strong}
              disabled={disabled}
              leadingIcon={showIcon ? <Icon name="favorite_fill" size={16} /> : undefined}
              required={required}
              optional={optional}
              hint={showHint ? "Helpful info" : undefined}
              hintDescription={showHint ? "Extra description for the tooltip" : undefined}
              description={showDescription ? "Description" : undefined}
              action={showAction ? <IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More actions" /> : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── Size & strong comparison ─────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Sizes &amp; Weights</h2>

        <div style={{ ...sectionCard, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={captionStyle}>{s} &mdash; regular</span>
              <Label
                label="Label"
                size={s}
                leadingIcon={<Icon name="favorite_fill" size={16} />}
                required
                hint="Info"
                optional={false}
                description="Description"
                action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
              />
              <span style={captionStyle}>{s} &mdash; strong</span>
              <Label
                label="Label"
                size={s}
                strong
                leadingIcon={<Icon name="favorite_fill" size={16} />}
                required
                hint="Info"
                optional={false}
                description="Description"
                action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Density ───────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Density</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 0 }}>
          {DENSITIES.map((d) => (
            <div key={d} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ ...captionStyle, width: 40, textAlign: "right" }}>{d}</span>
              <div style={{ flex: 1, maxWidth: 400, background: "var(--element-fill-neutral-primary-inverse-default)", borderRadius: 4, padding: "0 8px" }}>
                <Label
                  label="Label"
                  size="sm"
                  density={d}
                  leadingIcon={<Icon name="favorite_fill" size={16} />}
                  required
                  hint="Info"
                  description="Description"
                  action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── States ────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>States</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span style={captionStyle}>Normal</span>
            <Label
              label="Label"
              leadingIcon={<Icon name="favorite_fill" size={16} />}
              required
              hint="Info"
              description="Description"
              action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
            />
          </div>
          <div>
            <span style={captionStyle}>Disabled</span>
            <Label
              label="Label"
              disabled
              leadingIcon={<Icon name="favorite_fill" size={16} />}
              required
              hint="Info"
              description="Description"
              action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
            />
          </div>
          <div>
            <span style={captionStyle}>Optional</span>
            <Label
              label="Label"
              optional
              leadingIcon={<Icon name="favorite_fill" size={16} />}
              hint="Info"
              description="Description"
              action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
            />
          </div>
        </div>
      </section>

      {/* ── Truncation (2-line clamp) ─────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Truncation (2-line clamp)</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ maxWidth: 260 }}>
            <span style={captionStyle}>Long label with required + hint + optional (260px)</span>
            <Label
              label="This is a very long label text that should wrap to two lines and then truncate with the trailing elements"
              required
              hint="Info"
              optional
              description="Description below"
              action={<IconButton icon={<Icon name="more_horiz" size={16} />} size="sm" variant="neutral" emphasis="low" aria-label="More" />}
            />
          </div>
          <div style={{ maxWidth: 200 }}>
            <span style={captionStyle}>With leading icon (200px)</span>
            <Label
              label="Another very long label that wraps and truncates after two lines of text"
              leadingIcon={<Icon name="favorite_fill" size={16} />}
              required
              hint="Info"
              description="Description"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
