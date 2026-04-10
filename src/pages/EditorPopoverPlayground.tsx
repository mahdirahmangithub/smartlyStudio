import {
  type CSSProperties,
  useState,
  useRef,
  useCallback,
} from "react";
import { EditorPopover } from "../components/EditorPopover";
import { type VirtualAnchor } from "../components/Popover";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

/* ─── Basic toolbar ─── */

function BasicDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

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
        onMore={() => alert("More clicked")}
        cta={
          <Button size="sm" variant="brand" emphasis="high" leadingIcon={<Icon name="favorite_fill" size={16} />}>
            Label
          </Button>
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
        </div>
      </EditorPopover>
    </div>
  );
}

/* ─── With selection ─── */

const SELECTION_ICONS: IconName[] = [
  "graphic_eq",
  "play_arrow",
  "image",
  "record_voice_over",
  "ad_group",
  "gesture",
];

function SelectionDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button ref={anchorRef} size="sm" onClick={() => setOpen((o) => !o)}>
        Open with selection
      </Button>

      <EditorPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="bottom-start"
        selectionLabel="Audio Layer"
        selectionDescription="4 selections"
        selectionIcons={SELECTION_ICONS}
        selectionIconsMax={4}
        onSelectionClick={() => alert("Selection clicked")}
        onMore={() => alert("More clicked")}
        cta={
          <Button size="sm" variant="brand" emphasis="high" leadingIcon={<Icon name="favorite_fill" size={16} />}>
            Label
          </Button>
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
        </div>
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
        selectionLabel="Selection label"
        onMore={() => {}}
        cta={
          <Button size="sm" variant="brand" emphasis="high" leadingIcon={<Icon name="favorite_fill" size={16} />}>
            Label
          </Button>
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
        </div>
      </EditorPopover>

      <EditorPopover
        open={openSm}
        onClose={() => setOpenSm(false)}
        anchorRef={smRef}
        size="sm"
        selectionLabel="Selection label"
        onMore={() => {}}
        cta={
          <Button size="xs" variant="brand" emphasis="high" leadingIcon={<Icon name="favorite_fill" size={16} />}>
            Label
          </Button>
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton size="xs" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="xs" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
        </div>
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

  const handleMouseUp = useCallback(() => {
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
        placement="top"
        size="sm"
        closeOnClickOutside
      >
        <div style={{ display: "flex", gap: 4 }}>
          <IconButton size="xs" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="xs" variant="neutral" emphasis="low" icon={<Icon name="search" size={16} />} aria-label="Search" hideTooltip />
          <IconButton size="xs" variant="neutral" emphasis="low" icon={<Icon name="bookmark" size={16} />} aria-label="Bookmark" hideTooltip />
        </div>
      </EditorPopover>
    </div>
  );
}

/* ─── Fixed + draggable ─── */

function FixedDraggableDemo() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<VirtualAnchor | null>(null);

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
        selectionLabel="Bulk actions"
        selectionDescription="12 items"
        selectionIcons={SELECTION_ICONS.slice(0, 3)}
        onMore={() => alert("More")}
        cta={
          <Button size="sm" variant="brand" emphasis="high">
            Apply
          </Button>
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
        </div>
      </EditorPopover>
    </div>
  );
}

/* ─── Expand / collapse ─── */

function ExpandCollapseDemo() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const anchorRef = useRef<HTMLButtonElement>(null);

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
        selectionLabel="Audio Layer"
        selectionDescription="4 selections"
        selectionIcons={SELECTION_ICONS.slice(0, 4)}
        selectionIconsMax={4}
        onMore={() => {}}
        cta={
          <Button size="sm" variant="brand" emphasis="high" leadingIcon={<Icon name="favorite_fill" size={16} />}>
            Label
          </Button>
        }
      >
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" hideTooltip />
          <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" hideTooltip />
        </div>
      </EditorPopover>
    </div>
  );
}

/* ─── Main ─── */

export default function EditorPopoverPlayground() {
  return (
    <>
      <h1>EditorPopover</h1>

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
        <h2>With Selection</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toolbar with ActionBarSelection showing icon thumbnails, label, and description.
        </p>
        <div style={cardStyle}>
          <SelectionDemo />
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
        <h2>Expand / Collapse</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle the checkbox to expand or collapse the toolbar.
        </p>
        <div style={cardStyle}>
          <ExpandCollapseDemo />
        </div>
      </section>
    </>
  );
}
