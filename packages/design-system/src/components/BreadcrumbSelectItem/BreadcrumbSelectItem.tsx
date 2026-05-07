import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useId,
  type ReactNode,
} from "react";
import { Icon } from "../Icon";
import { Link } from "../Link";
import type { LinkSize } from "../Link";
import { Badge } from "../Badge";
import type { BadgeSize } from "../Badge";
import { Dropdown } from "../Dropdown";
import { NavigationSelectOption } from "../NavigationSelectOption";
import type { BreadcrumbItemSize } from "../BreadcrumbItem";
import styles from "./BreadcrumbSelectItem.module.css";
import { cx } from "../../utils/cx";

export interface BreadcrumbSelectOption {
  /** Unique identifier for this option */
  value: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbSelectItemProps {
  /** Visual size */
  size?: BreadcrumbItemSize;
  /** Leading icon */
  icon?: ReactNode;
  /** Marks this item as the current page (last item) */
  current?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Flat style — accepted for API consistency but currently only pill is styled */
  basic?: boolean;
  /** Link destination (pill area navigation) */
  href?: string;
  /** Click handler for the pill area */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Accessible label */
  "aria-label"?: string;
  /** Label text — when value is set, this is overridden by the selected option's label */
  children?: ReactNode;
  className?: string;
  /** Dropdown options for this breadcrumb level */
  options: BreadcrumbSelectOption[];
  /** Currently selected option value (controlled) */
  value?: string;
  /** Called when the user selects a different option */
  onChange?: (value: string, option: BreadcrumbSelectOption) => void;
  /** Show the options count badge (defaults to true when options exist) */
  showBadge?: boolean;
  /** Accessible label for the dropdown trigger button */
  expandLabel?: string;
}

const ICON_SIZE: Record<BreadcrumbItemSize, number> = {
  lg: 20,
  md: 16,
  sm: 16,
};

const LINK_SIZE: Record<BreadcrumbItemSize, LinkSize> = {
  lg: "md",
  md: "md",
  sm: "sm",
};

const BADGE_SIZE: Record<BreadcrumbItemSize, BadgeSize> = {
  lg: "md",
  md: "sm",
  sm: "sm",
};

export const BreadcrumbSelectItem = forwardRef<
  HTMLSpanElement,
  BreadcrumbSelectItemProps
>(function BreadcrumbSelectItem(
  {
    size = "lg",
    icon,
    current = false,
    disabled = false,
    basic: _basic = false,
    children,
    className,
    href,
    onClick,
    "aria-label": ariaLabel,
    options,
    value,
    onChange,
    showBadge,
    expandLabel = "Show alternate paths",
  },
  ref,
) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const dropdownId = useId();

  const selectedOption = value != null
    ? options.find((o) => o.value === value)
    : undefined;

  const displayLabel = selectedOption ? selectedOption.label : children;
  const displayIcon = selectedOption?.icon ?? icon;

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handleChevronKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDropdownOpen(true);
      }
    },
    [],
  );

  const badgeVisible =
    showBadge !== undefined ? showBadge : options.length > 0;

  const cls = cx(
    styles.root,
    styles[size],
    current && styles.current,
    disabled && styles.disabled,
    dropdownOpen && styles.dropdownOpen,
    className,
  );

  const iconEl = displayIcon && (
    <span className={styles.icon} aria-hidden="true">
      {typeof displayIcon === "string" ? (
        <Icon name={displayIcon as any} size={ICON_SIZE[size]} />
      ) : (
        displayIcon
      )}
    </span>
  );

  const resolvedHref = selectedOption?.href ?? href;

  const linkProps = {
    href: current ? undefined : resolvedHref,
    onClick: current ? toggleDropdown : onClick,
    disabled,
    size: LINK_SIZE[size],
    strong: !current,
    className: styles.link,
    "aria-current": current ? ("page" as const) : undefined,
  };

  return (
    <>
      <span ref={ref} className={cls}>
        <span className={styles.base} aria-hidden="true" />

        <span className={styles.content}>
          {iconEl}
          {displayLabel && (
            <Link {...linkProps} aria-label={ariaLabel}>
              {displayLabel}
            </Link>
          )}
          {badgeVisible && (
            <span className={styles.badge}>
              <Badge
                size={BADGE_SIZE[size]}
                variant="info"
                emphasis="medium"
                round
              >
                {options.length}
              </Badge>
            </span>
          )}
        </span>

        <button
          ref={chevronRef}
          type="button"
          className={styles.chevronBtn}
          onClick={toggleDropdown}
          onKeyDown={handleChevronKeyDown}
          aria-label={expandLabel}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-controls={dropdownOpen ? dropdownId : undefined}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <span className={styles.chevronIcon}>
            <Icon name="chevron_right" size={16} aria-hidden="true" />
          </span>
        </button>
      </span>

      <Dropdown
        id={dropdownId}
        open={dropdownOpen}
        onClose={closeDropdown}
        anchorRef={chevronRef}
        placement="bottom-start"
        width={200}
      >
        {options.map((opt) => {
          const iconNode =
            typeof opt.icon === "string" ? (
              <Icon name={opt.icon as any} size={20} />
            ) : (
              opt.icon
            );

          return (
            <NavigationSelectOption
              key={opt.value}
              labelText={opt.label}
              leading={iconNode ?? undefined}
              selected={value != null && opt.value === value}
              disabled={opt.disabled}
              onClick={() => {
                if (opt.value === value) {
                  closeDropdown();
                  return;
                }
                if (onChange) {
                  onChange(opt.value, opt);
                }
                closeDropdown();
                if (opt.onClick) {
                  opt.onClick();
                } else if (opt.href) {
                  window.location.href = opt.href;
                }
              }}
            />
          );
        })}
      </Dropdown>
    </>
  );
});

BreadcrumbSelectItem.displayName = "BreadcrumbSelectItem";
