import { useMemo } from "react";
import { tokenizeLine, type SyntaxToken } from "../../utils/syntaxTokenizer";
import styles from "./CodeLine.module.css";
import syntaxStyles from "./syntax.module.css";
import { cx } from "../../utils/cx";

export type CodeBlockSize = "sm" | "md" | "lg";

export type HighlightType =
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "alert";

export interface CodeLineHighlight {
  type?: HighlightType;
  indicator?: boolean;
}

export interface CodeLineProps {
  code: string;
  size?: CodeBlockSize;
  highlight?: CodeLineHighlight;
  /** Render a 32px gutter spacer (used when line numbers are shown in a separate column) */
  showGutter?: boolean;
  enableSyntax?: boolean;
}

const SIZE_CLASS: Record<CodeBlockSize, string> = {
  lg: styles.sizeLg,
  md: styles.sizeMd,
  sm: styles.sizeSm,
};

const HIGHLIGHT_CLASS: Record<HighlightType, string> = {
  neutral: styles.highlightNeutral,
  brand: styles.highlightBrand,
  info: styles.highlightInfo,
  success: styles.highlightSuccess,
  warning: styles.highlightWarning,
  alert: styles.highlightAlert,
};

const TOKEN_CLASS: Record<SyntaxToken["type"], string> = {
  keyword: syntaxStyles.keyword,
  string: syntaxStyles.string,
  comment: syntaxStyles.comment,
  number: syntaxStyles.number,
  operator: syntaxStyles.operator,
  punctuation: syntaxStyles.punctuation,
  function: syntaxStyles.function,
  template: syntaxStyles.template,
  interpolation: syntaxStyles.interpolation,
  plain: syntaxStyles.plain,
};

export function CodeLine({
  code,
  size = "md",
  highlight,
  showGutter = false,
  enableSyntax = true,
}: CodeLineProps) {
  const tokens = useMemo(
    () => (enableSyntax ? tokenizeLine(code) : null),
    [code, enableSyntax],
  );

  const highlightType = highlight?.type ?? "neutral";
  const showIndicator = highlight?.indicator !== false;

  return (
    <div className={styles.root}>
      {showGutter && <div className={styles.gutter} aria-hidden="true" />}

      <code className={cx(styles.code, SIZE_CLASS[size])}>
        {highlight && (
          <div
            className={cx(styles.highlight, HIGHLIGHT_CLASS[highlightType])}
            aria-hidden="true"
          >
            {showIndicator && <div className={styles.highlightIndicator} />}
            <div className={styles.highlightBackground} />
          </div>
        )}
        {tokens
          ? tokens.map((t, i) => (
              <span key={i} className={TOKEN_CLASS[t.type]}>
                {t.value}
              </span>
            ))
          : code}
      </code>
    </div>
  );
}
