import { useState, type CSSProperties } from "react";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputRichTextEditor,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputToolsButton,
  PromptInputSubmit,
  PromptInputInfo,
  PromptInputRecommendations,
  TriggerMenu,
  MENTION_MENU_ITEMS,
  SUGGESTED_CONTEXT_ITEMS,
  type PromptInputTriggerConfig,
  type PromptInputInfoType,
  type RecommendationItem,
  type MenuNode,
  type PromptInputContextItem,
} from "@sds/components/PromptInput";
import { ChipNode } from "@sds/components/RichTextEditor";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const promptWrapper: CSSProperties = {
  maxWidth: 520,
  width: "100%",
  margin: "100px auto",
};

/* ── Shared trigger config ──
 * Pulls the canonical category tree from the design system's `menuData`.
 * In RTE surfaces, `<TriggerMenu>`'s default `onSelect` inserts an inline
 * chip via `useInsertChip()`. In textarea surfaces, the same default adds
 * to the context row instead — no per-surface wrapper required. */

const DEFAULT_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={MENTION_MENU_ITEMS} />
    ),
  },
];

const CONTEXT_TRIGGER_MENUS = DEFAULT_TRIGGER_MENUS;

/* ── Demos ── */

function BasicDemo() {
  const [submitted, setSubmitted] = useState<string[]>([]);

  return (
    <div>
      <div style={promptWrapper}>
        <PromptInput
          triggerMenus={CONTEXT_TRIGGER_MENUS}
          onSubmit={(v) => setSubmitted((p) => [...p, v])}
        >
          <PromptInputAttachments />
          <PromptInputRichTextEditor />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
      {submitted.length > 0 && (
        <ul style={{ fontSize: 13, opacity: 0.7 }}>
          {submitted.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}

function ControlledDemo() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setValue("");
    }, 2000);
  };

  return (
    <div>
      <div style={promptWrapper}>
        <PromptInput
          triggerMenus={DEFAULT_TRIGGER_MENUS}
          value={value}
          onChange={setValue}
          loading={loading}
          onSubmit={handleSubmit}
          onStop={() => setLoading(false)}
        >
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Ask anything..." />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <p style={{ fontSize: 12, opacity: 0.5 }}>
        Characters: {value.length} · {loading ? "Loading..." : "Ready"}
      </p>
    </div>
  );
}

function DisabledDemo() {
  return (
    <div style={promptWrapper}>
      <PromptInput triggerMenus={DEFAULT_TRIGGER_MENUS} disabled>
        <PromptInputAttachments />
        <PromptInputRichTextEditor placeholder="Disabled state..." />
        <PromptInputFooter>
          <PromptInputFooterStart>
            <PromptInputAddMenu />
            <PromptInputToolsButton />
          </PromptInputFooterStart>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}


const SLASH_ITEMS: MenuNode[] = [
  { id: "photos-files", kind: "photos-files", label: "Add photos & files", icon: "attach_file", keywords: ["upload", "file", "image", "photo"] },
  { id: "link", kind: "link", label: "Add link", icon: "link", keywords: ["url", "href"] },
];

const PER_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/", items: SLASH_ITEMS },
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={MENTION_MENU_ITEMS} />
    ),
  },
];

