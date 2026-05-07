import { useState } from "react";
import { ContentSwitcher } from "@sds/components/ContentSwitcher";
import { ContentSwitcherItem } from "@sds/components/ContentSwitcherItem";
import type {
  ContentSwitcherItemSize,
  ContentSwitcherItemEmphasis,
} from "@sds/components/ContentSwitcherItem";
import { Icon } from "@sds/components/Icon";

const SIZES: ContentSwitcherItemSize[] = ["sm", "md", "lg"];
const EMPHASES: ContentSwitcherItemEmphasis[] = ["high", "low"];

export default function ContentSwitcherPlayground() {
  const [size, setSize] = useState<ContentSwitcherItemSize>("md");
  const [emphasis, setEmphasis] = useState<ContentSwitcherItemEmphasis>("high");
  const [withIcon, setWithIcon] = useState(true);
  const [globalDisabled, setGlobalDisabled] = useState(false);
  const [selected, setSelected] = useState("tab1");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = {
    fontSize: 12,
    color: "var(--text-neutral-secondary-default)",
  } as const;

  const iconForSize = (s: ContentSwitcherItemSize) => (
    <Icon
      name="favorite_fill"
      size={s === "lg" ? 20 : 16}
      type="monochrome"
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>ContentSwitcher</h2>

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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select
                value={size}
                onChange={(e) =>
                  setSize(e.target.value as ContentSwitcherItemSize)
                }
                style={selectStyle}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select
                value={emphasis}
                onChange={(e) =>
                  setEmphasis(e.target.value as ContentSwitcherItemEmphasis)
                }
                style={selectStyle}
              >
                {EMPHASES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={withIcon}
                onChange={(e) => setWithIcon(e.target.checked)}
              />
              <span style={captionStyle}>Leading icon</span>
            </label>

            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={globalDisabled}
                onChange={(e) => setGlobalDisabled(e.target.checked)}
              />
              <span style={captionStyle}>Disabled</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              background: "var(--element-surface-default)",
              borderRadius: 8,
            }}
          >
            <ContentSwitcher
              size={size}
              emphasis={emphasis}
              value={selected}
              onChange={setSelected}
              disabled={globalDisabled}
            >
              {["tab1", "tab2", "tab3", "tab4", "tab5", "tab6"].map((val) => (
                <ContentSwitcherItem
                  key={val}
                  value={val}
                  leadingIcon={withIcon ? iconForSize(size) : undefined}
                >
                  Label
                </ContentSwitcherItem>
              ))}
            </ContentSwitcher>
          </div>

          <p style={{ ...captionStyle, textAlign: "center" }}>
            Selected: <strong>{selected}</strong>
          </p>
        </div>
      </section>

      {/* ── All sizes × emphases grid ──────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>All Sizes &amp; Emphases</h2>

        {EMPHASES.map((emp) => (
          <div key={emp} style={{ marginBottom: 24 }}>
            <h3
              style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}
            >
              emphasis=&quot;{emp}&quot;
            </h3>

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
                <SwitcherRow key={s} size={s} emphasis={emp} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Content switching demo ─────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Content Switching Demo</h2>

        <ContentSwitchingDemo />
      </section>
    </div>
  );
}

function SwitcherRow({
  size,
  emphasis,
}: {
  size: ContentSwitcherItemSize;
  emphasis: ContentSwitcherItemEmphasis;
}) {
  const [value, setValue] = useState("a");
  const captionStyle = {
    fontSize: 12,
    color: "var(--text-neutral-secondary-default)",
  } as const;

  const iconSize = size === "lg" ? 20 : 16;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ ...captionStyle, width: 24, textAlign: "right" }}>
        {size}
      </span>
      <ContentSwitcher
        size={size}
        emphasis={emphasis}
        value={value}
        onChange={setValue}
      >
        <ContentSwitcherItem
          value="a"
          leadingIcon={
            <Icon name="favorite_fill" size={iconSize} type="monochrome" />
          }
        >
          Label
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="b"
          leadingIcon={
            <Icon name="favorite_fill" size={iconSize} type="monochrome" />
          }
        >
          Label
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="c"
          leadingIcon={
            <Icon name="favorite_fill" size={iconSize} type="monochrome" />
          }
        >
          Label
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="d"
          leadingIcon={
            <Icon name="favorite_fill" size={iconSize} type="monochrome" />
          }
        >
          Label
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="e"
          leadingIcon={
            <Icon name="favorite_fill" size={iconSize} type="monochrome" />
          }
        >
          Label
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="f"
          leadingIcon={
            <Icon name="favorite_fill" size={iconSize} type="monochrome" />
          }
        >
          Label
        </ContentSwitcherItem>
      </ContentSwitcher>
    </div>
  );
}

function ContentSwitchingDemo() {
  const [view, setView] = useState("overview");

  const panelStyle = {
    padding: 24,
    border: "1px solid var(--element-outline-neutral-subtlest)",
    borderRadius: 12,
    marginTop: 12,
    fontSize: 14,
    color: "var(--text-neutral-secondary-default)",
  } as const;

  return (
    <div>
      <ContentSwitcher
        size="md"
        emphasis="high"
        value={view}
        onChange={setView}
      >
        <ContentSwitcherItem
          value="overview"
          leadingIcon={<Icon name="home" size={16} type="monochrome" />}
        >
          Overview
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="analytics"
          leadingIcon={
            <Icon name="dashboard" size={16} type="monochrome" />
          }
        >
          Analytics
        </ContentSwitcherItem>
        <ContentSwitcherItem
          value="settings"
          leadingIcon={<Icon name="settings" size={16} type="monochrome" />}
        >
          Settings
        </ContentSwitcherItem>
      </ContentSwitcher>

      <div style={panelStyle}>
        {view === "overview" && (
          <p>
            Welcome to the overview panel. This demonstrates how
            ContentSwitcher toggles between different content sections.
          </p>
        )}
        {view === "analytics" && (
          <p>
            Analytics dashboard content would appear here with charts and
            metrics.
          </p>
        )}
        {view === "settings" && (
          <p>
            Settings panel where users can configure preferences and options.
          </p>
        )}
      </div>
    </div>
  );
}
