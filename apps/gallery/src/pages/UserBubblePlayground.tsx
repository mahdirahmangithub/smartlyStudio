import { useRef, useState } from "react";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
  TriggerMenu,
  MENTION_MENU_ITEMS,
  usePromptInput,
  type PromptInputTriggerConfig,
  type PromptInputContextItem,
} from "@sds/components/PromptInput";
import type { PromptAttachedFile } from "@sds/components/PromptInput/promptInputTypes";
import { isImageFile } from "@sds/utils/inferFileType";
import {
  UserBubble,
  type UserBubbleAttachment,
  type UserBubbleContextItem,
} from "@sds/components/UserBubble";
import { Toggle } from "@sds/components/Toggle";
import { Label } from "@sds/components/Label";

/* ── Trigger config ──
 * Default `<TriggerMenu>` `onSelect` adds the picked leaf to the prompt's
 * context row when mounted on a textarea surface — no wrapper needed. */

const TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={MENTION_MENU_ITEMS} />
    ),
  },
];

/* ── Inner component: captures current attachedFiles + contextItems on each render ── */

interface CaptureData {
  files: PromptAttachedFile[];
  ctx: PromptInputContextItem[];
}

function Capture({ dataRef }: { dataRef: React.MutableRefObject<CaptureData> }) {
  const { attachedFiles, contextItems } = usePromptInput();
  dataRef.current = { files: attachedFiles, ctx: contextItems };
  return null;
}

/* ── Bubble entry stored in state ── */

interface BubbleEntry {
  id: string;
  message: string;
  attachments: UserBubbleAttachment[];
  contextItems: UserBubbleContextItem[];
}

/* ── Playground ── */

// sidebar width from App.css — used to keep the fixed dock in the content column
const SIDEBAR_W = 180;

export default function UserBubblePlayground() {
  const [bubbles, setBubbles] = useState<BubbleEntry[]>([]);
  const [showReply, setShowReply] = useState(false);
  const captureRef = useRef<CaptureData>({ files: [], ctx: [] });

  const handleSubmit = (message: string) => {
    const { files, ctx } = captureRef.current;
    if (!message.trim() && files.length === 0) return;

    const attachments: UserBubbleAttachment[] = files.map((f) => ({
      id: f.id,
      file: f.file,
      // Create a fresh URL owned by the bubble — independent of PromptInput's
      // lifecycle so clearOnSubmit's revokeObjectURL doesn't break the thumbnail.
      previewUrl: isImageFile(f.file) ? URL.createObjectURL(f.file) : undefined,
      fileName: f.file.name,
      title: f.file.name,
    }));

    const contextItems: UserBubbleContextItem[] = ctx.map((c) => ({
      id: c.id,
      icon: c.icon,
      label: c.label,
    }));

    setBubbles((prev) => [
      ...prev,
      { id: `${Date.now()}`, message, attachments, contextItems },
    ]);

    // Scroll to bottom after the new bubble renders
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
  };

  return (
    <>
      {/* ── Controls bar ── */}
      <div style={styles.controls}>
        <div style={styles.controlRow}>
          <Toggle
            checked={showReply}
            onChange={setShowReply}
            id="toggle-reply"
            size="sm"
          />
          <Label htmlFor="toggle-reply" size="sm" label="Show reply label on bubbles" />
        </div>
      </div>

      {/* ── Thread ── */}
      <div style={styles.thread}>
        {bubbles.length === 0 ? (
          <p style={styles.emptyHint}>
            Type a message below and press send — your bubble will appear here.
            <br />
            Use <kbd style={styles.kbd}>@</kbd> to add context chips, or attach files with the{" "}
            <kbd style={styles.kbd}>+</kbd> button.
          </p>
        ) : (
          <div style={styles.threadInner}>
            {bubbles.map((b) => (
              <UserBubble
                key={b.id}
                message={b.message}
                attachments={b.attachments.length ? b.attachments : undefined}
                contextItems={b.contextItems.length ? b.contextItems : undefined}
                replyLabel={showReply ? "Replied message" : undefined}
                onEdit={() => alert("Edit clicked")}
                onCopy={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Fixed PromptInput dock ── */}
      <div style={{ ...styles.dock, left: SIDEBAR_W }}>
        <div style={styles.dockInner}>
          <PromptInput
            triggerMenus={TRIGGER_MENUS}
            showContextRow
            onSubmit={handleSubmit}
          >
            <Capture dataRef={captureRef} />
            <PromptInputAttachments />
            <PromptInputTextarea placeholder="Type a message… use @ for context" />
            <PromptInputFooter>
              <PromptInputFooterStart>
                <PromptInputAddMenu onSelect={() => {}} />
              </PromptInputFooterStart>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
}

/* ── Inline styles ── */

const styles = {
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 0 16px",
    borderBottom: "1px solid var(--element-outline-neutral-default)",
    marginBottom: 32,
  },
  controlRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  thread: {
    // Extra bottom padding so content isn't hidden behind the fixed dock
    paddingBottom: 220,
  },
  threadInner: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 24,
    maxWidth: 600,
    marginLeft: "auto",
  },
  emptyHint: {
    textAlign: "center" as const,
    color: "var(--text-neutral-tertiary)",
    fontFamily: "var(--type-body-lg-family)",
    fontSize: "var(--type-body-lg-size)",
    lineHeight: "var(--type-body-lg-line-height)",
    maxWidth: 400,
    margin: "80px auto 0",
  },
  kbd: {
    display: "inline-block",
    padding: "1px 5px",
    borderRadius: 4,
    background: "var(--element-fill-neutral-secondary-weak)",
    fontFamily: "monospace",
    fontSize: 13,
  },
  dock: {
    position: "fixed" as const,
    bottom: 0,
    right: 0,
    background: "var(--element-surface-default)",
    borderTop: "1px solid var(--element-outline-neutral-default)",
    padding: "16px 24px 24px",
    zIndex: 50,
  },
  dockInner: {
    maxWidth: 600,
    margin: "0 auto",
  },
} as const;
