import { useState, useRef, useLayoutEffect } from "react";
import { FileAttachment } from "../FileAttachment";
import { Thumbnail } from "../Thumbnail";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { CopyButton } from "../CopyButton";
import { Badge } from "../Badge";
import { Link } from "../Link";
import { RowContainer } from "../RowContainer";
import { isImageFile, isVideoFile } from "../../utils/inferFileType";
import { cx } from "../../utils/cx";
import styles from "./UserBubble.module.css";
import type { UserBubbleProps } from "./userBubbleTypes";


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UserBubble({
  message,
  attachments,
  contextItems,
  replyLabel,
  onCopy,
  onEdit,
  className,
  ...rest
}: UserBubbleProps) {
  const hasAttachments = !!attachments?.length;
  const hasMessage = !!message.trim();
  // Context chips and the bubble body are only shown when there is message text.
  const hasContext = hasMessage && !!contextItems?.length;

  // Start clamped so the layout effect can detect overflow before first paint.
  const [needsTruncation, setNeedsTruncation] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = textContainerRef.current;
    if (!el) return;
    // scrollHeight reports full content height even when overflow is hidden.
    setNeedsTruncation(el.scrollHeight > el.clientHeight + 1);
    setExpanded(false);
  }, [message]);

  const handleExpand = () => {
    const el = textContainerRef.current;
    if (!el) return;
    const fullH = el.scrollHeight;
    const clampedH = el.clientHeight;

    el.style.transition = "none";
    el.style.maxHeight = "none";
    el.style.height = `${clampedH}px`;
    el.style.overflow = "hidden";

    requestAnimationFrame(() => {
      el.style.transition = `height var(--animation-state-expand-duration) var(--animation-state-expand-easing)`;
      el.style.height = `${fullH}px`;

      el.addEventListener("transitionend", function onEnd(e: TransitionEvent) {
        if (e.propertyName !== "height") return;
        el.style.height = "auto";
        el.style.overflow = "";
        el.style.transition = "";
        el.removeEventListener("transitionend", onEnd);
      });
    });

    setExpanded(true);
  };

  const showFader = needsTruncation && !expanded;

  return (
    <article className={cx(styles.root, className)} {...rest}>

      {/* Reply badge */}
      {replyLabel && (
        <Badge
          size="md"
          variant="neutral"
          emphasis="low"
          leadingIcon={<Icon name="reply" size={12} aria-hidden />}
        >
          {replyLabel}
        </Badge>
      )}

      {/* Attachments — read-only, same compact/expanded logic as PromptInput */}
      {hasAttachments && (
        <ul className={styles.attachments} aria-label="Attached files">
          {attachments!.map((att) => {
            const { id, file, previewUrl, title, fileName } = att;
            const displayName = title ?? file?.name ?? fileName;

            if (file && isImageFile(file) && previewUrl) {
              return (
                <li key={id} className={styles.attachmentItem}>
                  <FileAttachment
                    thumbnail={
                      <Thumbnail size="lg" type="media" src={previewUrl} alt={displayName} />
                    }
                    title={displayName}
                  />
                </li>
              );
            }

            if (file && isVideoFile(file)) {
              return (
                <li key={id} className={styles.attachmentItem}>
                  <FileAttachment
                    file={file}
                    autoThumbnailSize="lg"
                    title={displayName}
                  />
                </li>
              );
            }

            // Docs, PDFs, etc. — expanded mode: show filename as description when no File size available
            return (
              <li key={id} className={styles.attachmentItem}>
                <FileAttachment
                  file={file}
                  fileName={fileName}
                  title={displayName}
                  description={file ? formatFileSize(file.size) : displayName}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* Bubble — only rendered when there is message text */}
      {hasMessage && <div className={styles.bubble}>

        {/* Context chips — horizontally scrollable with dynamic left/right fades */}
        {hasContext && (
          <RowContainer
            density="sm"
            insetLeft="md"
            insetRight="md"
            paddingTop="xs"
            paddingBottom="xs"
            surface="auto"
            aria-label="Context"
          >
            {contextItems!.map((item) => (
              <Chip
                key={item.id}
                size="md"
                emphasis="medium"
                variant="neutral"
                leadingIcon={<Icon name={item.icon} size={16} aria-hidden />}
              >
                {item.label}
              </Chip>
            ))}
          </RowContainer>
        )}

        {/* Message text area */}
        <div className={styles.textArea}>
          <div
            ref={textContainerRef}
            className={cx(styles.textContainer, showFader && styles.textContainerClamped)}
          >
            <p className={styles.messageText}>{message}</p>
          </div>

          {/* Gradient fade overlay with expand link */}
          {showFader && (
            <div className={styles.contentFader}>
              <Link
                size="md"
                strong
                type="neutral"
                role="button"
                tabIndex={0}
                onClick={handleExpand}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.preventDefault();
                    handleExpand();
                  }
                }}
              >
                Show full message
              </Link>
            </div>
          )}
        </div>

        {/* Action bar — revealed on bubble hover / keyboard focus-within */}
        <div className={styles.actions}>
          <CopyButton
            value={message}
            size="sm"
            variant="neutral"
            emphasis="low"
            onCopy={onCopy}
          />
          {onEdit && (
            <IconButton
              size="sm"
              variant="neutral"
              emphasis="low"
              icon={<Icon name="edit" size={16} />}
              aria-label="Edit message"
              onClick={onEdit}
            />
          )}
        </div>
      </div>}
    </article>
  );
}

UserBubble.displayName = "UserBubble";
