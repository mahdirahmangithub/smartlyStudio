import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { NavigationItemTest } from "../components/NavigationItemTest";
import { Icon } from "../components/Icon";

const WRAPPER_PADDING = 16;
const COLLAPSED_WIDTH = 72;

const controlRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

export default function NavigationItemTestPlayground() {
  const [expanded, setExpanded] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(320);
  const [label, setLabel] = useState("Home");
  const [checked, setChecked] = useState(false);
  const [badgeCount, setBadgeCount] = useState("3");
  const [locked, setLocked] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [externalLink, setExternalLink] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = useState(expandedWidth);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !expanded) return;
    let latestWidth = expandedWidth;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentBoxSize[0].inlineSize) + WRAPPER_PADDING * 2;
      latestWidth = w;
      setLiveWidth(w);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      setExpandedWidth(latestWidth);
    };
  }, [expanded]);

  const handleWidthInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setExpandedWidth(v);
    setLiveWidth(v);
  }, []);

  const parsedBadge =
    badgeCount === ""
      ? undefined
      : isNaN(Number(badgeCount))
        ? badgeCount
        : Number(badgeCount);

  const navExpandedWidth = (expanded ? liveWidth : expandedWidth) - WRAPPER_PADDING * 2;

  const wrapperStyle: Record<string, unknown> = {
    "--nav-expanded-width": `${navExpandedWidth}px`,
    width: expanded ? expandedWidth : COLLAPSED_WIDTH,
    padding: WRAPPER_PADDING,
    borderRadius: 12,
    background: "var(--element-surface-base)",
    border: "1px solid var(--element-outline-neutral-default)",
    overflow: "hidden",
    transition: expanded
      ? "width var(--animation-state-expand-duration) var(--animation-state-expand-easing)"
      : "width var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)",
    resize: expanded ? "horizontal" : "none",
    minWidth: expanded ? COLLAPSED_WIDTH : undefined,
    maxWidth: expanded ? 600 : undefined,
  };

  return (
    <>
      <h1>NavigationItem — TEST</h1>
      <p style={{ fontSize: 13, margin: "0 0 16px", opacity: 0.7 }}>
        Parent wrapper drives the width transition. Component just fills available space.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Collapse" : "Expand"}
        </button>
        <label style={controlRow}>
          Width:
          <input
            type="number"
            value={expandedWidth}
            onChange={handleWidthInput}
            style={{ width: 60 }}
          />
        </label>
        <label style={controlRow}>
          Label:
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ width: 140 }} />
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          Checked
        </label>
        <label style={controlRow}>
          Badge:
          <input value={badgeCount} onChange={(e) => setBadgeCount(e.target.value)} style={{ width: 50 }} />
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
          Locked
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Pinned
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={externalLink} onChange={(e) => setExternalLink(e.target.checked)} />
          External
        </label>
      </div>

      <div ref={wrapperRef} style={wrapperStyle}>
        <NavigationItemTest
          label={label}
          leadingIcon={<Icon name="home" size={20} />}
          iconOnly={!expanded}
          checked={checked}
          badgeCount={parsedBadge}
          locked={locked}
          pinned={pinned}
          externalLink={externalLink}
          actionIcon={pinned ? "keep_off" : "keep"}
          actionLabel={pinned ? "Unpin" : "Pin"}
          onAction={() => setPinned((v) => !v)}
          onClick={() => setChecked((v) => !v)}
        />
      </div>
    </>
  );
}
