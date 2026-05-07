import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Popover, type PopoverDensity, type PopoverPlacement, type VirtualAnchor } from "@sds/components/Popover";
import { Button } from "@sds/components/Button";
import { BodyText } from "@sds/components/BodyText";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

/* ═══════════════════════════════════════════════════════════════════════
   Basic demo
   ═══════════════════════════════════════════════════════════════════════ */

function BasicDemo() {
  const [open, setOpen] = useState(false);
  const [density, setDensity] = useState<PopoverDensity>("sm");
  const [scrollable, setScrollable] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <Button
          ref={btnRef}
          variant="brand"
          emphasis="high"
          size="md"
          onClick={() => setOpen((p) => !p)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {open ? "Close" : "Open"} Popover
        </Button>
        <select
          value={density}
          onChange={(e) => setDensity(e.target.value as PopoverDensity)}
          style={{ padding: "4px 8px", borderRadius: 6, fontSize: 13 }}
        >
          <option value="none">none</option>
          <option value="sm">sm</option>
          <option value="lg">lg</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={scrollable}
            onChange={(e) => setScrollable(e.target.checked)}
          />
          Scrollable
        </label>
      </div>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        density={density}
        title="Popover Title"
        description="A short description of the popover content."
        headerSize="md"
        footerActions={
          <>
            <Button variant="neutral" emphasis="medium" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="brand" emphasis="high" size="sm">
              Confirm
            </Button>
          </>
        }
      >
        {scrollable ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 15 }, (_, i) => (
              <BodyText key={i} size="md">
                {i + 1}. {LOREM}
              </BodyText>
            ))}
          </div>
        ) : (
          <BodyText size="md">{LOREM}</BodyText>
        )}
      </Popover>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Placement demo
   ═══════════════════════════════════════════════════════════════════════ */

const PLACEMENTS: PopoverPlacement[] = [
  "bottom-start",
  "bottom",
  "bottom-end",
  "top-start",
  "top",
  "top-end",
  "left-start",
  "left",
  "left-end",
  "right-start",
  "right",
  "right-end",
];

