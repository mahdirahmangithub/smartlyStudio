import { useId, type ReactNode } from "react";
import { Label, type LabelSize } from "../Label";
import {
  InlineMessage,
  type InlineMessageType,
  type InlineMessageEmphasis,
} from "../InlineMessage";
import styles from "./Fieldset.module.css";

export interface FieldGroupProps {
  /** Group label text. */
  label?: string;
  /** Description shown below the label. */
  description?: string;
  /** Label size variant. */
  labelSize?: LabelSize;
  /** Bold label text. */
  labelStrong?: boolean;
  /** Leading icon for the label. */
  labelLeadingIcon?: ReactNode;
  /** Trailing action slot for the label. */
  labelAction?: ReactNode;
  /** Hint tooltip on the label. */
  labelHint?: string;
  /** Hint tooltip description. */
  labelHintDescription?: string;
  /** Mark the group as required. */
  required?: boolean;
  /** Mark the group as optional. */
  optional?: boolean;

  /** Inline message text shown below the controls. */
  message?: string;
  /** Inline message semantic type. */
  messageType?: InlineMessageType;
  /** Inline message emphasis. */
  messageEmphasis?: InlineMessageEmphasis;
  /** Show the inline message's leading icon. */
  showMessageIcon?: boolean;

  /** Disabled state. */
  disabled?: boolean;

  /**
   * ARIA role for the group.
   * - `"group"` (default) — for checkbox/toggle groups.
   * - `"radiogroup"` — for radio button groups.
   */
  role?: "group" | "radiogroup";

  /**
   * Base ID used to derive related IDs.
   * Auto-generated when omitted.
   *
   * Derived IDs:
   * - `{id}-label` → set on the group label for `aria-labelledby`
   * - `{id}-hint`  → set on the InlineMessage for `aria-describedby`
   */
  id?: string;
  className?: string;

  /** The grouped controls (e.g. multiple ToggleField / CheckboxField). */
  children?: ReactNode;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function FieldGroup({
  label,
  description,
  labelSize = "lg",
  labelStrong = true,
  labelLeadingIcon,
  labelAction,
  labelHint,
  labelHintDescription,
  required,
  optional,
  message,
  messageType = "neutral",
  messageEmphasis = "low",
  showMessageIcon = true,
  disabled = false,
  role: groupRole = "group",
  id: idProp,
  className,
  children,
}: FieldGroupProps) {
  const autoId = useId();
  const baseId = idProp ?? autoId;
  const labelId = `${baseId}-label`;
  const hintId = `${baseId}-hint`;

  const hasLabel = !!label;
  const hasMessage = !!message;

  return (
    <div
      role={groupRole}
      aria-labelledby={hasLabel ? labelId : undefined}
      aria-describedby={hasMessage ? hintId : undefined}
      className={cx(styles.root, disabled && styles.disabled, className)}
    >
      {hasLabel && (
        <div id={labelId}>
          <Label
            label={label!}
            size={labelSize}
            strong={labelStrong}
            disabled={disabled}
            leadingIcon={labelLeadingIcon}
            required={required}
            optional={optional}
            hint={labelHint}
            hintDescription={labelHintDescription}
            description={description}
            action={labelAction}
          />
        </div>
      )}

      <div className={styles.inputHint}>
        {children && <div className={styles.slot}>{children}</div>}

        {hasMessage && (
          <InlineMessage
            id={hintId}
            type={messageType}
            emphasis={messageEmphasis}
            text={message}
            showLeadingIcon={showMessageIcon}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
