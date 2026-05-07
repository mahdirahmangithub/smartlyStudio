import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  Pagination,
  type PaginationProps,
  type PaginationSize,
} from "@sds/components/Pagination";
import { Button } from "@sds/components/Button";

const sectionCardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 24,
  marginTop: 12,
  background: "var(--element-surface-default)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const variantRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "180px minmax(0, 1fr)",
  alignItems: "center",
  gap: 16,
};

const variantLabelStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--text-neutral-tertiary-default)",
  fontFamily: "var(--type-code-sm-family)",
};

const controlsCardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 13,
};

const labelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontWeight: 500,
};

const inputStyle: CSSProperties = {
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 13,
  fontFamily: "inherit",
};

/* ─────────────────────────── Variant matrix ─────────────────────────── */

interface VariantSpec {
  label: string;
  count: number;
  page: number;
}

const VARIANTS: VariantSpec[] = [
  { label: "single, page 1", count: 1, page: 1 },
  { label: "<8, start", count: 7, page: 1 },
  { label: "<8, near-start", count: 7, page: 2 },
  { label: "<8, middle", count: 7, page: 4 },
  { label: "<8, near-end", count: 7, page: 6 },
  { label: "<8, end", count: 7, page: 7 },
  { label: "≥8, start", count: 30, page: 1 },
  { label: "≥8, near-start", count: 30, page: 2 },
  { label: "≥8, middle", count: 30, page: 15 },
  { label: "≥8, near-end", count: 30, page: 29 },
  { label: "≥8, end", count: 30, page: 30 },
];