function PerTriggerDemo() {
  return (
    <div>
      <p style={{ fontSize: 12, margin: 0, opacity: 0.6 }}>
        <kbd>/</kbd> → files &amp; links &nbsp;|&nbsp; <kbd>@</kbd> → context picker
      </p>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={PER_TRIGGER_MENUS} onSubmit={() => {}}>
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Type / for files or @ for context…" />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function ContextRowVisibleDemo() {
  return (
    <div>
      <p style={{ fontSize: 12, margin: 0, opacity: 0.6 }}>
        <code>showContextRow=true</code> — row always visible. Type <kbd>@</kbd> to add context.
      </p>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={CONTEXT_TRIGGER_MENUS} showContextRow onSubmit={() => {}}>
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Type @ to add context…" />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function ContextRowHiddenDemo() {
  return (
    <div>
      <p style={{ fontSize: 12, margin: 0, opacity: 0.6 }}>
        No <code>showContextRow</code> — row hidden until a context item is added via <kbd>@</kbd>.
      </p>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={CONTEXT_TRIGGER_MENUS} onSubmit={() => {}}>
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Type @ to add context…" />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

const PRELOADED_CONTEXT: PromptInputContextItem[] = [
  { id: "pre-1", icon: "Meta_color", label: "Summer 2026 - Run BMW" },
  { id: "pre-2", icon: "campaign_alt", label: "Campaign_1209" },
  { id: "pre-3", icon: "folder", label: "Alpha Project" },
];

function ContextRowProgrammaticDemo() {
  const [items, setItems] = useState<PromptInputContextItem[]>(PRELOADED_CONTEXT);

  return (
    <div>
      <p style={{ fontSize: 12, margin: 0, opacity: 0.6 }}>
        Controlled — pre-loaded context items passed from outside. Removable. <kbd>@</kbd> adds more.
      </p>
      <div style={promptWrapper}>
        <PromptInput
          triggerMenus={CONTEXT_TRIGGER_MENUS}
          showContextRow
          contextItems={items}
          onContextItemsChange={setItems}
          onSubmit={() => {}}
        >
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Context pre-loaded from outside…" />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <p style={{ fontSize: 12, opacity: 0.5 }}>
        Active: {items.map((i) => i.label).join(", ") || "none"}
      </p>
    </div>
  );
}

const RECOMMENDATIONS: RecommendationItem[] = [
  { id: "r1", label: "Generate a campaign", onSelect: () => {} },
  { id: "r2", label: "Summarise performance", onSelect: () => {} },
  { id: "r3", label: "Suggest optimisations", onSelect: () => {} },
  { id: "r4", label: "Write ad copy", onSelect: () => {} },
  { id: "r5", label: "Analyse audience", onSelect: () => {} },
  { id: "r6", label: "Forecast results", onSelect: () => {} },
];

function RecommendationsDemo() {
  const [showTitle, setShowTitle] = useState(true);

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} />
        Show title
      </label>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={DEFAULT_TRIGGER_MENUS} onSubmit={() => {}}>
          <PromptInputRecommendations
            items={RECOMMENDATIONS}
            title={showTitle ? "Recommendations" : undefined}
          />
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Generate smartly..." />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

const INFO_TYPES: PromptInputInfoType[] = ["edit", "error", "warning", "length-limit", "cook-book"];
const INFO_DEFAULTS: Record<PromptInputInfoType, { title?: string }> = {
  edit: { title: "Editing message" },
  error: { title: "Something went wrong" },
  warning: { title: "Approaching limit" },
  "length-limit": {},
  "cook-book": { title: "Use a template" },
};

function InfoBannerDemo() {
  const [visible, setVisible] = useState(true);
  const [type, setType] = useState<PromptInputInfoType>("error");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Show banner
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ opacity: 0.6 }}>Type:</span>
          {INFO_TYPES.map((t) => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
              <input
                type="radio"
                name="rte-info-type"
                value={t}
                checked={type === t}
                onChange={() => { setType(t); setVisible(true); }}
              />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={DEFAULT_TRIGGER_MENUS} onSubmit={() => {}}>
          {visible && (
            <PromptInputInfo
              type={type}
              title={INFO_DEFAULTS[type].title}
              onClose={() => setVisible(false)}
              onAction={() => setVisible(false)}
            />
          )}
          <PromptInputAttachments />
          <PromptInputRichTextEditor placeholder="Generate smartly..." />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

/* ── Inline chips demo — unique to RichTextEditor ──
 * No wrapper needed: in an RTE-surfaced `<PromptInput>`, the default
 * `<TriggerMenu>` `onSelect` calls `useInsertChip()` — replacing the
 * trigger char + typed query with a `ChipNode` at the caret. */

const CHIP_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={SUGGESTED_CONTEXT_ITEMS} />
    ),
  },
];

const CHIP_NODES = [ChipNode];

function InlineChipsDemo() {
  return (
    <div>
      <p style={{ fontSize: 12, margin: 0, opacity: 0.6 }}>
        Type <kbd>@</kbd> and select an item — it is inserted as an inline chip directly inside the
        editor. Backspace removes the whole chip atomically.
      </p>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={CHIP_TRIGGER_MENUS} onSubmit={() => {}}>
          <PromptInputAttachments />
          <PromptInputRichTextEditor
            placeholder="Type @ to insert a chip inline…"
            nodes={CHIP_NODES}
          />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu onSelect={() => {}} />
              <PromptInputToolsButton onClick={() => {}} />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
      <p style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>
        This demo is exclusive to <code>PromptInputRichTextEditor</code> — plain textarea cannot
        render inline nodes.
      </p>
    </div>
  );
}

/* ── Page ── */

const ANIMATED_PLACEHOLDERS = [
  "Analyze my Q3 performance report",
  "Draft a follow-up email for today's meeting",
  "Summarize the attached document",
  "Create a campaign brief for the new product launch",
  "What's the best audience for this campaign?",
];

function AnimatedPlaceholderRteDemo() {
  const [showAnim, setShowAnim] = useState(true);

  return (
    <div>
      <div style={promptWrapper}>
        <PromptInput onSubmit={() => setShowAnim(false)}>
          <PromptInputRichTextEditor
            placeholder="Ask anything..."
            animatedPlaceholders={ANIMATED_PLACEHOLDERS}
            showAnimatedPlaceholder={showAnim}
          />
          <PromptInputFooter>
            <PromptInputFooterStart>
              <PromptInputAddMenu />
            </PromptInputFooterStart>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </div>
      {!showAnim && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowAnim(true)}
            style={{ fontSize: 13, cursor: "pointer" }}
          >
            Reset animation
          </button>
        </div>
      )}
    </div>
  );
}

