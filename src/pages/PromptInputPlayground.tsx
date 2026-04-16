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
  type PromptInputTriggerConfig,
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

function BasicDemo() {
  const [submitted, setSubmitted] = useState<string[]>([]);

  return (
    <div style={promptWrapper}>
      <PromptInput onSubmit={(v) => setSubmitted((p) => [...p, v])}>
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
      <PromptInput disabled>
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
      <PromptInput hasAttachments={hasAttachments} error={error} onSubmit={() => {}}>
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

const AT_ITEMS: AttachmentMenuItemDef[] = [
  { kind: "context", label: "Add context", icon: "forecasting_context", keywords: ["ai", "prompt", "smart"] },
  { kind: "google-drive", label: "Add from Google Drive", icon: "Google Drive_color", keywords: ["drive", "google", "cloud"] },
];

const PER_TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/", items: SLASH_ITEMS },
  { char: "@", items: AT_ITEMS },
];

function PerTriggerDemo() {
  return (
    <div style={promptWrapper}>
      <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.6 }}>
        <kbd>/</kbd> → files &amp; links &nbsp;|&nbsp; <kbd>@</kbd> → context &amp; Drive
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
          <kbd style={{ fontSize: 12 }}>@</kbd> at the start or after whitespace to open the same
          attachment menu at the caret (type to filter).
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
          Different trigger characters open different item sets via the{" "}
          <code style={{ fontSize: 12 }}>triggerMenus</code> prop.
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
