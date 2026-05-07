import { useMemo, type HTMLAttributes } from "react";
import { tokenizeLine, type SyntaxToken } from "../../utils/syntaxTokenizer";
import styles from "./InlineCode.module.css";
import syntaxStyles from "../CodeBlock/syntax.module.css";
import { cx } from "../../utils/cx";

export type InlineCodeSize = "sm" | "md" | "lg";

export interface InlineCodeProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The code text to display */
  children: string;
  /** Visual size — matches surrounding text context */
  size?: InlineCodeSize;
  /** Enable syntax highlighting (default false) */
  enableSyntax?: boolean;
}

const SIZE_CLASS: Record<InlineCodeSize, string> = {
  lg: styles.sizeLg,
  md: styles.sizeMd,
  sm: styles.sizeSm,
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

export function InlineCode({
  children,
  size = "md",
  enableSyntax = false,
  className,
  ...rest
}: InlineCodeProps) {
  const tokens = useMemo(
    () => (enableSyntax ? tokenizeLine(children) : null),
    [children, enableSyntax],
  );

  return (
    <code className={cx(styles.root, SIZE_CLASS[size], className)} {...rest}>
      <span className={styles.block} aria-hidden="true" />
      {tokens
        ? tokens.map((t, i) => (
            <span key={i} className={TOKEN_CLASS[t.type]}>
              {t.value}
            </span>
          ))
        : children}
    </code>
  );
}
