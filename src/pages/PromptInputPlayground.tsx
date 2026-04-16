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
  PromptInputContextMenu,
  type PromptInputTriggerConfig,
  type ContextMenuSuggestedItem,
  type ContextMenuCategory,
} from "../components/PromptInput";
import type { AttachmentMenuItemDef } from "../components/PromptInput/PromptInputAttachmentMenu";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const promptWrapper: CSSProperties = { maxWidth: 520 };

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

const CATEGORIES: ContextMenuCategory[] = [
  { id: "campaigns", icon: "campaign_alt", label: "Campaigns", onSelect: () => {} },
  { id: "catalogs", icon: "shopping_cart", label: "Catalogs", onSelect: () => {} },
  { id: "producers", icon: "data_table", label: "Producers", onSelect: () => {} },
  { id: "projects", icon: "folder", label: "Projects", onSelect: () => {} },
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
        onSelectSuggested={(_item) => props.onClose()}
        categories={CATEGORIES}
      />
    ),
  },
];

/* ── Demos ── */

function BasicDemo() {
  const [submitted, setSubmitted] = useState<string[]>([]);

  return (
    <div style={promptWrapper}>
      <PromptInput
        triggerMenus={DEFAULT_TRIGGER_MENUS}
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

      {submitted.length > 0 && (
        <ul style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
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
        <PromptInputTextarea placeholder="Ask anything..." />
        <PromptInputFooter>
          <PromptInputFooterStart>
            <PromptInputAddMenu onSelect={() => {}} />
            <PromptInputToolsButton onClick={() => {}} />
          </PromptInputFooterStart>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>

      <p style={{ marginTop: 8, fontSize: 12, opacity: 0.5 }}>
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
    <div style={promptWrapper}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={hasAttachments}
          onChange={(e) => setHasAttachments(e.target.checked)}
        />
        Simulate attachment (submit enabled with empty text)
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13 }}>
        <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
        Error (submit stays brand / low / disabled)
      </label>
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
        onSelectSuggested={(_item) => props.onClose()}
        categories={CATEGORIES}
      />
    ),
  },
];

function PerTriggerDemo() {
  return (
    <div style={promptWrapper}>
      <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.6 }}>
        <kbd>/</kbd> → files &amp; links &nbsp;|&nbsp; <kbd>@</kbd> → context picker
      </p>
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
