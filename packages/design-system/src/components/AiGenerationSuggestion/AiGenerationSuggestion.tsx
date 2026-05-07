import { Children, cloneElement, isValidElement, Fragment, type HTMLAttributes, type ReactNode } from "react";
import { RowContainer } from "../RowContainer";
import { Divider } from "../Divider";
import styles from "./AiGenerationSuggestion.module.css";
import { cx } from "../../utils/cx";

/* ── AiGenerationSuggestion ── */

export interface AiGenerationSuggestionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AiGenerationSuggestion({ children, className, ...rest }: AiGenerationSuggestionProps) {
  return (
    <div className={cx(styles.root, className)} {...rest}>
      {children}
    </div>
  );
}

AiGenerationSuggestion.displayName = "AiGenerationSuggestion";

/* ── AiGenerationSuggestionCards ── */

export interface AiGenerationSuggestionCardsProps {
  children: ReactNode;
  fadeSize?: number;
}

export function AiGenerationSuggestionCards({ children, fadeSize }: AiGenerationSuggestionCardsProps) {
  return (
    <RowContainer density="lg" surface="auto" fadeSize={fadeSize}>
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ style?: React.CSSProperties }>, {
              style: { minWidth: 200, ...(child.props as any).style },
            })
          : child,
      )}
    </RowContainer>
  );
}

AiGenerationSuggestionCards.displayName = "AiGenerationSuggestionCards";

/* ── AiGenerationSuggestionEntities ── */

export interface AiGenerationSuggestionEntitiesProps {
  children: ReactNode;
}

export function AiGenerationSuggestionEntities({ children }: AiGenerationSuggestionEntitiesProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const lastIndex = items.length - 1;

  return (
    <div className={styles.entities}>
      {items.map((child, i) => (
        <Fragment key={(child as React.ReactElement).key ?? i}>
          {child}
          {i < lastIndex && <Divider />}
        </Fragment>
      ))}
    </div>
  );
}

AiGenerationSuggestionEntities.displayName = "AiGenerationSuggestionEntities";
