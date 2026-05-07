import {
  forwardRef,
} from "react";
import { Textarea, type TextareaProps } from "../Textarea";
import { Icon } from "../Icon";
import { cx } from "../../utils/cx";
import styles from "./InlineTextarea.module.css";

export type InlineTextareaSize = "sm" | "lg";

export interface InlineTextareaProps
  extends Omit<TextareaProps, "size" | "error" | "resize"> {
  /** Visual size — sm uses label/sm (14px), lg uses label/md (16px). */
  size?: InlineTextareaSize;
  /** Show a focus ring outline around the component when focused. */
  focusIndicator?: boolean;
  /** Show an edit icon overlay on hover (hidden while focused). */
  hoverIndicator?: boolean;
}

/**
 * A chrome-less textarea that inherits all Textarea capabilities
 * (autoExpand, maxHeight, scroll fades, controlled/uncontrolled)
 * but renders without border, background, or shadow.
 */
export const InlineTextarea = forwardRef<HTMLTextAreaElement, InlineTextareaProps>(
  (
    {
      size = "sm",
      focusIndicator = false,
      hoverIndicator = false,
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        className={cx(
          styles.root,
          styles[size],
          disabled && styles.disabled,
          className,
        )}
      >
        <Textarea
          ref={ref}
          disabled={disabled}
          resize={false}
          className={styles.textarea}
          {...rest}
        />

        {focusIndicator && (
          <div className={styles.focusRing} aria-hidden="true" />
        )}

        {hoverIndicator && (
          <div className={styles.hoverOverlay} aria-hidden="true">
            <Icon
              name="edit"
              size={size === "lg" ? 20 : 16}
              className={styles.hoverIcon}
            />
          </div>
        )}
      </div>
    );
  },
);

InlineTextarea.displayName = "InlineTextarea";
