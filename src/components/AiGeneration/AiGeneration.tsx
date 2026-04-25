import type { AiGenerationProps } from "./aiGenerationTypes";
import { Header } from "../Header";
import { Tag } from "../Tag";
import { cx } from "../../utils/cx";
import { getSpacing } from "../../utils/spacing";
import styles from "./AiGeneration.module.css";

export function AiGeneration({
  title,
  description,
  actions,
  children,
  contextTags,
  active = false,
  showVersion = false,
  versionNumber = 1,
  paddingTop,
  paddingBottom,
  insetLeft,
  insetRight,
  suggestion,
  suggestionTitle = "Pick your next step",
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: AiGenerationProps) {
  const hasHeader = title !== undefined || actions !== undefined || description !== undefined;
  const hasContextTags = contextTags && contextTags.length > 0;
  const hasSuggestion = suggestion !== undefined;

  const spacing = getSpacing({ paddingTop, paddingBottom, insetLeft, insetRight });

  return (
    <div
      className={cx(styles.root, spacing.className, className)}
      style={{ ...spacing.style, ...style }}
    >
      <div className={styles.base}>
        <article
          className={cx(styles.card, active && styles.cardActive)}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          data-active={active || undefined}
        >
          <div className={styles.cardInner}>
            {hasHeader && (
              <Header
                size="sm"
                density="sm"
                title={title ?? ""}
                description={description}
                actions={actions}
                className={styles.header}
              />
            )}

            <div className={styles.content}>
              {children}

              {hasContextTags && (
                <ul
                  className={styles.contextRow}
                  aria-label="Generation context"
                >
                  {contextTags.map((tag) => (
                    <li key={tag.id} className={styles.contextTagItem}>
                      <Tag
                        size="md"
                        variant="neutral"
                        emphasis="low"
                        label={tag.label}
                        leadingIcon={tag.leadingIcon}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </article>

        {showVersion && (
          <div
            className={styles.version}
            role="note"
            aria-label={`Version ${versionNumber}`}
          >
            <div
              className={cx(styles.versionBg, active && styles.versionBgActive)}
              aria-hidden="true"
            />
            <span className={cx(styles.versionLabel, styles.versionText, active && styles.versionTextActive)} aria-hidden="true">
              Version
            </span>
            <span className={cx(styles.versionNumber, styles.versionText, active && styles.versionTextActive)} aria-hidden="true">
              {versionNumber}
            </span>
            <div className={styles.versionInnerShadow} aria-hidden="true" />
          </div>
        )}

        {hasSuggestion && (
          <aside className={styles.suggestions} aria-label={suggestionTitle}>
            <div className={styles.suggestionTitle}>
              <TitleText size="2xs" title={suggestionTitle} as="span" />
            </div>
            <div className={styles.suggestionCard}>
              <div className={styles.suggestionCardInner}>
                <div className={styles.suggestionContent}>
                  {suggestion}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
