import {
  useState,
  useRef,
  useCallback,
  useEffect,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import { TitleText, type TitleTextSize } from "../TitleText";
import { Expander } from "../Expander";
import { ScrollFade } from "../ScrollFade";
import styles from "./Accordion.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

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

      {!round && divider && <span className={styles.divider} aria-hidden="true" />}
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

  const contentRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !expanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [disabled, expanded, isControlled, onExpandedChange]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (initialRender.current) {
      initialRender.current = false;
      el.style.height = expanded ? "auto" : "0px";
      el.style.opacity = expanded ? "var(--opacity-100)" : "var(--opacity-0)";
      return;
    }

    if (expanded) {
      el.style.transition = "none";
      el.style.height = "auto";
      el.style.opacity = "var(--opacity-100)";
      const fullHeight = el.scrollHeight;

      el.style.height = "0px";
      el.style.opacity = "var(--opacity-0)";

      requestAnimationFrame(() => {
        el.style.transition = `height var(--animation-state-expand-duration) var(--animation-state-expand-easing), opacity var(--animation-state-expand-duration) var(--animation-state-expand-easing)`;
        el.style.height = `${fullHeight}px`;
        el.style.opacity = "var(--opacity-100)";
      });
      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== "height") return;
        el.style.height = "auto";
        el.removeEventListener("transitionend", onEnd);
      };
      el.addEventListener("transitionend", onEnd);
    } else {
      el.style.height = `${el.scrollHeight}px`;
      el.style.transition = "none";
      requestAnimationFrame(() => {
        el.style.transition = `height var(--animation-state-collapse-duration) var(--animation-state-collapse-easing), opacity var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)`;
        el.style.height = "0px";
        el.style.opacity = "var(--opacity-0)";
      });
    }
  }, [expanded]);

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
      >
        <div className={styles.contentInner}>
          {maxContentHeight != null ? (
            <ScrollFade
              direction="vertical"
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

      {divider && <span className={styles.itemDivider} aria-hidden="true" />}
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
