import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Header, type HeaderSize, type HeaderDensity } from "../Header";
import { Expander } from "../Expander";
import { IconButton } from "../IconButton";
import { useCollapsible } from "../../hooks/useCollapsible";
import styles from "./Container.module.css";
import { cx } from "../../utils/cx";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type ContainerDensity = "none" | "sm" | "lg";

export interface ContainerProps {
  /** Title text for the header. Omit to render without a header at all. */
  title?: string;
  description?: string;
  headerSize?: HeaderSize;
  headerSlot?: ReactNode;
  headerActions?: ReactNode;
  /** Leading icon next to the title (forwarded to Header → TitleText). */
  titleLeadingIcon?: ReactNode;
  /** Show a divider line below the header. Default true. */
  headerDivider?: boolean;
  onBack?: () => void;

  density?: ContainerDensity;
  /** When true the container uses an elevation shadow; when false it uses an outline border. */
  elevated?: boolean;
  /** Enables collapse/expand behaviour with animated content area. */
  collapsible?: boolean;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled usage. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;

  children?: ReactNode;
  className?: string;
  id?: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   Density mappings
   ═══════════════════════════════════════════════════════════════════════ */

const DENSITY_CLASS: Record<ContainerDensity, string> = {
  none: styles.densityNone,
  sm: styles.densitySm,
  lg: styles.densityLg,
};

function headerDensityFor(density: ContainerDensity): HeaderDensity {
  return density === "lg" ? "lg" : "sm";
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      title,
      description,
      headerSize = "lg",
      headerSlot,
      headerActions,
      titleLeadingIcon,
      headerDivider = true,
      onBack,

      density = "sm",
      elevated = true,
      collapsible = false,
      expanded: expandedProp,
      defaultExpanded = true,
      onExpandedChange,

      children,
      className,
      id,
    },
    ref,
  ) => {
    /* ── Controlled / uncontrolled expand ─────────────────────────── */

    const isControlled = expandedProp !== undefined;
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isExpanded = collapsible
      ? isControlled
        ? expandedProp
        : internalExpanded
      : true;

    const onExpandedChangeRef = useRef(onExpandedChange);
    onExpandedChangeRef.current = onExpandedChange;

    const toggle = useCallback(() => {
      const next = !isExpanded;
      if (!isControlled) setInternalExpanded(next);
      onExpandedChangeRef.current?.(next);
    }, [isExpanded, isControlled]);

    /* ── Collapsible animation ───────────────────────────────────── */

    const { ref: collapseRef } = useCollapsible(isExpanded);

    /* ── IDs ──────────────────────────────────────────────────────── */

    const autoId = useId();
    const titleId = `${id ?? autoId}-title`;
    const descId = `${id ?? autoId}-desc`;

    /* ── Header actions with Expander appended ───────────────────── */

    const resolvedActions = collapsible ? (
      <>
        {headerActions}
        <IconButton
          size="md"
          variant="neutral"
          emphasis="low"
          icon={<Expander expanded={isExpanded} size="sm" />}
          onClick={toggle}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        />
      </>
    ) : (
      headerActions
    );

    /* ── Render ───────────────────────────────────────────────────── */

    const hasHeader = title !== undefined;

    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={hasHeader ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cx(
          styles.root,
          DENSITY_CLASS[density],
          elevated ? styles.elevated : styles.outlined,
          !isExpanded && styles.collapsed,
          className,
        )}
      >
        {hasHeader && (
          <Header
            id={titleId}
            size={headerSize}
            density={headerDensityFor(density)}
            title={title}
            description={description}
            descriptionId={description ? descId : undefined}
            divider={headerDivider}
            slot={headerSlot}
            actions={resolvedActions}
            titleLeadingIcon={titleLeadingIcon}
            onBack={onBack}
          />
        )}

        {collapsible ? (
          <div ref={collapseRef} className={styles.contentCollapsible}>
            <div className={styles.contentInner}>{children}</div>
          </div>
        ) : (
          <div className={styles.content}>{children}</div>
        )}
      </section>
    );
  },
);

Container.displayName = "Container";
