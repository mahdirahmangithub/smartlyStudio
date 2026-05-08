import { useContext, type HTMLAttributes, type ReactNode } from "react";
import { MenuItemRoleContext } from "../Dropdown/MenuContext";
import { Icon } from "../Icon";
import { OptionItemLeading } from "../OptionItemLeading";
import {
  OptionItemTrailing,
  type OptionItemTrailingProps,
} from "../OptionItemTrailing";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./GenericSelectOption.module.css";
import { cx } from "../../utils/cx";

export interface GenericSelectOptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Destructive / danger variant */
  alert?: boolean;
  disabled?: boolean;
  labelText?: string;
  description?: boolean;
  descriptionText?: string;
  /** Content for the leading slot (e.g. an Icon) */
  leading?: ReactNode;
  /** Props forwarded to OptionItemTrailing */
  trailing?: Omit<OptionItemTrailingProps, "disabled">;
  /** Show a chevron_right icon indicating a sub-menu */
  subMenu?: boolean;
  onClick?: () => void;
  /** ARIA role for the interactive element — "option" (default) or "menuitem" */
  itemRole?: "option" | "menuitem";
  /** When true, omits the focus-visible ring (hover/press backgrounds unchanged). */
  hideFocusRing?: boolean;
  /** `id` on the interactive row (e.g. `aria-activedescendant` target). */
  optionId?: string;
  /** Highlights the row (combobox / listbox active descendant). */
  isActive?: boolean;
  /**
   * When true, row is not in the tab order (`tabIndex={-1}`) — host keeps focus (e.g. combobox textarea).
   */
  unmanagedFocus?: boolean;
  /**
   * `aria-haspopup` on the focusable inner element. Use `"menu"` for rows
   * that open a submenu / drilldown so screen readers announce "has popup".
   */
  ariaHasPopup?: "menu" | "listbox" | "tree" | "grid" | "dialog" | true;
  /**
   * `aria-expanded` on the focusable inner element. Pair with `ariaHasPopup`
   * so screen readers announce open/closed state.
   */
  ariaExpanded?: boolean;
  /**
   * `aria-controls` on the focusable inner element. The id of the panel
   * this row controls (e.g. a submenu panel). Pair with `ariaHasPopup`.
   */
  ariaControls?: string;
}


export function GenericSelectOption({
  alert = false,
  disabled = false,
  labelText = "Label",
  description = true,
  descriptionText = "Description",
  leading,
  trailing,
  subMenu = false,
  onClick,
  onFocus,
  onMouseEnter,
  itemRole,
  hideFocusRing = true,
  optionId,
  isActive = false,
  unmanagedFocus = false,
  ariaHasPopup,
  ariaExpanded,
  ariaControls,
  className,
  ...rest
}: GenericSelectOptionProps) {
  // If the caller didn't specify a role, inherit from the nearest Dropdown context
  // ("menuitem" inside role="menu", "option" inside role="listbox", "option" standalone).
  const contextRole = useContext(MenuItemRoleContext);
  const resolvedRole = itemRole ?? contextRole ?? "option";
  const [labelRef, isLabelTruncated] = useIsTruncated<HTMLSpanElement>(labelText);

  const handleClick = () => {
    if (!disabled) onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div className={cx(styles.option, className)} {...rest}>
      <div
        id={optionId}
        role={resolvedRole}
        aria-disabled={disabled || undefined}
        aria-selected={resolvedRole === "option" ? isActive : undefined}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaHasPopup !== undefined ? !!ariaExpanded : undefined}
        aria-controls={ariaControls}
        tabIndex={disabled || unmanagedFocus ? -1 : 0}
        className={cx(
          styles.content,
          alert && styles.alert,
          disabled && styles.disabled,
          hideFocusRing && styles.noFocusRing,
          isActive && styles.active
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onMouseEnter={onMouseEnter}
      >
        {leading && (
          <OptionItemLeading
            type="icon"
            disabled={disabled}
            className={alert ? styles.alertLeading : undefined}
          >
            {leading}
          </OptionItemLeading>
        )}

        <div className={styles.text}>
          <Tooltip label={labelText} disabled={!isLabelTruncated} placement="top" type="neutral" showTail={false}>
            <span ref={labelRef} className={styles.label}>{labelText}</span>
          </Tooltip>
          {description && (
            <span className={styles.description}>{descriptionText}</span>
          )}
        </div>

        {trailing && <OptionItemTrailing {...trailing} disabled={disabled} />}

        {subMenu && (
          <Icon name="chevron_right" size={16} className={styles.subMenuIcon} />
        )}
      </div>
    </div>
  );
}
