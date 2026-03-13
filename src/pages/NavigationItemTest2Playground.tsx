import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavigationItemTest2 } from "../components/NavigationItemTest2";
import { Icon } from "../components/Icon";

const WRAPPER_PADDING = 16;
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 296;

const controlRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

export default function NavigationItemTest2Playground() {
  const [label, setLabel] = useState("Home");
  const [expanded, setExpanded] = useState(true);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [badge, setBadge] = useState(true);
  const [badgeCount, setBadgeCount] = useState("3");

  const [expandedWidth, setExpandedWidth] = useState(EXPANDED_WIDTH);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  useLayoutEffect(() => {
    isTransitioningRef.current = true;
    const el = wrapperRef.current;
    if (!el) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "width") {
        isTransitioningRef.current = false;
      }
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [expanded]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !expanded) return;
    const ro = new ResizeObserver(([entry]) => {
      if (isTransitioningRef.current) return;
      const w = Math.round(entry.borderBoxSize[0].inlineSize);
      setExpandedWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  const handleWidthInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpandedWidth(Number(e.target.value));
  }, []);

  const WRAPPER_BORDER = 1;
  const navExpandedWidth = expandedWidth - WRAPPER_PADDING * 2 - WRAPPER_BORDER * 2;

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
      <h1>NavigationItemTest2 — Badge Sync Lab</h1>

      <p style={{ fontSize: 13, margin: "0 0 16px", opacity: 0.7 }}>
        Fresh duplicate of NavigationItem with inline badge position tracking.
        Toggle expand/collapse and resize the wrapper to observe badge sync behavior.
      </p>

      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 200 }}>
          <label style={controlRow}>
            Label
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{ flex: 1, padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}
            />
          </label>
          <label style={controlRow}>
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            checked
          </label>
          <label style={controlRow}>
            <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
            locked
          </label>
          <label style={controlRow}>
            <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} />
            badge
            {badge && (
              <input
                type="text"
                value={badgeCount}
                onChange={(e) => setBadgeCount(e.target.value)}
                style={{ width: 40 }}
              />
            )}
          </label>
          <label style={controlRow}>
            Width:
            <input
              type="number"
              value={expandedWidth}
              onChange={handleWidthInput}
              style={{ width: 60 }}
            />
          </label>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ marginTop: 8, padding: "6px 16px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer", fontSize: 13 }}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "start" }}>
          <div ref={wrapperRef} style={wrapperStyle}>
            <NavigationItemTest2
              label={label}
              leadingIcon={<Icon name="home" size={20} />}
              iconOnly={!expanded}
              checked={checked}
              locked={locked}
              badgeCount={badge ? badgeCount : undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
}