function PlacementDemo() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, auto)",
        gap: 8,
        justifyContent: "center",
        padding: "80px 0",
      }}
    >
      {PLACEMENTS.map((p) => (
        <div key={p}>
          <Button
            ref={(el) => { refs.current[p] = el; }}
            variant="neutral"
            emphasis="medium"
            size="sm"
            onClick={() => setOpenKey(openKey === p ? null : p)}
            aria-haspopup="dialog"
            aria-expanded={openKey === p}
          >
            {p}
          </Button>
          <Popover
            open={openKey === p}
            onClose={() => setOpenKey(null)}
            anchorRef={{ current: refs.current[p] ?? null }}
            placement={p}
            title={p}
            width={240}
            maxHeight={200}
          >
            <BodyText size="sm">
              Content for {p} placement.
            </BodyText>
          </Popover>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Header variations demo
   ═══════════════════════════════════════════════════════════════════════ */

function HeaderVariationsDemo() {
  const [open, setOpen] = useState(false);
  const [withBack, setWithBack] = useState(false);
  const [withDesc, setWithDesc] = useState(true);
  const [withFooter, setWithFooter] = useState(true);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <Button
          ref={btnRef}
          variant="brand"
          emphasis="high"
          size="md"
          onClick={() => setOpen((p) => !p)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          Open
        </Button>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={withBack} onChange={(e) => setWithBack(e.target.checked)} />
          Back button
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={withDesc} onChange={(e) => setWithDesc(e.target.checked)} />
          Description
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={withFooter} onChange={(e) => setWithFooter(e.target.checked)} />
          Footer
        </label>
      </div>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        title="Header Variations"
        description={withDesc ? "Configurable header with back, description, and close." : undefined}
        headerSize="md"
        onBack={withBack ? () => {} : undefined}
        footerActions={
          withFooter ? (
            <Button variant="brand" emphasis="high" size="sm">
              Done
            </Button>
          ) : undefined
        }
        footerExtraAction={
          withFooter ? (
            <Button variant="alert" emphasis="low" size="sm">
              Delete
            </Button>
          ) : undefined
        }
      >
        <BodyText size="md">{LOREM}</BodyText>
      </Popover>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   No header / no footer (content only)
   ═══════════════════════════════════════════════════════════════════════ */

function ContentOnlyDemo() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Button
        ref={btnRef}
        variant="neutral"
        emphasis="medium"
        size="md"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Content Only
      </Button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        density="sm"
        width={280}
      >
        <BodyText size="md">
          A simple popover with no header or footer — just content.
        </BodyText>
      </Popover>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Fixed corner demo (virtual anchor at bottom-right)
   ═══════════════════════════════════════════════════════════════════════ */

function FixedCornerDemo() {
  const [open, setOpen] = useState(false);
  const [fixed, setFixed] = useState(true);
  const anchorRef = useRef<VirtualAnchor | null>(null);
  const fixedRef = useRef(fixed);
  fixedRef.current = fixed;

  const handleOpen = useCallback(() => {
    const pad = 32;
    const openScrollX = window.scrollX;
    const openScrollY = window.scrollY;

    anchorRef.current = {
      getBoundingClientRect: () => {
        if (fixedRef.current) {
          return new DOMRect(
            window.innerWidth - pad,
            window.innerHeight - pad,
            0,
            0,
          );
        }
        return new DOMRect(
          window.innerWidth - pad - (window.scrollX - openScrollX),
          window.innerHeight - pad - (window.scrollY - openScrollY),
          0,
          0,
        );
      },
    };
    setOpen(true);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <Button
          variant="brand"
          emphasis="high"
          size="md"
          onClick={() => (open ? setOpen(false) : handleOpen())}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {open ? "Close" : "Open"} Corner Popover
        </Button>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={fixed}
            onChange={(e) => setFixed(e.target.checked)}
          />
          Fixed (stays on scroll)
        </label>
      </div>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="top-end"
        density="sm"
        title="Corner Popover"
        description="Anchored 32px from the bottom-right edges."
        headerSize="md"
        fixed={fixed}
        closeOnClickOutside={false}
      >
        <BodyText size="md">{LOREM}</BodyText>
      </Popover>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Text selection (virtual anchor) demo
   ═══════════════════════════════════════════════════════════════════════ */

const ARTICLE = `Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values (such as hex values for color or pixel values for spacing) in order to maintain a scalable and consistent visual system for UI development.

Tokens can represent spacing, color, typography, object styles, and more. They are the single source of truth for design decisions in both design tools and code. By using tokens, we ensure that every part of the interface speaks the same visual language.

When a token value changes, every component that references it updates automatically. This makes design system maintenance efficient and reduces the risk of visual inconsistencies across platforms.`;

function TextSelectionDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<VirtualAnchor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (
        !sel ||
        sel.isCollapsed ||
        sel.rangeCount === 0 ||
        !containerRef.current?.contains(sel.anchorNode)
      ) {
        return;
      }

      const range = sel.getRangeAt(0);
      anchorRef.current = {
        getBoundingClientRect: () => range.getBoundingClientRect(),
      };
      setOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) setOpen(false);
    };

    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, [open]);

  return (
    <div>
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        style={{
          padding: 16,
          borderRadius: 8,
          background: "var(--element-fill-neutral-tertiary-default)",
          cursor: "text",
          userSelect: "text",
          lineHeight: 1.7,
        }}
      >
        <BodyText size="md">{ARTICLE}</BodyText>
      </div>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="top"
        density="none"
        width={160}
        maxHeight={200}
        role="toolbar"
        autoFocus={false}
        closeOnEscape
      >
        <div style={{ display: "flex", gap: 4, padding: "var(--spacing-xs)" }}>
          <IconButton
            size="sm"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="content_copy" size={16} />}
            aria-label="Copy"
            onClick={() => {
              const sel = window.getSelection();
              if (sel) navigator.clipboard.writeText(sel.toString());
              setOpen(false);
            }}
          />
          <IconButton
            size="sm"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="search" size={16} />}
            aria-label="Search"
            onClick={() => setOpen(false)}
          />
          <IconButton
            size="sm"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="bookmark" size={16} />}
            aria-label="Bookmark"
            onClick={() => setOpen(false)}
          />
        </div>
      </Popover>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Playground root
   ═══════════════════════════════════════════════════════════════════════ */

export default function PopoverPlayground() {
  return (
    <>
      <h1>Popover</h1>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Trigger button, density selector, and scrollable toggle. Includes header with title/description and footer with actions.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Placement</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All 12 placement options. The popover flips when there is not enough space.
        </p>
        <div style={cardStyle}>
          <PlacementDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Header Variations</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle back button, description, and footer visibility.
        </p>
        <div style={cardStyle}>
          <HeaderVariationsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Content Only</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Popover with no header or footer — density padding applied directly to content.
        </p>
        <div style={cardStyle}>
          <ContentOnlyDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Fixed Corner (Virtual Anchor)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Opens a popover at the bottom-right corner of the viewport (32px from edges). Toggle the checkbox to switch between fixed positioning and scrolling with page content. Only closable via the header close button.
        </p>
        <div style={cardStyle}>
          <FixedCornerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Text Selection (Virtual Anchor)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Select text in the paragraph below. A toolbar popover appears above the selection using a virtual anchor.
        </p>
        <div style={cardStyle}>
          <TextSelectionDemo />
        </div>
      </section>
    </>
  );
}
