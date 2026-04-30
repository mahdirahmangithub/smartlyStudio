import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CodeLine,
  type CodeBlockSize,
  type HighlightType,
} from "./CodeLine";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import styles from "./CodeBlock.module.css";
import { cx } from "../../utils/cx";

export type { CodeBlockSize, HighlightType } from "./CodeLine";

export interface LineHighlight {
  /** 1-based line number */
  line: number;
  type?: HighlightType;
  indicator?: boolean;
}

export interface CodeBlockProps {
  /** The code string to display */
  code: string;
  /** Visual size — affects font size and line height */
  size?: CodeBlockSize;
  /** Show line numbers in the gutter */
  showLineNumbers?: boolean;

  /** Header title */
  title?: string;
  /** Header description (e.g. language name) */
  description?: string;
  /** Header action area (e.g. copy button) */
  actions?: ReactNode;

  /** Lines to highlight (1-based) */
  highlights?: LineHighlight[];

  /** Number of visible lines before "Show more" is shown. Omit for no truncation. */
  visibleLines?: number;
  /** Called when "Show more" is clicked. If omitted, expand is handled internally. */
  onShowMore?: () => void;

  /** Label for the current version (e.g. "Version 1") */
  versionLabel?: string;
  /** Called when the version label button is clicked (e.g. to open a version picker dropdown) */
  onVersionClick?: () => void;
  /** Ref forwarded to the version label button (useful as dropdown anchor) */
  versionRef?: React.RefObject<HTMLButtonElement | null>;
  onPrevVersion?: () => void;
  onNextVersion?: () => void;
  hasPrevVersion?: boolean;
  hasNextVersion?: boolean;

  /** Language hint for tokenizer (reserved for future use) */
  language?: string;
  /** Enable syntax highlighting (default true) */
  enableSyntax?: boolean;
  /** Wrap long lines inside the block instead of overflowing horizontally. */
  wrapLines?: boolean;

  className?: string;
  id?: string;
}

const SIZE_ROOT_CLASS: Record<CodeBlockSize, string> = {
  lg: styles.sizeLg,
  md: styles.sizeMd,
  sm: styles.sizeSm,
};

const LINE_NUM_SIZE_CLASS: Record<CodeBlockSize, string> = {
  lg: styles.lineNumLg,
  md: styles.lineNumMd,
  sm: styles.lineNumSm,
};

export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(
  function CodeBlock(
    {
      code,
      size = "md",
      showLineNumbers = false,

      title,
      description,
      actions,

      highlights,

      visibleLines,
      onShowMore,

      versionLabel,
      onVersionClick,
      versionRef,
      onPrevVersion,
      onNextVersion,
      hasPrevVersion = false,
      hasNextVersion = false,

      enableSyntax = true,
      wrapLines = false,

      className,
      id,
    },
    ref,
  ) {
    const lines = useMemo(() => code.split("\n"), [code]);

    const highlightMap = useMemo(() => {
      if (!highlights?.length) return null;
      const map = new Map<number, { type: HighlightType; indicator: boolean }>();
      for (const h of highlights) {
        map.set(h.line, {
          type: h.type ?? "neutral",
          indicator: h.indicator !== false,
        });
      }
      return map;
    }, [highlights]);

    const [expanded, setExpanded] = useState(false);
    const hasShowMore = visibleLines != null && !expanded && lines.length > visibleLines;
    const displayedLines = hasShowMore ? lines.slice(0, visibleLines) : lines;

    const handleShowMore = () => {
      if (onShowMore) {
        onShowMore();
      } else {
        setExpanded(true);
      }
    };

    const hasHeader = title != null;
    const hasVersion = versionLabel != null;
    const autoId = useId();
    const titleId = hasHeader ? `${id ?? autoId}-title` : undefined;

    const versionControls = hasVersion && (
      <nav className={styles.versionSwitch} aria-label="Version navigation">
        <IconButton
          size="md"
          variant="neutral"
          emphasis="low"
          icon={<Icon name="chevron_left" size={16} />}
          aria-label="Previous version"
          onClick={onPrevVersion}
          disabled={!hasPrevVersion}
        />
        <Button
          ref={versionRef}
          variant="neutral"
          emphasis="low"
          size="md"
          aria-haspopup="listbox"
          onClick={onVersionClick}
        >
          <span aria-live="polite">{versionLabel}</span>
        </Button>
        <IconButton
          size="md"
          variant="neutral"
          emphasis="low"
          icon={<Icon name="chevron_right" size={16} />}
          aria-label="Next version"
          onClick={onNextVersion}
          disabled={!hasNextVersion}
        />
      </nav>
    );

    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={titleId}
        aria-label={hasHeader ? undefined : "Code block"}
        className={cx(styles.root, SIZE_ROOT_CLASS[size], className)}
      >
        {/* Sticky replica of the actions, rendered as a direct child of root
            so root's `overflow: clip` confines it visually to the codeblock
            (no overshoot past the codeblock's bottom). The replica reserves
            its own box height in CSS but cancels its flow impact via a
            negative `margin-bottom`, so the header isn't pushed down — see
            `.stickyReplica` for details. The original actions stay in the
            header as a layout placeholder (opacity: 0, pointer-events: none)
            while the replica owns the visual + interactive copy. */}
        {hasHeader && actions && (
          <div className={styles.stickyReplica}>
            {actions}
          </div>
        )}
        {hasHeader && (
          <header className={styles.header}>
            <div className={styles.headerText}>
              <h2 id={titleId} className={styles.headerTitle}>{title}</h2>
              {description && (
                <p className={styles.headerDescription}>{description}</p>
              )}
            </div>
            {actions && (
              <div className={styles.headerActions} aria-hidden="true">
                {actions}
              </div>
            )}
          </header>
        )}

        <div className={cx(styles.codeSection, wrapLines && styles.codeSectionWrap)}>
          {showLineNumbers && (
            <div className={styles.lineNumbers} aria-hidden="true">
              {displayedLines.map((_, i) => (
                <span
                  key={i}
                  className={cx(styles.lineNum, LINE_NUM_SIZE_CLASS[size])}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          )}

          <pre className={styles.codeLines}>
            {displayedLines.map((line, i) => {
              const lineNum = i + 1;
              const hl = highlightMap?.get(lineNum);
              return (
                <CodeLine
                  key={i}
                  code={line}
                  size={size}
                  showGutter={showLineNumbers}
                  highlight={hl ? { type: hl.type, indicator: hl.indicator } : undefined}
                  enableSyntax={enableSyntax}
                  wrap={wrapLines}
                />
              );
            })}
          </pre>
        </div>

        {hasShowMore && (
          <div className={styles.showMore}>
            <div className={styles.showMoreFader} aria-hidden="true">
              <div className={styles.showMoreFaderBlur} />
              <div className={styles.showMoreFaderColor} />
            </div>
            <div className={styles.showMoreFader} style={{ top: 16 }} aria-hidden="true">
              <div className={styles.showMoreFaderBlur} />
              <div className={styles.showMoreFaderColor} />
            </div>
            <Button
              variant="neutral"
              emphasis="low"
              size="md"
              trailingIcon={<Icon name="arrow_chevron_down" size={16} />}
              onClick={handleShowMore}
              className={styles.showMoreBtn}
              aria-expanded={false}
            >
              Show more
            </Button>
            <div className={styles.showMoreMask} aria-hidden="true" />
          </div>
        )}

        {hasVersion && versionControls}
      </section>
    );
  },
);

CodeBlock.displayName = "CodeBlock";
