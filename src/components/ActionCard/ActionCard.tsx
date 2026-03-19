import { forwardRef, type ReactNode } from "react";
import { Card, CardContent, CardBody } from "../Card";
import { Thumbnail } from "../Thumbnail";
import { cx } from "../../utils/cx";
import styles from "./ActionCard.module.css";

export type ActionCardVariant = "outline-hairline" | "elevated";

export interface ActionCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children"> {
  variant?: ActionCardVariant;
  disabled?: boolean;
  icon?: ReactNode;
  title: string;
  description?: string;
}

export const ActionCard = forwardRef<HTMLElement, ActionCardProps>(
  function ActionCard(
    { variant = "outline-hairline", disabled, icon, title, description, className, ...rest },
    ref,
  ) {
    return (
      <Card
        ref={ref}
        variant={variant}
        density="sm"
        radius="md"
        disabled={disabled}
        className={cx(disabled && styles.disabled, className)}
        {...rest}
      >
        <CardContent className={styles.content}>
          <CardBody className={styles.body}>
            {icon && <Thumbnail size="sm" type="icon" icon={icon} className={styles.thumbnail} />}
            <div className={styles.text}>
              <span className={styles.title}>{title}</span>
              {description && (
                <span className={styles.description}>{description}</span>
              )}
            </div>
          </CardBody>
        </CardContent>
      </Card>
    );
  },
);

ActionCard.displayName = "ActionCard";
