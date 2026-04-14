import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { RowContainer } from "../RowContainer";
import { Icon } from "../Icon";
import type { ScrollFadeSurface } from "../ScrollFade";
import type { SpacingSize } from "../../utils/spacing";
import type { TabItemProps } from "../TabItem";
import styles from "./TabBar.module.css";
import { cx } from "../../utils/cx";

export type TabBarActivationMode = "automatic" | "manual";

export interface TabBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  /** Controlled selected tab value */
  value?: string;
  /** Default selected tab value (uncontrolled) */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /**
   * "automatic" — tab activates when focused via arrow keys (WAI-ARIA default).
   * "manual" — tab only activates on click / Enter / Space.
   */
  activationMode?: TabBarActivationMode;
  /** When true, tabs stretch to fill the available width equally */
  fullWidth?: boolean;
  /** Left inset padding inside the scroll area */
  insetLeft?: SpacingSize;
  /** Right inset padding inside the scroll area */
  insetRight?: SpacingSize;
  /** Surface hint forwarded to ScrollFade for fade colour detection */
  surface?: ScrollFadeSurface;
  /** If provided, an "add tab" button is rendered at the end of the list */
  onAddTab?: () => void;
  /** Disable every tab and the add button */
  disabled?: boolean;
  children: ReactNode;
}

const ADD_ICON_SIZE = 20;

function findNextEnabledTab(
  tabs: HTMLButtonElement[],
  fromIndex: number,
  direction: 1 | -1
): number | undefined {
  const len = tabs.length;
  if (len === 0) return undefined;
  let index = fromIndex + direction;
  let wrapped = false;

  while (true) {
    if (index < 0) {
      if (wrapped) return undefined;
      index = len - 1;
      wrapped = true;
    } else if (index >= len) {
      if (wrapped) return undefined;
      index = 0;
      wrapped = true;
    }
    if (index === fromIndex) return undefined;

    const tab = tabs[index];
    if (!tab.disabled && tab.getAttribute("aria-disabled") !== "true") {
      return index;
    }
    index += direction;
  }
}

export const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      activationMode = "automatic",
      fullWidth = false,
      insetLeft,
      insetRight,
      surface = "auto",
      onAddTab,
      disabled = false,
      className,
      children,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const activeValue = isControlled ? valueProp : internalValue;

    const tabListRef = useRef<HTMLDivElement>(null);

    const handleChange = useCallback(
      (newValue: string) => {
        if (!isControlled) setInternalValue(newValue);
        onChange?.(newValue);
      },
      [isControlled, onChange]
    );

    useEffect(() => {
      if (activeValue == null || !tabListRef.current) return;
      const tab = tabListRef.current.querySelector<HTMLElement>(
        `[role="tab"][data-value="${CSS.escape(activeValue)}"]`
      );
      tab?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }, [activeValue]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey)
          return;

        const list = tabListRef.current;
        if (!list) return;

        const focusedEl = document.activeElement;
        if (focusedEl?.getAttribute("role") !== "tab") return;

        const tabs = Array.from(
          list.querySelectorAll<HTMLButtonElement>("[role='tab']")
        );
        const currentIndex = tabs.indexOf(focusedEl as HTMLButtonElement);
        if (currentIndex === -1) return;

        let nextIndex: number | undefined;

        switch (event.key) {
          case "ArrowRight":
            event.preventDefault();
            nextIndex = findNextEnabledTab(tabs, currentIndex, 1);
            break;
          case "ArrowLeft":
            event.preventDefault();
            nextIndex = findNextEnabledTab(tabs, currentIndex, -1);
            break;
          case "Home":
            event.preventDefault();
            nextIndex = findNextEnabledTab(tabs, -1, 1);
            break;
          case "End":
            event.preventDefault();
            nextIndex = findNextEnabledTab(tabs, tabs.length, -1);
            break;
          default:
            return;
        }

        if (nextIndex !== undefined) {
          const nextTab = tabs[nextIndex];
          nextTab.focus();
          if (activationMode === "automatic") {
            const tabValue = nextTab.dataset.value;
            if (tabValue != null) handleChange(tabValue);
          }
        }
      },
      [activationMode, handleChange]
    );

    // Build roving-tabindex info before cloning
    let hasRovingTarget = false;
    let firstEnabledIndex = -1;
    const childMeta: { value?: string; disabled?: boolean }[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props as TabItemProps;
      const itemDisabled = disabled || props.disabled;
      const itemValue = props.value;
      childMeta.push({ value: itemValue, disabled: itemDisabled });
      if (!itemDisabled && itemValue === activeValue) hasRovingTarget = true;
      if (!itemDisabled && firstEnabledIndex === -1)
        firstEnabledIndex = childMeta.length - 1;
    });

    let childIndex = 0;
    const clonedChildren = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      const props = child.props as TabItemProps;
      const itemValue = props.value;
      const itemDisabled = disabled || props.disabled;
      const isChecked = itemValue === activeValue;

      let tabIndex = -1;
      if (isChecked && !itemDisabled) {
        tabIndex = 0;
      } else if (!hasRovingTarget && childIndex === firstEnabledIndex) {
        tabIndex = 0;
      }

      childIndex++;

      return cloneElement(child as ReactElement<TabItemProps>, {
        checked: isChecked,
        disabled: itemDisabled,
        fullWidth,
        tabIndex,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          props.onClick?.(e);
          if (!itemDisabled && itemValue != null && itemValue !== activeValue) {
            handleChange(itemValue);
          }
        },
      });
    });

    return (
      <div
        ref={ref}
        className={cx(styles.tabBar, className)}
        {...rest}
      >
        <RowContainer
          density="md"
          insetLeft={insetLeft}
          insetRight={insetRight}
          surface={surface}
        >
          <div
            ref={tabListRef}
            role="tablist"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className={styles.tabList}
            onKeyDown={handleKeyDown}
          >
            {clonedChildren}
          </div>
          {onAddTab && (
            <button
              type="button"
              className={styles.addButton}
              onClick={onAddTab}
              aria-label="Add tab"
              disabled={disabled}
            >
              <span className={styles.addBase}>
                <Icon name="add" size={ADD_ICON_SIZE} />
              </span>
            </button>
          )}
        </RowContainer>
      </div>
    );
  }
);

TabBar.displayName = "TabBar";
