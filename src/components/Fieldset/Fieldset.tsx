import { useId, useMemo, type ReactNode } from "react";
import { Label, type LabelSize } from "../Label";
import {
  InlineMessage,
  type InlineMessageType,
  type InlineMessageEmphasis,
} from "../InlineMessage";
import { FieldContext } from "./FieldContext";
import styles from "./Fieldset.module.css";

export interface FieldsetProps {
  /** Label text. When omitted the label row is hidden. */
  label?: string;
  /** Description shown below the label. */
  description?: string;
  /** Label size variant. */
  labelSize?: LabelSize;
  /** Bold label text. */
  labelStrong?: boolean;
  /** Leading icon for the label. */
  labelLeadingIcon?: ReactNode;
  /** Trailing action slot for the label (e.g. an IconButton). */
  labelAction?: ReactNode;
  /** Hint tooltip on the label. */
  labelHint?: string;
  /** Hint tooltip description. */
  labelHintDescription?: string;
  /** Mark the field as required (adds * to label). */
  required?: boolean;
  /** Mark the field as optional (adds "(Optional)" to label). */
  optional?: boolean;

  /** Inline message text shown below the input slot. */
  message?: string;
  /** Inline message semantic type. Defaults to "neutral". */
  messageType?: InlineMessageType;
  /** Inline message emphasis. Defaults to "low". */
  messageEmphasis?: InlineMessageEmphasis;
  /** Show the inline message's leading icon. */
  showMessageIcon?: boolean;
  /** Current character count (passed to InlineMessage). */
  charCount?: number;
  /** Max character limit (passed to InlineMessage). */
  charMax?: number;

  /** Disabled state — propagated to Label and InlineMessage visuals. */
  disabled?: boolean;

  /**
   * Base ID used to derive related IDs for accessibility.
   * When omitted a stable ID is auto-generated.
   *
   * Derived IDs:
   * - `{id}-input`  → put this on your input element's `id`
   * - `{id}-hint`   → auto-set on the InlineMessage for `aria-describedby`
   */
  id?: string;
  className?: string;

  /**
   * The form control(s) to render inside the field.
   *
   * For automatic ARIA wiring, set `id={inputId}` and
   * `aria-describedby={hintId}` on your input element,
   * using the IDs from the render-prop overload:
   *
   * ```tsx
   * <Fieldset label="Email">
   *   {({ inputId, hintId }) => (
   *     <input id={inputId} aria-describedby={hintId} />
   *   )}
   * </Fieldset>
   * ```
   *
   * Or pass a plain ReactNode and wire IDs yourself.
   */
  children?:
    | ReactNode
    | ((ids: { inputId: string; hintId: string }) => ReactNode);
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Fieldset({
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
  charCount,
  charMax,
  disabled = false,
  id: idProp,
  className,
  children,
}: FieldsetProps) {
  const autoId = useId();
  const baseId = idProp ?? autoId;
  const inputId = `${baseId}-input`;
  const hintId = `${baseId}-hint`;

  const hasLabel = !!label;
  const hasMessage = !!message || charMax !== undefined;

  const renderedChildren =
    typeof children === "function"
      ? children({ inputId, hintId })
      : children;

  const ctxValue = useMemo(
    () => ({ inputId, hintId }),
    [inputId, hintId],
  );

  return (
    <FieldContext.Provider value={ctxValue}>
      <div className={cx(styles.root, disabled && styles.disabled, className)}>
        {hasLabel && (
          <Label
            label={label!}
            htmlFor={inputId}
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
        )}

        <div className={styles.inputHint}>
          {renderedChildren && (
            <div className={styles.slot}>{renderedChildren}</div>
          )}

          {hasMessage && (
            <InlineMessage
              id={hintId}
              type={messageType}
              emphasis={messageEmphasis}
              text={message}
              showLeadingIcon={showMessageIcon}
              charCount={charCount}
              charMax={charMax}
            />
          )}
        </div>
      </div>
    </FieldContext.Provider>
  );
}
