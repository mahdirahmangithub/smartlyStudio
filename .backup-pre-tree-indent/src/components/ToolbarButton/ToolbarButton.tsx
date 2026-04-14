import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { Icon } from "../Icon";
import { Spinner } from "../Spinner";
import { Tooltip } from "../Tooltip";
import type { Placement } from "../Tooltip/Tooltip";
import { ShortcutTooltip } from "../ShortcutTooltip";
import { Dropdown } from "../Dropdown";
import type { DropdownPlacement } from "../Dropdown/Dropdown";
import styles from "./ToolbarButton.module.css";
import { cx } from "../../utils/cx";


export interface ToolbarButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** The icon to render */
  icon: ReactNode;
  "aria-label": string;
  /** Selected / active state */
  selected?: boolean;
  /** Shows a spinner overlay, disables interaction */
  loading?: boolean;
  /** Shows a small dropdown indicator at bottom-right */
  subTool?: boolean;
  /** Content rendered inside the subtool dropdown */
  subToolContent?: ReactNode;
  /** Controlled open state for the dropdown */
  subToolOpen?: boolean;
  /** Callback when dropdown open state changes */
  onSubToolOpenChange?: (open: boolean) => void;
  /** Dropdown placement relative to the button */
  dropdownPlacement?: DropdownPlacement;
  /** Width of the dropdown panel */
  dropdownWidth?: number;
  /** Label shown in the tooltip (defaults to aria-label) */
  tooltipLabel?: string;
  /** When provided, tooltip becomes a ShortcutTooltip with these keys */
  tooltipShortcut?: string[];
  /** Placement of the tooltip */
  tooltipPlacement?: Placement;
  /** Hide the tooltip entirely */
  hideTooltip?: boolean;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      icon,
      "aria-label": ariaLabel,
      selected = false,
      disabled = false,
      loading = false,
      subTool = false,
      subToolContent,
      subToolOpen: controlledOpen,
      onSubToolOpenChange,
      dropdownPlacement = "right-start",
      dropdownWidth,
      tooltipLabel,
      tooltipShortcut,
      tooltipPlacement,
      hideTooltip = false,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const btnRef = (ref as React.RefObject<HTMLButtonElement>) ?? internalRef;
    const actualRef = btnRef || internalRef;

    /* ── dropdown state ────────────────────────── */

    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const dropdownOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const setDropdownOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onSubToolOpenChange?.(next);
      },
      [isControlled, onSubToolOpenChange]
    );

    const isDisabled = disabled || loading;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (subTool && subToolContent) {
          setDropdownOpen(!dropdownOpen);
        }
      },
      [onClick, subTool, subToolContent, dropdownOpen, setDropdownOpen]
    );

    /* ── button element ────────────────────────── */

    const button = (
      <button
        ref={actualRef}
        type="button"
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-haspopup={subTool && subToolContent ? "listbox" : undefined}
        aria-expanded={subTool && subToolContent ? dropdownOpen : undefined}
        className={cx(
          styles.button,
          selected && styles.selected,
          isDisabled && styles.disabled,
          className
        )}
        onClick={handleClick}
        {...rest}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          {loading ? <Spinner size="sm" type="neutral" /> : icon}
        </span>

        {subTool && (
          <span className={styles.subToolIndicator} aria-hidden="true">
            <Icon name="ic_drop_out" size={16} />
          </span>
        )}
      </button>
    );

    /* ── tooltip wrapper ───────────────────────── */

    const suppressTooltip = hideTooltip || dropdownOpen;

    const withTooltip = tooltipShortcut ? (
      <ShortcutTooltip
        label={tooltipLabel ?? ariaLabel}
        shortcut={tooltipShortcut}
        placement={tooltipPlacement}
        disabled={suppressTooltip}
      >
        {button}
      </ShortcutTooltip>
    ) : (
      <Tooltip
        label={tooltipLabel ?? ariaLabel}
        showTail={false}
        placement={tooltipPlacement}
        disabled={suppressTooltip}
      >
        {button}
      </Tooltip>
    );

    /* ── render ────────────────────────────────── */

    return (
      <>
        {withTooltip}

        {subTool && subToolContent && (
          <Dropdown
            open={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            anchorRef={actualRef}
            placement={dropdownPlacement}
            width={dropdownWidth}
          >
            {subToolContent}
          </Dropdown>
        )}
      </>
    );
  }
);

ToolbarButton.displayName = "ToolbarButton";
