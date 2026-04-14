import {
  useState,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import { TitleText, type TitleTextSize } from "../TitleText";
import { Expander } from "../Expander";
import { ScrollFade } from "../ScrollFade";
import { Divider } from "../Divider";
import { useCollapsible } from "../../hooks/useCollapsible";
import styles from "./Accordion.module.css";
import { cx } from "../../utils/cx";


export interface AccordionHeaderProps {
  /** Title displayed in the header */
  title: ReactNode;
  /** Optional description below the title */
  description?: ReactNode;
  /** Optional leading icon for the TitleText */
  leadingIcon?: ReactNode;
  /** TitleText visual size */
  size?: TitleTextSize;
  /** Whether the accordion is expanded */
  expanded?: boolean;
  /** Whether the header has rounded corners */
  round?: boolean;
  /** Show a bottom divider (ignored when `round` is true) */
  divider?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Called when the header is clicked */
  onClick?: () => void;
  className?: string;
}

export function AccordionHeader({
  title,
  description,
  leadingIcon,
  size = "sm",
  expanded = false,
  round = false,
  divider = true,
  disabled = false,
  onClick,
  className,
}: AccordionHeaderProps) {
  return (
    <button
      type="button"
      className={cx(
        styles.header,
        round && styles.round,
        disabled && styles.disabled,
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-expanded={expanded}
    >
      <div className={styles.titleArea}>
        <TitleText
          size={size}
          title={title}
          description={description}
          leadingIcon={leadingIcon}
        />
      </div>

      <Expander
        expanded={expanded}
        size="lg"
        emphasis="medium"
        disabled={disabled}
      />

      {!round && divider && <Divider className={styles.divider} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   AccordionItem
   ══════════════════════════════════════════════════════════ */

export interface AccordionItemProps {
  /** Title displayed in the header */
  title: ReactNode;
  /** Optional description below the title */
  description?: ReactNode;
  /** Optional leading icon for the TitleText */
  leadingIcon?: ReactNode;
  /** TitleText visual size */
  size?: TitleTextSize;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Default expanded state (uncontrolled) */
  defaultExpanded?: boolean;
  /** Rounded variant */
  round?: boolean;
  /** Show a bottom divider */
  divider?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Called when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Max height (px) for the content area — overflow gets a vertical ScrollFade */
  maxContentHeight?: number;
  /** Content rendered inside the collapsible panel */
  children?: ReactNode;
  className?: string;
}

export function AccordionItem({
  title,
  description,
  leadingIcon,
  size = "sm",
  expanded: expandedProp,
  defaultExpanded = false,
  round = false,
  divider = false,
  disabled = false,
  onExpandedChange,
  maxContentHeight,
  children,
  className,
}: AccordionItemProps) {
  const isControlled = expandedProp !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = isControlled ? expandedProp : internalExpanded;

  const { ref: contentRef } = useCollapsible(expanded);

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !expanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [disabled, expanded, isControlled, onExpandedChange]);

  return (
    <div className={cx(styles.item, round && styles.itemRound, className)}>
      <AccordionHeader
        title={title}
        description={description}
        leadingIcon={leadingIcon}
        size={size}
        expanded={expanded}
        round={round}
        divider={false}
        disabled={disabled}
        onClick={toggle}
      />

      <div
        ref={contentRef}
        role="region"
        className={styles.content}
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
      >
        <div className={styles.contentInner}>
          {maxContentHeight != null ? (
            <ScrollFade
              direction="vertical"
              fadeSize={16}
              style={{ maxHeight: maxContentHeight, height: "auto" }}
              scrollAreaStyle={{ maxHeight: maxContentHeight }}
            >
              {children}
            </ScrollFade>
          ) : (
            children
          )}
        </div>
      </div>

      {divider && <Divider className={styles.itemDivider} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Accordion (group)
   ══════════════════════════════════════════════════════════ */

export type AccordionType = "single" | "multiple";

export interface AccordionProps {
  /** "single" collapses others when one expands; "multiple" allows any combination */
  type?: AccordionType;
  /** Wraps items in a bordered, rounded container with dividers between items */
  border?: boolean;
  /** Default expanded item indices (uncontrolled) */
  defaultExpanded?: number[];
  /** Controlled expanded item indices */
  expanded?: number[];
  /** Called when the set of expanded indices changes */
  onExpandedChange?: (expanded: number[]) => void;
  /** Disable all items */
  disabled?: boolean;
  /** TitleText size forwarded to every item */
  size?: TitleTextSize;
  /** Max content height forwarded to every item */
  maxContentHeight?: number;
  children?: ReactNode;
  className?: string;
}

export function Accordion({
  type = "multiple",
  border = true,
  defaultExpanded = [],
  expanded: expandedProp,
  onExpandedChange,
  disabled,
  size,
  maxContentHeight,
  children,
  className,
}: AccordionProps) {
  const isControlled = expandedProp !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<number[]>(defaultExpanded);
  const expandedIndices = isControlled ? expandedProp : internalExpanded;

  const handleToggle = useCallback(
    (index: number) => {
      const update = (current: number[]): number[] => {
        if (current.includes(index)) return current.filter((i) => i !== index);
        return type === "single" ? [index] : [...current, index];
      };

      if (isControlled) {
        onExpandedChange?.(update(expandedProp!));
      } else {
        setInternalExpanded((prev) => {
          const next = update(prev);
          onExpandedChange?.(next);
          return next;
        });
      }
    },
    [isControlled, expandedProp, type, onExpandedChange]
  );

  const items = Children.toArray(children);

  return (
    <div
      className={cx(
        styles.accordion,
        border && styles.accordionBorder,
        className
      )}
    >
      {items.map((child, index) => {
        if (!isValidElement(child)) return child;

        const isLast = index === items.length - 1;
        const itemProps: Partial<AccordionItemProps> = {
          expanded: expandedIndices.includes(index),
          onExpandedChange: () => handleToggle(index),
          round: !border,
          divider: border && !isLast,
        };
        if (disabled != null) itemProps.disabled = disabled;
        if (size != null) itemProps.size = size;
        if (maxContentHeight != null) itemProps.maxContentHeight = maxContentHeight;

        return cloneElement(
          child as React.ReactElement<AccordionItemProps>,
          itemProps
        );
      })}
    </div>
  );
}
