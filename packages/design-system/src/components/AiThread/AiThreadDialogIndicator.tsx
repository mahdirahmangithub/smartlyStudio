import { Tooltip } from "../Tooltip";
import { ScrollFade } from "../ScrollFade";
import styles from "./AiThreadDialogIndicator.module.css";
import { cx } from "../../utils/cx";

export interface AiThreadDialogIndicatorItem {
  /** Must match the `id` of the corresponding `AiThreadMessage`. */
  id: string;
  role: "user" | "assistant";
  /**
   * Plain-text preview shown in the hover tooltip and as the button's
   * accessible label. Strip HTML tags before passing. Typically the first
   * ~120 chars of the message text.
   *
   * When omitted the label falls back to "User message" / "AI response".
   */
  preview?: string;
  /** When true, the bar renders in brand-purple. Managed by the consumer. */
  bookmarked?: boolean;
}

export interface AiThreadDialogIndicatorProps {
  /** One entry per message, in conversation order. */
  items: AiThreadDialogIndicatorItem[];
  /**
   * Id of the message currently nearest the top of the thread viewport.
   * Use `useAiThreadActiveMessage` to derive this automatically.
   */
  activeId?: string | null;
  /**
   * Called when the user clicks or keyboard-activates an indicator.
   * Wire to `threadRef.current.scrollToMessage(id, "smooth")`.
   */
  onNavigate: (id: string) => void;
  /**
   * Maximum height of the indicator column before it scrolls.
   * Defaults to `"100%"` — fills its parent container.
   * `ScrollFade` with `direction="vertical"` handles overflow.
   */
  maxHeight?: number | string;
  className?: string;
  /**
   * Callback for toggling a message's bookmarked state. The consumer owns
   * bookmark state and re-renders the item with the updated `bookmarked` flag.
   */
  onBookmark?: (id: string, bookmarked: boolean) => void;
}

/**
 * Conversation minimap sidebar for `<AiThread>`. Renders a narrow column of
 * horizontal bars — one per message — outside the thread. Click a bar to
 * scroll to that message.
 *
 * **Not** rendered by `<AiThread>` itself — place it as a sibling in your
 * layout:
 *
 * ```tsx
 * const threadRef = useRef<AiThreadHandle>(null);
 * const activeId = useAiThreadActiveMessage(threadRef, messages);
 *
 * <div style={{ display: "flex" }}>
 *   <AiThread ref={threadRef} messages={messages} style={{ flex: 1 }} />
 *   <AiThreadDialogIndicator
 *     items={messages.map((m) => ({
 *       id: m.id,
 *       role: m.role,
 *       preview: stripHtml(m.role === "user" ? m.message : m.text ?? ""),
 *     }))}
 *     activeId={activeId}
 *     onNavigate={(id) => threadRef.current?.scrollToMessage(id, "smooth")}
 *   />
 * </div>
 * ```
 */
export function AiThreadDialogIndicator({
  items,
  activeId,
  onNavigate,
  maxHeight = "100%",
  className,
  onBookmark,
}: AiThreadDialogIndicatorProps) {
  return (
    <nav
      aria-label="Conversation navigation"
      className={cx(styles.root, className)}
    >
      <div className={styles.scrollWrapper}>
      <ScrollFade
        direction="vertical"
        surface="auto"
        scrollAreaStyle={{ maxHeight }}
      >
        <ol className={styles.list} role="list">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const roleLabel = item.role === "user" ? "User message" : "AI response";
            const ariaLabel = item.preview
              ? `${roleLabel}: ${item.preview.slice(0, 120)}`
              : roleLabel;

            const button = (
              <button
                key={item.id}
                className={styles.item}
                data-role={item.role}
                data-active={isActive ? "true" : undefined}
                data-bookmarked={item.bookmarked ? "true" : undefined}
                onClick={() => onNavigate(item.id)}
                aria-label={ariaLabel}
                aria-current={isActive ? "step" : undefined}
                onContextMenu={
                  onBookmark
                    ? (e) => {
                        e.preventDefault();
                        onBookmark(item.id, !item.bookmarked);
                      }
                    : undefined
                }
              >
                <div className={styles.bar} aria-hidden="true" />
              </button>
            );

            if (!item.preview) {
              return <li key={item.id}>{button}</li>;
            }

            return (
              <li key={item.id}>
                <Tooltip
                  content={
                    <div style={{
                      maxWidth: 320,
                      padding: "var(--spacing-sm-plus) var(--spacing-sm-extra)",
                      fontFamily: "var(--type-body-sm-family)",
                      fontSize: "var(--type-body-sm-size)",
                      lineHeight: "var(--type-body-sm-line-height)",
                      color: "var(--text-neutral-inverse-secondary-default)",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}>
                      {item.preview.slice(0, 120)}
                    </div>
                  }
                  placement="left"
                  disableInteractive
                >
                  {button}
                </Tooltip>
              </li>
            );
          })}
        </ol>
      </ScrollFade>
      </div>
    </nav>
  );
}

AiThreadDialogIndicator.displayName = "AiThreadDialogIndicator";
