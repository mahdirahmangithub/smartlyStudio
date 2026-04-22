import { useCallback, useRef, useState, type CSSProperties } from "react";
import {
  RichTextEditor,
  type RichTextEditorHandle,
  ChipNode,
  $createChipNode,
} from "../components/RichTextEditor";
import { Button } from "../components/Button";
import { $createParagraphNode, $getRoot, $getSelection, $isRangeSelection } from "lexical";

/* ── Layout helpers ── */

const page: CSSProperties = { display: "flex", flexDirection: "column", gap: 48, maxWidth: 640 };
const section: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const card: CSSProperties = {
  border: "1px solid var(--element-outline-neutral-default)",
  borderRadius: "var(--radius-2xl)",
  padding: 16,
  background: "var(--element-surface-default)",
};
const label: CSSProperties = {
  fontFamily: "var(--type-label-strong-xs-family)",
  fontSize: "var(--type-label-strong-xs-size)",
  fontWeight: "var(--type-label-strong-xs-weight)",
  color: "var(--text-neutral-secondary-default)",
  marginBottom: 4,
};
const mono: CSSProperties = {
  fontFamily: "monospace",
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
  background: "var(--element-fill-neutral-primary-default)",
  padding: "4px 8px",
  borderRadius: 4,
  minHeight: 20,
};
const row: CSSProperties = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: "var(--type-label-md-family)",
        fontSize: "var(--type-label-md-size)",
        fontWeight: "var(--type-label-md-weight)",
        color: "var(--text-neutral-primary-default)",
      }}
    >
      {children}
    </h2>
  );
}

/* ── 1. Uncontrolled ── */

function UncontrolledDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <div style={section}>
      <SectionTitle>Uncontrolled</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Type freely. Press <kbd>Enter</kbd> to submit, <kbd>Shift+Enter</kbd> for a new line.
        Undo/Redo via <kbd>Cmd+Z</kbd> / <kbd>Cmd+Shift+Z</kbd>.
      </p>
      <div style={card}>
        <RichTextEditor
          placeholder="Type something here..."
          size="lg"
          onSubmit={(v) => setSubmitted(v)}
        />
      </div>
      {submitted !== null && (
        <div>
          <div style={label}>Submitted value</div>
          <div style={mono}>{submitted || "(empty)"}</div>
        </div>
      )}
    </div>
  );
}

/* ── 2. Controlled ── */

function ControlledDemo() {
  const [value, setValue] = useState("Hello, world!");
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <div style={section}>
      <SectionTitle>Controlled value</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Value is driven externally. The buttons below override it programmatically.
      </p>
      <div style={card}>
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder="Controlled editor..."
          size="lg"
          onSubmit={setSubmitted}
        />
      </div>
      <div style={row}>
        <Button size="sm" emphasis="low" onClick={() => setValue("Hello, world!")}>
          Reset
        </Button>
        <Button size="sm" emphasis="low" onClick={() => setValue("")}>
          Clear
        </Button>
        <Button
          size="sm"
          emphasis="low"
          onClick={() => setValue("Injected from outside the editor.")}
        >
          Inject text
        </Button>
      </div>
      <div>
        <div style={label}>Current value ({value.length} chars)</div>
        <div style={mono}>{value || "(empty)"}</div>
      </div>
      {submitted !== null && (
        <div>
          <div style={label}>Submitted</div>
          <div style={mono}>{submitted || "(empty)"}</div>
        </div>
      )}
    </div>
  );
}

/* ── 3. Max height + scroll fades ── */

function ScrollFadesDemo() {
  return (
    <div style={section}>
      <SectionTitle>maxHeight + scroll fades</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        The editor grows with content up to 132 px then scrolls. Fades appear automatically at the
        top and bottom edges when there is hidden content — matching Textarea behaviour.{" "}
        <code>scrollFades</code> defaults to <code>true</code> whenever <code>maxHeight</code> is
        set.
      </p>
      <div style={card}>
        <RichTextEditor
          placeholder="Keep typing — fades appear once content overflows..."
          size="lg"
          maxHeight={132}
        />
      </div>
      <div>
        <div style={label}>scrollFades disabled (manual override)</div>
        <div style={card}>
          <RichTextEditor
            placeholder="Same maxHeight, no fades..."
            size="lg"
            maxHeight={132}
            scrollFades={false}
          />
        </div>
      </div>
    </div>
  );
}

/* ── 4. Sizes ── */

