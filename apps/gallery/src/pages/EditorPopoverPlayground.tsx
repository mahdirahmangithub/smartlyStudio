import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { EditorPopover } from "@sds/components/EditorPopover";
import { type VirtualAnchor } from "@sds/components/Popover";
import { Button } from "@sds/components/Button";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

/* ─── Global right-action toggles ─── */

interface RightActionFlags {
  showCta: boolean;
  showMore: boolean;
  showCloseButton: boolean;
}

const RightActionCtx = createContext<RightActionFlags>({
  showCta: true,
  showMore: true,
  showCloseButton: true,
});

function useRightActions() {
  return useContext(RightActionCtx);
}

const CTA_NODE = (
  <Button size="md" variant="brand" emphasis="high" leadingIcon={<Icon name="favorite_fill" size={16} />}>
    Label
  </Button>
);

/* ─── Basic toolbar ─── */

function BasicDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { showCta, showMore, showCloseButton } = useRightActions();

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button ref={anchorRef} size="sm" onClick={() => setOpen((o) => !o)}>
        Toggle toolbar
      </Button>

      <EditorPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="bottom-start"
        onMore={showMore ? () => alert("More clicked") : undefined}
        cta={showCta ? CTA_NODE : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
      </EditorPopover>
    </div>
  );
}

/* ─── Size comparison ─── */

function SizeDemo() {
  const [openLg, setOpenLg] = useState(false);
  const [openSm, setOpenSm] = useState(false);
  const lgRef = useRef<HTMLButtonElement>(null);
  const smRef = useRef<HTMLButtonElement>(null);
  const { showCta, showMore, showCloseButton } = useRightActions();

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button ref={lgRef} size="sm" onClick={() => setOpenLg((o) => !o)}>
        Size lg
      </Button>
      <Button ref={smRef} size="sm" onClick={() => setOpenSm((o) => !o)}>
        Size sm
      </Button>

      <EditorPopover
        open={openLg}
        onClose={() => setOpenLg(false)}
        anchorRef={lgRef}
        size="lg"
        onMore={showMore ? () => {} : undefined}
        cta={showCta ? CTA_NODE : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
      </EditorPopover>

      <EditorPopover
        open={openSm}
        onClose={() => setOpenSm(false)}
        anchorRef={smRef}
        size="sm"
        onMore={showMore ? () => {} : undefined}
        cta={showCta ? CTA_NODE : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
      </EditorPopover>
    </div>
  );
}

/* ─── Text selection toolbar ─── */

const SAMPLE_TEXT = `Design tokens are the visual design atoms of a design system — specifically, they are named entities that store visual design attributes. We use them in place of hard-coded values (such as hex values for color or pixel values for spacing) in order to maintain a scalable and consistent visual system for UI development.`;

function TextSelectionDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<VirtualAnchor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showCta, showMore, showCloseButton } = useRightActions();

  const handleMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setOpen(false);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!containerRef.current?.contains(range.commonAncestorContainer)) {
        setOpen(false);
        return;
      }
      const rect = range.getBoundingClientRect();
      anchorRef.current = { getBoundingClientRect: () => rect };
      setOpen(true);
    });
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        style={{
          padding: 16,
          lineHeight: 1.6,
          fontSize: 14,
          userSelect: "text",
        }}
      >
        {SAMPLE_TEXT}
      </div>

      <EditorPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="bottom"
        size="sm"
        closeOnClickOutside
        onMore={showMore ? () => {} : undefined}
        cta={showCta ? CTA_NODE : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="search" size={16} />} aria-label="Search" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="bookmark" size={16} />} aria-label="Bookmark" hideTooltip />
      </EditorPopover>
    </div>
  );
}

/* ─── Fixed + draggable ─── */

function FixedDraggableDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<VirtualAnchor | null>(null);
  const { showCta, showMore, showCloseButton } = useRightActions();

  const handleOpen = useCallback(() => {
    const pad = 32;
    anchorRef.current = {
      getBoundingClientRect: () =>
        new DOMRect(
          window.innerWidth / 2,
          window.innerHeight - pad,
          0,
          0,
        ),
    };
    setOpen(true);
  }, []);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button size="sm" onClick={handleOpen}>
        Open fixed + draggable
      </Button>

      <EditorPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="top"
        fixed
        draggable
        onMore={showMore ? () => alert("More") : undefined}
        cta={showCta ? (
          <Button size="md" variant="brand" emphasis="high">
            Apply
          </Button>
        ) : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
      </EditorPopover>
    </div>
  );
}

/* ─── Fixed width ─── */

function FixedWidthDemo() {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(360);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { showCta, showMore, showCloseButton } = useRightActions();

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button ref={anchorRef} size="sm" onClick={() => setOpen((o) => !o)}>
        Toggle toolbar
      </Button>
      <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
        Width
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          min={200}
          max={800}
          step={10}
          style={{ width: 64 }}
        />
        px
      </label>

      <EditorPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="bottom-start"
        width={width}
        onMore={showMore ? () => {} : undefined}
        cta={showCta ? CTA_NODE : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="text_fields_alt" size={16} />} aria-label="Format" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="link" size={16} />} aria-label="Link" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="image" size={16} />} aria-label="Image" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="code" size={16} />} aria-label="Code" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="list" size={16} />} aria-label="List" hideTooltip />
      </EditorPopover>
    </div>
  );
}

/* ─── Expand / collapse ─── */

function ExpandCollapseDemo() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { showCta, showMore, showCloseButton } = useRightActions();

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button ref={anchorRef} size="sm" onClick={() => setOpen((o) => !o)}>
        Toggle toolbar
      </Button>
      <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={expanded}
          onChange={(e) => setExpanded(e.target.checked)}
        />
        Expanded
      </label>

      <EditorPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        expanded={expanded}
        draggable
        onMore={showMore ? () => {} : undefined}
        cta={showCta ? CTA_NODE : undefined}
        showCloseButton={showCloseButton}
      >
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
        <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
      </EditorPopover>
    </div>
  );
}

/* ─── Checkbox row ─── */

function CheckboxControl({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

/* ─── Main ─── */

export default function EditorPopoverPlayground() {
  const [showCta, setShowCta] = useState(true);
  const [showMore, setShowMore] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(true);

  return (
    <RightActionCtx.Provider value={{ showCta, showMore, showCloseButton }}>
      <h1>EditorPopover</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <CheckboxControl checked={showCta} onChange={setShowCta}>CTA</CheckboxControl>
        <CheckboxControl checked={showMore} onChange={setShowMore}>More button</CheckboxControl>
        <CheckboxControl checked={showCloseButton} onChange={setShowCloseButton}>Close button</CheckboxControl>
      </div>

      <section style={sectionStyle}>
        <h2>Basic Toolbar</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Simple toolbar with action buttons, CTA, more, and close.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Size Variants</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Compare lg and sm sizes.
        </p>
        <div style={cardStyle}>
          <SizeDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Text Selection Toolbar</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Select text below. A toolbar appears above the selection using a virtual anchor.
        </p>
        <div style={cardStyle}>
          <TextSelectionDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Fixed + Draggable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Fixed toolbar with drag handle. Drag via the dots on the left edge.
        </p>
        <div style={cardStyle}>
          <FixedDraggableDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Fixed Width</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Adjust the width input to see how items scroll when the toolbar is constrained. Right actions stay pinned.
        </p>
        <div style={cardStyle}>
          <FixedWidthDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Expand / Collapse</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle the checkbox to expand or collapse the toolbar.
        </p>
        <div style={cardStyle}>
          <ExpandCollapseDemo />
        </div>
      </section>
    </RightActionCtx.Provider>
  );
}
