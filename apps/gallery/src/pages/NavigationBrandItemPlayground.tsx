import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavigationBrandItem } from "@sds/components/NavigationBrandItem";

const WRAPPER_PADDING = 16;
const COLLAPSED_WIDTH = 74;
const EXPANDED_WIDTH = 296;

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const controlRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

function ParentDrivenDemo() {
  const [expanded, setExpanded] = useState(false);
  const [badge, setBadge] = useState(true);
  const [expandedWidth, setExpandedWidth] = useState(EXPANDED_WIDTH);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  useLayoutEffect(() => {
    isTransitioningRef.current = true;
    const el = wrapperRef.current;
    if (!el) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "width") isTransitioningRef.current = false;
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
          <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} />
          Badge
        </label>
      </div>

      <div ref={wrapperRef} style={wrapperStyle}>
        <NavigationBrandItem
          iconOnly={!expanded}
          badge={badge}
          onClick={() => console.log("Brand clicked")}
        />
      </div>
    </>
  );
}

function StatesDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Icon-only (collapsed)</p>
        <div style={{ display: "flex", gap: 16 }}>
          <NavigationBrandItem iconOnly badge />
          <NavigationBrandItem iconOnly badge={false} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Expanded — hover to see state changes on the logo circle</p>
        <div style={{ "--nav-expanded-width": `${EXPANDED_WIDTH}px`, display: "flex", flexDirection: "column", gap: 8, maxWidth: EXPANDED_WIDTH } as React.CSSProperties}>
          <NavigationBrandItem badge />
          <NavigationBrandItem badge={false} />
        </div>
      </div>
    </div>
  );
}

function IconOnlyToggleDemo() {
  const [iconOnly, setIconOnly] = useState(false);

  return (
    <>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={iconOnly}
          onChange={(e) => setIconOnly(e.target.checked)}
        />
        Icon-only mode
      </label>
      <div style={{
        "--nav-expanded-width": `${EXPANDED_WIDTH}px`,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: iconOnly ? 40 : EXPANDED_WIDTH,
        transition: iconOnly
          ? "width var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)"
          : "width var(--animation-state-expand-duration) var(--animation-state-expand-easing)",
      } as React.CSSProperties}>
        <NavigationBrandItem iconOnly={iconOnly} badge />
      </div>
    </>
  );
}

export default function NavigationBrandItemPlayground() {
  return (
    <>
      <h1>NavigationBrandItem</h1>

      <section style={sectionStyle}>
        <h2>Parent-Driven Expansion</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Parent wrapper drives the width transition. Resizable from the right edge when expanded. Logo circle shows brand states on hover/press/focus.
        </p>
        <div style={cardStyle}>
          <ParentDrivenDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Icon-only and expanded variants, with and without notification badge.
        </p>
        <div style={cardStyle}>
          <StatesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon-Only Toggle</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle between expanded and icon-only. Logotype fades smoothly on collapse.
        </p>
        <div style={cardStyle}>
          <IconOnlyToggleDemo />
        </div>
      </section>
    </>
  );
}