function SizesDemo() {
  return (
    <div style={section}>
      <SectionTitle>Sizes</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={label}>sm — label/sm (14 px)</div>
          <div style={card}>
            <RichTextEditor placeholder="Small size editor" size="sm" />
          </div>
        </div>
        <div>
          <div style={label}>lg — label/md (16 px)</div>
          <div style={card}>
            <RichTextEditor placeholder="Large size editor" size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 5. Focus indicator (opt-in) ── */

function FocusIndicatorDemo() {
  return (
    <div style={section}>
      <SectionTitle>Focus indicator (opt-in)</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Pass <code>focusIndicator</code> to show a brand-colour outline on focus. Off by default —
        useful when the editor sits inside a field card that already provides focus chrome.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={label}>Without focusIndicator (default)</div>
          <div style={card}>
            <RichTextEditor placeholder="No ring on focus" size="lg" />
          </div>
        </div>
        <div>
          <div style={label}>With focusIndicator</div>
          <div style={card}>
            <RichTextEditor placeholder="Brand ring appears on focus" size="lg" focusIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 6. Hover indicator ── */

function HoverIndicatorDemo() {
  return (
    <div style={section}>
      <SectionTitle>Hover indicator</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Pass <code>hoverIndicator</code> — an edit icon fades in on the right on hover. Disappears
        when focused.
      </p>
      <div style={card}>
        <RichTextEditor defaultValue="Hover over me" size="lg" hoverIndicator />
      </div>
    </div>
  );
}

/* ── 7. Disabled ── */

function DisabledDemo() {
  return (
    <div style={section}>
      <SectionTitle>Disabled</SectionTitle>
      <div style={{ ...card, opacity: 0.6 }}>
        <RichTextEditor
          defaultValue="This editor is disabled and cannot be edited."
          size="lg"
          disabled
        />
      </div>
    </div>
  );
}

/* ── 8. Multi-line (no submit on Enter) ── */

function MultilineDemo() {
  const [value, setValue] = useState("");

  return (
    <div style={section}>
      <SectionTitle>Multi-line (no submit)</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        No <code>onSubmit</code> prop — Enter inserts a newline like a normal textarea.
      </p>
      <div style={card}>
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder="Enter creates new lines here..."
          size="lg"
          maxHeight={200}
        />
      </div>
      <div>
        <div style={label}>Lines: {value.split("\n").length}</div>
        <div style={{ ...mono, whiteSpace: "pre-wrap" }}>{value || "(empty)"}</div>
      </div>
    </div>
  );
}

/* ── 9. Inline chip nodes ── */

/*
 * ChipNode must be registered in the editor's node list.
 * Define it outside the component so the reference is stable across renders
 * (LexicalComposer reads nodes only once on mount).
 */
const CHIP_NODES = [ChipNode];

function InlineChipDemo() {
  const editorRef = useRef<RichTextEditorHandle>(null);

  const insertChip = useCallback((label: string, icon?: string) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createChipNode(label, icon as Parameters<typeof $createChipNode>[1])]);
      }
    });
  }, []);

  return (
    <div style={section}>
      <SectionTitle>Inline chip nodes</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Chips render as atomic inline nodes. Click in the editor then use the buttons to insert one
        at the cursor. Use <kbd>Backspace</kbd> to remove a selected chip,{" "}
        <kbd>←</kbd> / <kbd>→</kbd> to move past it.
      </p>
      <div style={card}>
        <RichTextEditor
          ref={editorRef}
          nodes={CHIP_NODES}
          placeholder="Click here, then insert a chip below..."
          size="lg"
          maxHeight={132}
        />
      </div>
      <div style={row}>
        <Button size="sm" emphasis="low" onClick={() => insertChip("Campaign", "campaign_alt")}>
          + Campaign chip
        </Button>
        <Button size="sm" emphasis="low" onClick={() => insertChip("Summer 2026")}>
          + Label chip
        </Button>
        <Button size="sm" emphasis="low" onClick={() => insertChip("BMW", "Meta_color")}>
          + BMW chip
        </Button>
      </div>
    </div>
  );
}

/* ── 11. Imperative ref ── */

function ImperativeRefDemo() {
  const editorRef = useRef<RichTextEditorHandle>(null);

  const focus = useCallback(() => { editorRef.current?.focus(); }, []);
  const blur = useCallback(() => { editorRef.current?.blur(); }, []);
  const clear = useCallback(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
  }, []);

  return (
    <div style={section}>
      <SectionTitle>Imperative ref</SectionTitle>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Use the ref handle to focus, blur, or access the raw Lexical editor instance.
      </p>
      <div style={card}>
        <RichTextEditor
          ref={editorRef}
          placeholder="Use the buttons to control me..."
          size="lg"
        />
      </div>
      <div style={row}>
        <Button size="sm" emphasis="low" onClick={focus}>Focus</Button>
        <Button size="sm" emphasis="low" onClick={blur}>Blur</Button>
        <Button size="sm" emphasis="low" onClick={clear}>Clear</Button>
      </div>
    </div>
  );
}

/* ── Page ── */

export default function RichTextEditorPlayground() {
  return (
    <div style={page}>
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--type-label-md-family)",
          fontSize: 22,
          fontWeight: 600,
          color: "var(--text-neutral-primary-default)",
        }}
      >
        RichTextEditor
      </h1>
      <p style={{ margin: 0, color: "var(--text-neutral-secondary-default)", fontSize: 14 }}>
        Lexical-powered contenteditable editor. Drop-in replacement for{" "}
        <code>InlineTextarea</code> — same API, same visual appearance, with the ability to render
        custom nodes (mentions, chips, attachments) inside the editing surface.
      </p>

      <UncontrolledDemo />
      <ControlledDemo />
      <ScrollFadesDemo />
      <SizesDemo />
      <FocusIndicatorDemo />
      <HoverIndicatorDemo />
      <DisabledDemo />
      <MultilineDemo />
      <InlineChipDemo />
      <ImperativeRefDemo />
    </div>
  );
}
