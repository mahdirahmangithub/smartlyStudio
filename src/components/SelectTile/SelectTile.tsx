import {
  forwardRef,
  createContext,
  useContext,
  useId,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes,
} from "react";
import styles from "./SelectTile.module.css";
import { cx } from "../../utils/cx";

/* ── SelectTileGroup ──────────────────────────────────────────────────── */

export type SelectTileSelectionMode = "single" | "multi";

export interface SelectTileGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Single-select (radio) or multi-select (checkbox) behaviour. */
  selectionMode?: SelectTileSelectionMode;
  /** Shared name for native radio inputs (auto-generated when omitted). */
  name?: string;
  /** Disables every tile in the group. */
  disabled?: boolean;
}

interface SelectTileGroupContext {
  selectionMode: SelectTileSelectionMode;
  name: string;
  disabled: boolean;
}

const GroupCtx = createContext<SelectTileGroupContext | null>(null);

export const SelectTileGroup = forwardRef<HTMLDivElement, SelectTileGroupProps>(
  function SelectTileGroup(
    {
      selectionMode = "single",
      name: nameProp,
      disabled = false,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const autoName = useId();
    const name = nameProp ?? autoName;

    const ctx: SelectTileGroupContext = { selectionMode, name, disabled };

    return (
      <GroupCtx.Provider value={ctx}>
        <div
          ref={ref}
          role={selectionMode === "single" ? "radiogroup" : "group"}
          className={cx(styles.group, className)}
          {...rest}
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child)) return child;
            const props = child.props as SelectTileProps;
            return cloneElement(child as ReactElement<SelectTileProps>, {
              inputType:
                props.inputType ??
                (selectionMode === "single" ? "radio" : "checkbox"),
              name: props.name ?? name,
              disabled: props.disabled ?? disabled,
            });
          })}
        </div>
      </GroupCtx.Provider>
    );
  },
);

SelectTileGroup.displayName = "SelectTileGroup";

/* ── SelectTile ───────────────────────────────────────────────────────── */

export interface SelectTileProps
  extends Omit<HTMLAttributes<HTMLLabelElement>, "onChange"> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Content rendered in the thumbnail slot (e.g. `<Thumbnail>`, `<Avatar>`). */
  thumbnail?: ReactNode;
  /** Text label below the thumbnail. */
  label: string;
  /** Native input type — inferred from `SelectTileGroup.selectionMode` when grouped. */
  inputType?: "radio" | "checkbox";
  /** Shared name attribute for the native input. */
  name?: string;
  /** Form value for the native input. */
  value?: string;
  /** Change handler. */
  onChange?: (checked: boolean) => void;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export const SelectTile = forwardRef<HTMLLabelElement, SelectTileProps>(
  function SelectTile(
    {
      checked = false,
      disabled = false,
      thumbnail,
      label,
      inputType = "radio",
      name,
      value,
      onChange,
      className,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    ref,
  ) {
    const group = useContext(GroupCtx);
    const resolvedDisabled = disabled || (group?.disabled ?? false);
    const resolvedName = name ?? group?.name;
    const resolvedType =
      inputType ?? (group?.selectionMode === "multi" ? "checkbox" : "radio");
    const isMulti = resolvedType === "checkbox";

    return (
      <label
        ref={ref}
        className={cx(
          styles.tile,
          checked && styles.checked,
          isMulti && styles.multi,
          resolvedDisabled && styles.disabled,
          className,
        )}
        {...rest}
      >
        <input
          type={resolvedType}
          className={styles.input}
          checked={checked}
          disabled={resolvedDisabled}
          name={resolvedName}
          value={value}
          aria-label={ariaLabel ?? label}
          aria-describedby={ariaDescribedBy}
          onChange={(e) => onChange?.(e.target.checked)}
        />

        {thumbnail && (
          <span className={styles.thumbnailSlot} aria-hidden="true">
            {thumbnail}
          </span>
        )}

        <span className={styles.label}>{label}</span>
      </label>
    );
  },
);

SelectTile.displayName = "SelectTile";
