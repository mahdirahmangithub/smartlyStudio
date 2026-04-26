import { Children, cloneElement, isValidElement, type HTMLAttributes, type ReactNode } from "react";
import { Entity } from "../Entity";
import { Icon } from "../Icon";
import { RowContainer } from "../RowContainer";
import styles from "./AiThreadIntro.module.css";
import { cx } from "../../utils/cx";

/* ── AiThreadIntro ── */

export interface AiThreadIntroProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AiThreadIntro({ children, className, ...rest }: AiThreadIntroProps) {
  return (
    <div className={cx(styles.intro, className)} {...rest}>
      {children}
    </div>
  );
}

AiThreadIntro.displayName = "AiThreadIntro";

/* ── AiThreadIntroActions ── */

export interface AiThreadIntroActionsProps {
  children: ReactNode;
  fadeSize?: number;
}

export function AiThreadIntroActions({ children, fadeSize }: AiThreadIntroActionsProps) {
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

AiThreadIntroActions.displayName = "AiThreadIntroActions";

/* ── AiThreadIntroEntities ── */

export interface AiThreadIntroEntityItem {
  key: string;
  title: string;
  leading?: ReactNode;
  /** Defaults to a chevron_right icon */
  persistentActions?: ReactNode;
  onClick?: () => void;
}

export interface AiThreadIntroEntitiesProps {
  items: AiThreadIntroEntityItem[];
}

export function AiThreadIntroEntities({ items }: AiThreadIntroEntitiesProps) {
  return (
    <div className={styles.entities}>
      {items.map((item) => (
        <Entity
          key={item.key}
          title={item.title}
          leading={item.leading}
          persistentActions={item.persistentActions ?? <Icon name="chevron_right" size={16} />}
          onClick={item.onClick}
          className={styles.entity}
        />
      ))}
    </div>
  );
}

AiThreadIntroEntities.displayName = "AiThreadIntroEntities";
