import { useRef, useState } from "react";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
  PromptInputContextMenu,
  usePromptInput,
  type PromptInputTriggerConfig,
  type PromptInputContextItem,
  type ContextMenuSuggestedItem,
  type ContextMenuCategory,
} from "../components/PromptInput";
import type { PromptAttachedFile } from "../components/PromptInput/promptInputTypes";
import { isImageFile } from "../utils/inferFileType";
import {
  UserBubble,
  type UserBubbleAttachment,
  type UserBubbleContextItem,
} from "../components/UserBubble";
import { Toggle } from "../components/Toggle";
import { Label } from "../components/Label";

/* ── Context menu data ── */

const SUGGESTED_ITEMS: ContextMenuSuggestedItem[] = [
  { id: "ws-1",   icon: "Meta_color",    label: "Summer 2026 - Run BMW",  subtitle: "Workspace" },
  { id: "camp-1", icon: "campaign_alt",  label: "Campaign_1209",          subtitle: "in Summer 2026 - Run BMW" },
  { id: "camp-2", icon: "campaign_alt",  label: "Campaign_freq",          subtitle: "in Summer 2026 - Run BMW" },
];

const CATEGORIES_BASE = [
  {
    id: "campaigns", icon: "campaign_alt" as const, label: "Campaigns",
    drillItems: [
      { id: "c-1", icon: "campaign_alt" as const, label: "Summer 2026 - Run BMW" },
      { id: "c-2", icon: "campaign_alt" as const, label: "Campaign_1209" },
      { id: "c-3", icon: "campaign_alt" as const, label: "Campaign_freq" },
      { id: "c-4", icon: "campaign_alt" as const, label: "Q4 Retargeting" },
    ],
  },
  { id: "catalogs", icon: "shopping_cart" as const, label: "Catalogs", drillItems: null },
  {
    id: "projects", icon: "folder" as const, label: "Projects",
    drillItems: [
      { id: "p-1", icon: "folder" as const, label: "Alpha Project" },
      { id: "p-2", icon: "folder" as const, label: "Beta Launch" },
      { id: "p-3", icon: "folder" as const, label: "Internal Tools" },
    ],
  },
];

/* ── Inner component: wires @ menu to addContextItem ── */

function ContextMenuWithAdd(props: {
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
    props.onAccept();
  };

  const handleSelectSuggested = (item: ContextMenuSuggestedItem) =>
    add(item.id, item.icon as PromptInputContextItem["icon"], item.label);

  const categories: ContextMenuCategory[] = CATEGORIES_BASE.map((cat) => ({
    id: cat.id,
    icon: cat.icon as ContextMenuCategory["icon"],
    label: cat.label,
    onSelect: () => add(cat.id, cat.icon as PromptInputContextItem["icon"], cat.label),
    drillLevel: cat.drillItems
      ? {
          items: cat.drillItems.map((item) => ({
            id: item.id,
            icon: item.icon as PromptInputContextItem["icon"],
            label: item.label,
            onSelect: () => add(item.id, item.icon as PromptInputContextItem["icon"], item.label),
          })),
        }
      : undefined,
  }));

  return (
    <PromptInputContextMenu
      query={props.query}
      activeIndex={props.activeIndex}
      setItemCount={props.setItemCount}
      registerPickHandler={props.registerPickHandler}
      menuId={props.menuId}
      suggestedItems={SUGGESTED_ITEMS}
      onSelectSuggested={handleSelectSuggested}
      categories={categories}
    />
  );
}

const TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  { char: "@", renderContent: (props) => <ContextMenuWithAdd {...props} /> },
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