function VariantMatrix({
  compact,
  size = "sm",
}: {
  compact: boolean;
  size?: PaginationSize;
}) {
  // Local state per row so each variant's prev/next still works in isolation.
  const [pages, setPages] = useState(VARIANTS.map((v) => v.page));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {VARIANTS.map((v, i) => (
        <div key={`${size}-${compact}-${v.label}`} style={variantRowStyle}>
          <span style={variantLabelStyle}>{v.label}</span>
          <Pagination
            size={size}
            count={v.count}
            page={pages[i]}
            onChange={(p) =>
              setPages((prev) => prev.map((x, j) => (i === j ? p : x)))
            }
            compact={compact}
            caption={compact ? "Preview" : undefined}
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Real-world example ─────────────────────────── */

interface DemoItem {
  id: number;
  title: string;
  status: "Active" | "Paused" | "Draft";
  spend: string;
}

const STATUSES: DemoItem["status"][] = ["Active", "Paused", "Draft"];

function makeItems(n: number): DemoItem[] {
  const items: DemoItem[] = [];
  for (let i = 0; i < n; i++) {
    items.push({
      id: i + 1,
      title: `Campaign #${(i + 1).toString().padStart(3, "0")}`,
      status: STATUSES[i % STATUSES.length],
      spend: `€${(123 + i * 47).toLocaleString("en-US")}`,
    });
  }
  return items;
}

const PAGE_SIZE = 10;

function RealWorldExample() {
  const items = useMemo(() => makeItems(57), []);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const start = (page - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  // Scroll the list back to the top when the user changes pages so the new
  // slice is visible without manual scrolling. Pure UX nicety — the layout
  // works without it too.
  useEffect(() => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [page]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top toolbar — default-mode pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-neutral-secondary-default)" }}>
          Showing {start + 1}–{start + visible.length} of {items.length} campaigns
        </span>
        <Pagination
          count={totalPages}
          page={page}
          onChange={setPage}
          aria-label="Campaign list pagination"
        />
      </div>

      {/* Paginated content */}
      <div
        ref={listRef}
        style={{
          border: "1px solid var(--element-outline-neutral-default)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {visible.map((it, i) => (
          <div
            key={it.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 100px 120px",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              borderTop:
                i === 0 ? "none" : "1px solid var(--element-outline-neutral-default)",
              fontSize: 14,
            }}
          >
            <span style={{ fontWeight: 500 }}>{it.title}</span>
            <span style={{ color: "var(--text-neutral-tertiary-default)" }}>
              {it.status}
            </span>
            <span
              style={{
                textAlign: "right",
                fontFamily: "var(--type-code-sm-family)",
              }}
            >
              {it.spend}
            </span>
          </div>
        ))}
      </div>

      {/* Footer — compact pagination, synced via shared `page` state */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={setPage}
          compact
          caption="Page"
          aria-label="Campaign list pagination, footer"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function PaginationPlayground() {
  const [count, setCount] = useState(30);
  const [page, setPage] = useState(15);
  const [size, setSize] = useState<PaginationSize>("sm");
  const [compact, setCompact] = useState(false);
  const [compactControl, setCompactControl] =
    useState<NonNullable<PaginationProps["compactControl"]>>("input");
  const [caption, setCaption] = useState("Preview");
  const [showCaption, setShowCaption] = useState(true);
  const [showTotal, setShowTotal] = useState(true);
  const [siblingCount, setSiblingCount] = useState(1);
  const [boundaryCount, setBoundaryCount] = useState(1);
  const [disabled, setDisabled] = useState(false);

  // Keep `page` in range when `count` changes via the controls.
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), Math.max(1, count)));
  }, [count]);

  return (
    <>
      <h1>Pagination</h1>
      <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 8px" }}>
        Page navigation control. Default mode renders a numeric button row with
        ellipsis truncation; <code>compact</code> mode shows a numeric input.
        Both modes always render prev / next IconButtons.
      </p>

      {/* Interactive ─────────────────────────── */}
      <h2>Interactive</h2>
      <div style={sectionCardStyle}>
        <div
          style={{
            minHeight: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pagination
            size={size}
            count={count}
            page={page}
            onChange={setPage}
            compact={compact}
            compactControl={compactControl}
            caption={compact && showCaption ? caption : undefined}
            showTotal={showTotal}
            siblingCount={siblingCount}
            boundaryCount={boundaryCount}
            disabled={disabled}
          />
        </div>
        <div style={{ fontSize: 12, color: "var(--text-neutral-tertiary-default)" }}>
          Current page: <strong>{page}</strong> / {count}
        </div>
      </div>

      <div style={controlsCardStyle}>
        <label style={fieldStyle}>
          <span style={labelStyle}>Size</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as PaginationSize)}
            style={inputStyle}
          >
            <option value="sm">sm</option>
            <option value="lg">lg</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Count</span>
          <input
            type="number"
            min={0}
            value={count}
            onChange={(e) => setCount(Math.max(0, Number(e.target.value)))}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Page</span>
          <input
            type="number"
            min={1}
            max={Math.max(1, count)}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>siblingCount</span>
          <input
            type="number"
            min={0}
            max={5}
            value={siblingCount}
            onChange={(e) => setSiblingCount(Math.max(0, Number(e.target.value)))}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>boundaryCount</span>
          <input
            type="number"
            min={0}
            max={5}
            value={boundaryCount}
            onChange={(e) => setBoundaryCount(Math.max(0, Number(e.target.value)))}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={compact}
              onChange={(e) => setCompact(e.target.checked)}
            />
            Compact
          </span>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Compact control</span>
          <select
            value={compactControl}
            onChange={(e) =>
              setCompactControl(
                e.target.value as NonNullable<PaginationProps["compactControl"]>,
              )
            }
            disabled={!compact}
            style={inputStyle}
          >
            <option value="input">input (numeric field)</option>
            <option value="menu">menu (button + dropdown)</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showCaption}
              onChange={(e) => setShowCaption(e.target.checked)}
              disabled={!compact}
            />
            Caption
          </span>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={!compact || !showCaption}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showTotal}
              onChange={(e) => setShowTotal(e.target.checked)}
              disabled={!compact}
            />
            Show total ("of N")
          </span>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
            />
            Disabled
          </span>
          <Button
            size="sm"
            emphasis="medium"
            variant="neutral"
            onClick={() => setPage(1)}
          >
            Reset to page 1
          </Button>
        </label>
      </div>

      {/* Variants — sm default ─────────────────────────── */}
      <h2 style={{ marginTop: 32 }}>Size sm — default mode</h2>
      <div style={sectionCardStyle}>
        <VariantMatrix compact={false} size="sm" />
      </div>

      {/* Variants — sm compact ─────────────────────────── */}
      <h2 style={{ marginTop: 32 }}>Size sm — compact mode</h2>
      <div style={sectionCardStyle}>
        <VariantMatrix compact={true} size="sm" />
      </div>

      {/* Variants — lg default ─────────────────────────── */}
      <h2 style={{ marginTop: 32 }}>Size lg — default mode</h2>
      <div style={sectionCardStyle}>
        <VariantMatrix compact={false} size="lg" />
      </div>

      {/* Variants — lg compact ─────────────────────────── */}
      <h2 style={{ marginTop: 32 }}>Size lg — compact mode</h2>
      <div style={sectionCardStyle}>
        <VariantMatrix compact={true} size="lg" />
      </div>

      {/* Real-world example ─────────────────────────── */}
      <h2 style={{ marginTop: 32 }}>Real-world example</h2>
      <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 8px" }}>
        Paginated campaign list (57 items, 10 per page → 6 pages). Default-mode
        pagination at the top of the list, compact-mode pagination at the
        bottom — both wired to the same <code>page</code> state, so changing
        either one updates the list and keeps both controls in sync.
      </p>
      <div style={sectionCardStyle}>
        <RealWorldExample />
      </div>
    </>
  );
}