export default function PromptInputRichTextEditorPlayground() {
  return (
    <>
      <h1>PromptInput — Rich Text Editor</h1>
      <p style={{ fontSize: 13, opacity: 0.7, marginTop: 0 }}>
        Same examples as the textarea-based PromptInput, but using{" "}
        <code>PromptInputRichTextEditor</code> (Lexical contenteditable) as the input surface.
        All trigger menus, keyboard nav, and context features work identically.
        The last section shows the unique inline-chip capability.
      </p>

      <section style={sectionStyle}>
        <h2>Basic (Uncontrolled)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Type and press Enter or click send. Use <kbd>/</kbd> or <kbd>@</kbd> to open trigger menus.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Controlled with Loading</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Simulates a 2-second AI generation. Stop button during loading, clears on completion.
        </p>
        <div style={cardStyle}>
          <ControlledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled</h2>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Per-trigger menus</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          <kbd>/</kbd> → files &amp; links &nbsp;|&nbsp; <kbd>@</kbd> → context picker.
        </p>
        <div style={cardStyle}>
          <PerTriggerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Context row — always visible</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          <code>showContextRow=true</code>. Type <kbd>@</kbd> to add context chips above the input.
        </p>
        <div style={cardStyle}>
          <ContextRowVisibleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Context row — appears on demand</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Row hidden until first context item is added via <kbd>@</kbd>.
        </p>
        <div style={cardStyle}>
          <ContextRowHiddenDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Context row — programmatic / controlled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Controlled via <code>contextItems</code> + <code>onContextItemsChange</code>. Pre-loaded
          and removable. <kbd>@</kbd> adds more.
        </p>
        <div style={cardStyle}>
          <ContextRowProgrammaticDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Recommendations</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Horizontally scrollable suggestion row above the input.
        </p>
        <div style={cardStyle}>
          <RecommendationsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Info banner</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All five info banner variants. Toggle visibility and type.
        </p>
        <div style={cardStyle}>
          <InfoBannerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Inline chips (RichTextEditor only)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Selecting an <kbd>@</kbd> item inserts a rendered chip node directly inside the
          contenteditable. Arrow keys and Backspace treat it as a single character.
        </p>
        <div style={cardStyle}>
          <InlineChipsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Animated placeholder</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Same soft-blur-in animation as the textarea variant, but driven by Lexical focus events.
          Focus snaps the animation away and shows the static placeholder. Submit hides it.
        </p>
        <div style={cardStyle}>
          <AnimatedPlaceholderRteDemo />
        </div>
      </section>
    </>
  );
}
