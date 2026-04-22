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
  PromptInputContextMenu,
  usePromptInput,
  type PromptInputTriggerConfig,
  type PromptInputInfoType,
  type RecommendationItem,
  type ContextMenuSuggestedItem,
  type ContextMenuCategory,
  type ContextMenuDrillLevel,
  type PromptInputContextItem,
} from "../components/PromptInput";
import type { AttachmentMenuItemDef } from "../components/PromptInput/PromptInputAttachmentMenu";

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

/* ── Shared context menu data ── */

const SUGGESTED_ITEMS: ContextMenuSuggestedItem[] = [
  {
    id: "ws-1",
    icon: "Meta_color",
    label: "Summer 2026 - Run BMW",
    subtitle: "Workspace",
  },
  {
    id: "camp-1",
    icon: "campaign_alt",
    label: "Campaign_1209",
    subtitle: "in Summer 2026 - Run BMW",
  },
  {
    id: "camp-2",
    icon: "campaign_alt",
    label: "Campaign_freq",
    subtitle: "in Summer 2026 - Run BMW",
  },
];

const CAMPAIGN_DRILL: ContextMenuDrillLevel = {
  items: [
    { id: "c-1", icon: "campaign_alt", label: "Summer 2026 - Run BMW", onSelect: () => {} },
    { id: "c-2", icon: "campaign_alt", label: "Campaign_1209", onSelect: () => {} },
    { id: "c-3", icon: "campaign_alt", label: "Campaign_freq", onSelect: () => {} },
    { id: "c-4", icon: "campaign_alt", label: "Q4 Retargeting", onSelect: () => {} },
  ],
};

const PROJECT_DRILL: ContextMenuDrillLevel = {
  items: [
    { id: "p-1", icon: "folder", label: "Alpha Project", onSelect: () => {} },
    { id: "p-2", icon: "folder", label: "Beta Launch", onSelect: () => {} },
    { id: "p-3", icon: "folder", label: "Internal Tools", onSelect: () => {} },
  ],
};

const CATEGORIES: ContextMenuCategory[] = [
  { id: "campaigns", icon: "campaign_alt", label: "Campaigns", onSelect: () => {}, drillLevel: CAMPAIGN_DRILL },
  { id: "catalogs", icon: "shopping_cart", label: "Catalogs", onSelect: () => {} },
  { id: "producers", icon: "data_table", label: "Producers", onSelect: () => {} },
  { id: "projects", icon: "folder", label: "Projects", onSelect: () => {}, drillLevel: PROJECT_DRILL },
  { id: "reports-bar", icon: "reporting", label: "Reports", onSelect: () => {} },
  { id: "reports-org", icon: "page_info", label: "Reports", onSelect: () => {} },
  { id: "reports-lab", icon: "science", label: "Reports", onSelect: () => {} },
];

const DEFAULT_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => (
      <PromptInputContextMenu
        {...props}
        suggestedItems={SUGGESTED_ITEMS}
        onSelectSuggested={(_item) => props.onAccept()}
        categories={CATEGORIES}
      />
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

const SLASH_ITEMS: AttachmentMenuItemDef[] = [
  { kind: "photos-files", label: "Add photos & files", icon: "attach_file", keywords: ["upload", "file", "image", "photo"] },
  { kind: "link", label: "Add link", icon: "link", keywords: ["url", "href"] },
];

const PER_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/", items: SLASH_ITEMS },
  {
    char: "@",
    renderContent: (props) => (
      <PromptInputContextMenu
        {...props}
        suggestedItems={SUGGESTED_ITEMS}
        onSelectSuggested={(_item) => props.onAccept()}
        categories={CATEGORIES}
      />
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

/* ── Context row demos ── */

/**
 * Inner component that wires the @ context menu to addContextItem.
 * Must live inside <PromptInput> to access usePromptInput().
 */
function ContextMenuWithAdd({
  query,
  onClose: _onClose,
  onAccept,
  activeIndex,
  setItemCount,
  registerPickHandler,
  menuId,
}: {
  query: string;
  onClose: () => void;
  onAccept: () => void;
  activeIndex: number;
  setItemCount: (n: number) => void;
  registerPickHandler: (fn: () => void) => void;
  menuId: string;
}) {
  const { addContextItem } = usePromptInput();

  const add = (id: string, icon: PromptInputContextItem["icon"], label: string) => {
    addContextItem({ id, icon, label });
    onAccept();
  };

  const categories: ContextMenuCategory[] = CATEGORIES.map((cat) => ({
    ...cat,
    onSelect: () => add(cat.id, cat.icon as PromptInputContextItem["icon"], cat.label),
    drillLevel: cat.drillLevel
      ? {
          items: cat.drillLevel.items.map((item) => ({
            ...item,
            onSelect: () => add(item.id, item.icon as PromptInputContextItem["icon"], item.label),
          })),
        }
      : undefined,
  }));

  return (
    <PromptInputContextMenu
      query={query}
      activeIndex={activeIndex}
      setItemCount={setItemCount}
      registerPickHandler={registerPickHandler}
      menuId={menuId}
      suggestedItems={SUGGESTED_ITEMS}
      onSelectSuggested={(item) => add(item.id, item.icon as PromptInputContextItem["icon"], item.label)}
      categories={categories}
    />
  );
}

const CONTEXT_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => <ContextMenuWithAdd {...props} />,
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
    </>
  );
}
