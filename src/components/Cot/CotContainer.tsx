import { useId, useState } from "react";
import { Expander } from "../Expander";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { InlineMessage } from "../InlineMessage";
import { TitleText } from "../TitleText";
import { ProgressBar } from "../ProgressBar";
import { Tag } from "../Tag";
import { Icon } from "../Icon";
import { useCollapsible } from "../../hooks/useCollapsible";
import { cx } from "../../utils/cx";
import styles from "./CotContainer.module.css";
import type { CotContainerProps } from "./cotTypes";

export function CotContainer({
  type,
  title,
  hint,
  status = "idle",
  progress = 0,
  tag,
  onEdit,
  onCancel,
  onStart,
  onStop,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  children,
  className,
  ...rest
}: CotContainerProps) {
  const isRunning = status === "running";
  const isCancelled = status === "cancelled";
  const isEditing = status === "editing";
  const isEdited = status === "edited";
  const isIdle = status === "idle";

  const autoTag = isCancelled
    ? <Tag size="md" variant="neutral" emphasis="low" label="Canceled" />
    : isEdited
    ? <Tag size="md" variant="neutral" emphasis="low" label="Edited" />
    : undefined;

  const resolvedTag = tag ?? autoTag;
  const contentId = useId();
  const isControlled = expandedProp !== undefined;
  const [expandedInternal, setExpandedInternal] = useState(defaultExpanded);
  const isExpanded = isControlled ? expandedProp! : expandedInternal;

  const { ref: collapsibleRef } = useCollapsible(isExpanded);

  const toggle = () => {
    if (!isControlled) setExpandedInternal((v) => !v);
    onExpandedChange?.(!isExpanded);
  };

  if (type === "reasoning") {
    // No title → always expanded, uniform padding, no collapsible
    if (title == null) {
      return (
        <div className={cx(styles.root, styles.reasoningFlat, className)} {...rest}>
          {children}
          {hint && (
            <div className={styles.hint}>
              <InlineMessage type="neutral" emphasis="low" text={hint} showLeadingIcon={false} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={cx(styles.root, className)} {...rest}>
        <button
          type="button"
          className={styles.titleButtonReasoning}
          onClick={toggle}
          aria-expanded={isExpanded}
          aria-controls={contentId}
        >
          <TitleText size="2xs" title={title} as="span" />
          <Expander expanded={isExpanded} size="sm" emphasis="medium" />
        </button>

        {children != null && (
          <div
            id={contentId}
            ref={collapsibleRef}
            className={styles.items}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
          >
            <div className={styles.itemsInnerReasoning}>{children}</div>
          </div>
        )}

        {hint && (
          <div className={styles.hint}>
            <InlineMessage type="neutral" emphasis="low" text={hint} showLeadingIcon={false} />
          </div>
        )}
      </div>
    );
  }

  // task type
  return (
    <div className={cx(styles.root, className)} {...rest}>
      <div className={styles.card}>
        <div className={styles.header}>
          {/* Title row: expand/collapse button + optional tag */}
          <div className={styles.titleRow}>
            <button
              type="button"
              className={styles.titleButton}
              onClick={toggle}
              aria-expanded={isExpanded}
              aria-controls={contentId}
            >
              <Expander expanded={isExpanded} size="sm" emphasis="medium" />
              <TitleText size="xs" title={title} as="span" />
            </button>
            {resolvedTag && <div className={styles.titleTag}>{resolvedTag}</div>}
          </div>

          {/* Progress + stop (running state) */}
          {isRunning && (
            <div className={styles.progressRow}>
              <ProgressBar
                type="neutral"
                value={progress}
                aria-label="Task progress"
                showValue={false}
                className={styles.progressBar}
              />
              <IconButton
                size="sm"
                variant="neutral"
                emphasis="low"
                icon={<Icon name="stop_fill" size={16} aria-hidden />}
                aria-label="Stop"
                onClick={onStop}
              />
            </div>
          )}
        </div>

        {/* CotItems collapsible area */}
        {children != null && (
          <div
            id={contentId}
            ref={collapsibleRef}
            className={styles.items}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
            data-items-disabled={isCancelled || undefined}
          >
            <div className={styles.itemsInner}>{children}</div>
          </div>
        )}

        {/* Actions (idle state only) */}
        {isIdle && (onEdit || onCancel || onStart) && (
          <div className={styles.actions}>
            <div className={styles.actionsLeft}>
              <Button size="md" variant="neutral" emphasis="low" onClick={onEdit}>
                Edit
              </Button>
            </div>
            <div className={styles.actionsRight}>
              <Button size="md" variant="neutral" emphasis="medium" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="md" variant="neutral" emphasis="high" onClick={onStart}>
                Start
              </Button>
            </div>
          </div>
        )}
      </div>

      {hint && (
        <div className={styles.hint}>
          <InlineMessage type="neutral" emphasis="low" text={hint} showLeadingIcon={false} />
        </div>
      )}
    </div>
  );
}

CotContainer.displayName = "CotContainer";
