import { useId, useRef, useState } from "react";
import { AiLogoLoading } from "../AnimatedIcons";
import { AiLoadingLabel } from "../AiLoadingLabel";
import { Expander } from "../Expander";
import { Dropdown } from "../Dropdown";
import { CotContainer } from "../Cot";
import { CopyButton } from "../CopyButton";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { FeedbackBoolean } from "../FeedbackBoolean";
import { ResponseBody } from "../ResponseBody";
import { cx } from "../../utils/cx";
import styles from "./AiResponseBubble.module.css";
import type { AiResponseBubbleProps } from "./aiResponseBubbleTypes";

/* ── Component ─────────────────────────────────────────────────────────── */

export function AiResponseBubble({
  phase,
  loadingLabel = "Thinking…",
  cotContent,
  cotTitle,
  cotExpanded: cotExpandedProp,
  cotDefaultExpanded = false,
  onCotExpandedChange,
  text = "",
  slot,
  copyValue,
  onRegenerate,
  showFeedback = false,
  feedbackValue,
  onFeedbackChange,
  className,
  ...rest
}: AiResponseBubbleProps) {
  const dropdownId = useId();
  const cotToggleRef = useRef<HTMLButtonElement>(null);
  const [loadingCotOpen, setLoadingCotOpen] = useState(false);

  const hasActions = !!(copyValue || onRegenerate || showFeedback);
  const showActions = phase !== "loading" && hasActions;

  return (
    <article
      className={cx(styles.root, className)}
      aria-live={phase === "loading" ? "polite" : undefined}
      aria-busy={phase === "loading" || phase === "generating"}
      {...rest}
    >
      {/* ── Loading phase ── */}
      {phase === "loading" && (
        <>
          <div className={styles.loadingRow}>
            <AiLogoLoading size={32} aria-hidden />
            {cotContent != null ? (
              <button
                ref={cotToggleRef}
                type="button"
                className={styles.cotToggle}
                onClick={() => setLoadingCotOpen((v) => !v)}
                aria-expanded={loadingCotOpen}
                aria-controls={dropdownId}
                aria-label={loadingCotOpen ? "Hide reasoning" : "Show reasoning"}
              >
                <AiLoadingLabel label={loadingLabel} />
                <Expander expanded={loadingCotOpen} size="sm" className={styles.cotChevron} />
              </button>
            ) : (
              <AiLoadingLabel label={loadingLabel} />
            )}
          </div>

          {cotContent != null && (
            <Dropdown
              id={dropdownId}
              open={loadingCotOpen}
              onClose={() => setLoadingCotOpen(false)}
              anchorRef={cotToggleRef}
              placement="bottom-start"
              width={320}
              autoFocus={false}
              panelKeyboardNav={false}
            >
              <CotContainer type="reasoning">
                {cotContent}
              </CotContainer>
            </Dropdown>
          )}
        </>
      )}

      {/* ── Generating / Done phase ── */}
      {phase !== "loading" && (
        <div className={styles.content}>
          {cotContent != null && (
            <CotContainer
              type="reasoning"
              title={cotTitle}
              expanded={cotExpandedProp}
              defaultExpanded={cotDefaultExpanded}
              onExpandedChange={onCotExpandedChange}
            >
              {cotContent}
            </CotContainer>
          )}

          {text && (
            <ResponseBody
              html={text}
              className={styles.textBlock}
            />
          )}

          {slot && <div className={styles.slot}>{slot}</div>}
        </div>
      )}

      {/* ── Action bar ── */}
      {showActions && (
        <div className={styles.actions} aria-label="Message actions">
          {copyValue && (
            <CopyButton
              value={copyValue}
              size="sm"
              variant="neutral"
              emphasis="low"
            />
          )}
          {onRegenerate && (
            <IconButton
              size="sm"
              variant="neutral"
              emphasis="low"
              icon={<Icon name="autorenew" size={16} aria-hidden />}
              aria-label="Regenerate"
              onClick={onRegenerate}
            />
          )}
          {showFeedback && (
            <FeedbackBoolean
              size="sm"
              value={feedbackValue}
              onChange={onFeedbackChange}
            />
          )}
        </div>
      )}
    </article>
  );
}

AiResponseBubble.displayName = "AiResponseBubble";
