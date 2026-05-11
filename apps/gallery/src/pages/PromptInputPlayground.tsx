import { useState, type CSSProperties } from "react";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputToolsButton,
  PromptInputSubmit,
  PromptInputInfo,
  PromptInputRecommendations,
  TriggerMenu,
  MENTION_MENU_ITEMS,
  type PromptInputTriggerConfig,
  type PromptInputInfoType,
  type RecommendationItem,
  type MenuNode,
  type PromptInputContextItem,
} from "@sds/components/PromptInput";

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
 * Pulls the canonical category tree from the design system's `menuData` —
 * the same source of truth used across playgrounds and prototypes. */

const DEFAULT_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={MENTION_MENU_ITEMS} />
    ),
  },
];

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
          <PromptInputTextarea />
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
          {submitted.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
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
          clearOnSubmit={false}
          onSubmit={handleSubmit}
          onStop={() => setLoading(false)}
        >
          <PromptInputAttachments />
          <PromptInputTextarea placeholder="Ask anything..." />
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
        <PromptInputTextarea placeholder="Disabled state..." />
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


function AttachmentsAndErrorDemo() {
  const [hasAttachments, setHasAttachments] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={hasAttachments}
          onChange={(e) => setHasAttachments(e.target.checked)}
        />
        Simulate attachment (submit enabled with empty text)
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
        Error (submit stays brand / low / disabled)
      </label>
      <div style={promptWrapper}>
        <PromptInput
          triggerMenus={DEFAULT_TRIGGER_MENUS}
          hasAttachments={hasAttachments}
          error={error}
          onSubmit={() => {}}
        >
          <PromptInputAttachments />
          <PromptInputTextarea placeholder="Try empty text + attachment…" />
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
          <PromptInputTextarea placeholder="Type / for files or @ for context…" />
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

/* ── Context row demos ──
 * No special wrapper needed: when `<TriggerMenu>` is mounted inside a
 * textarea-surfaced `<PromptInput>`, its default `onSelect` adds the picked
 * leaf to the prompt's external context row (then accepts). RTE surfaces
 * insert an inline chip instead. */

const CONTEXT_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={MENTION_MENU_ITEMS} />
    ),
  },
];

function ContextRowVisibleDemo() {
  return (
    <div>
      <p style={{ fontSize: 12, margin: 0, opacity: 0.6 }}>
        <code>showContextRow=true</code> — row always visible. Type <kbd>@</kbd> to add context.
        Icon-only chip when items exist.
      </p>
      <div style={promptWrapper}>
        <PromptInput triggerMenus={CONTEXT_TRIGGER_MENUS} showContextRow onSubmit={() => {}}>
          <PromptInputAttachments />
          <PromptInputTextarea placeholder="Type @ to add context…" />
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
          <PromptInputTextarea placeholder="Type @ to add context…" />
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
          <PromptInputTextarea placeholder="Context pre-loaded from outside…" />
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
        Active context items: {items.map((i) => i.label).join(", ") || "none"}
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
  { id: "r7", label: "Export report", onSelect: () => {} },
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
          <PromptInputTextarea placeholder="Generate smartly..." />
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
                name="info-type"
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
          <PromptInputTextarea placeholder="Generate smartly..." />
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

const ANIMATED_PLACEHOLDERS = [
  "Analyze my Q3 performance report",
  "Draft a follow-up email for today's meeting",
  "Summarize the attached document",
  "Create a campaign brief for the new product launch",
  "What's the best audience for this campaign?",
];

function AnimatedPlaceholderDemo() {
  const [showAnim, setShowAnim] = useState(true);

  return (
    <div>
      <div style={promptWrapper}>
        <PromptInput onSubmit={() => setShowAnim(false)}>
          <PromptInputTextarea
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

export default function PromptInputPlayground() {
  return (
    <>
      <h1>Prompt Input</h1>

      <section style={sectionStyle}>
        <h2>Basic (Uncontrolled)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Type a message and press Enter or click the send button. Submitted
          prompts appear below. Use <kbd style={{ fontSize: 12 }}>/</kbd> or{" "}
          <kbd style={{ fontSize: 12 }}>@</kbd> at the start or after whitespace to open the
          respective menus at the caret (type to filter).
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Controlled with Loading</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Simulates a 2-second AI generation. Shows stop button during loading
          and clears the input on completion.
        </p>
        <div style={cardStyle}>
          <ControlledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All interaction is disabled.
        </p>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Per-trigger menus</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          <kbd style={{ fontSize: 12 }}>/</kbd> uses a custom{" "}
          <code style={{ fontSize: 12 }}>items</code> list;{" "}
          <kbd style={{ fontSize: 12 }}>@</kbd> uses{" "}
          <code style={{ fontSize: 12 }}>renderContent</code> for the context picker.
        </p>
        <div style={cardStyle}>
          <PerTriggerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Context row — always visible</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          <code>showContextRow</code> keeps the row visible even when empty — shows a full "Add
          context" chip. Once items are added via <kbd>@</kbd>, the chip collapses to icon-only
          (tooltip on hover). Items are removable.
        </p>
        <div style={cardStyle}>
          <ContextRowVisibleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Context row — appears on demand</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Without <code>showContextRow</code>, the row is hidden until the first context item is
          added. Type <kbd>@</kbd> and select an item.
        </p>
        <div style={cardStyle}>
          <ContextRowHiddenDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Context row — programmatic / controlled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Context items passed from outside (e.g. page context, selection). Controlled via{" "}
          <code>contextItems</code> + <code>onContextItemsChange</code>. Still supports{" "}
          <kbd>@</kbd> to add more.
        </p>
        <div style={cardStyle}>
          <ContextRowProgrammaticDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Recommendations</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Horizontally scrollable row of suggestion buttons above the input. Optional title with icon.
          Overflow scrolls with a 24px fade.
        </p>
        <div style={cardStyle}>
          <RecommendationsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Info banner</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle visibility and switch between all five <code>type</code> variants. The X / Cancel / Learn more
          buttons dismiss the banner. Closing the banner removes the stacked layout entirely.
        </p>
        <div style={cardStyle}>
          <InfoBannerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Attachments and error</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Submit uses brand / high when there is text or{" "}
          <code style={{ fontSize: 12 }}>hasAttachments</code>; brand / low / disabled when empty
          or when <code style={{ fontSize: 12 }}>error</code> is set.
        </p>
        <div style={cardStyle}>
          <AttachmentsAndErrorDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Animated placeholder</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Pass <code>animatedPlaceholders</code> and <code>showAnimatedPlaceholder</code> to cycle
          through prompt suggestions with a soft-blur-in animation. Focus snaps it away and restores
          the static placeholder. Submit hides the animation — reset to bring it back.
        </p>
        <div style={cardStyle}>
          <AnimatedPlaceholderDemo />
        </div>
      </section>
    </>
  );
}
