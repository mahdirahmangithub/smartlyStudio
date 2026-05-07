import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Illustration, type IllustrationType } from "../Illustration";
import { Button, type ButtonProps } from "../Button";
import { Accordion, AccordionItem } from "../Accordion";
import { Icon } from "../Icon";
import styles from "./EmptyState.module.css";

export type EmptyStateSize = "sm" | "md" | "lg";
export type EmptyStateEmphasis = "high" | "low";

export interface EmptyStatePrimaryAction {
  label: string;
  onClick?: () => void;
  /** Leading icon rendered inside the button */
  icon?: ReactNode;
}

export interface EmptyStateSecondaryAction {
  label: string;
  onClick?: () => void;
  /** Leading icon rendered inside the button */
  icon?: ReactNode;
}

export interface EmptyStateDetail {
  /** Title shown in the accordion header */
  title?: string;
  /** Leading icon in the accordion header */
  icon?: ReactNode;
  /** Content rendered inside the collapsible panel */
  children: ReactNode;
}

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  /** sm = compact, md = medium, lg = large */
  size?: EmptyStateSize;
  /** high = brand-filled primary button, low = outline neutral primary button */
  emphasis?: EmptyStateEmphasis;
  /** Illustration type to show above the text */
  illustration?: IllustrationType;
  /** Title text (always required) */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Primary action button config */
  primaryAction?: EmptyStatePrimaryAction;
  /** Secondary action button config */
  secondaryAction?: EmptyStateSecondaryAction;
  /** Collapsible detail accordion at the bottom */
  detail?: EmptyStateDetail;
  /** Optional max-width constraint for the component */
  maxWidth?: number | string;
}

const BUTTON_SIZE_MAP: Record<EmptyStateSize, ButtonProps["size"]> = {
  sm: "md",
  md: "lg",
  lg: "lg",
};

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(
  (
    {
      size = "sm",
      emphasis = "high",
      illustration,
      title,
      description,
      primaryAction,
      secondaryAction,
      detail,
      maxWidth,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const headingId = useId();
    const illustrationSize = size === "sm" ? "sm" : "lg";
    const buttonSize = BUTTON_SIZE_MAP[size];
    const hasActions = primaryAction || secondaryAction;

    const rootStyle = maxWidth
      ? { ...style, maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth }
      : style;

    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cx(styles.emptyState, className)}
        style={rootStyle}
        {...rest}
      >
        <div className={cx(styles.base, styles[size])}>
          {illustration && (
            <Illustration
              type={illustration}
              size={illustrationSize}
              role="presentation"
              aria-hidden="true"
            />
          )}

          <div className={cx(styles.content, styles[size])}>
            <div className={cx(styles.text, styles[size])}>
              <h2
                id={headingId}
                className={cx(styles.title, styles[size])}
              >
                {title}
              </h2>
              {description && (
                <p className={cx(styles.description, styles[size])}>
                  {description}
                </p>
              )}
            </div>

            {hasActions && (
              <div
                role="group"
                aria-label="Actions"
                className={cx(styles.actions, styles[size])}
              >
                {primaryAction && (
                  <Button
                    size={buttonSize}
                    variant={emphasis === "high" ? "brand" : "neutral"}
                    emphasis={emphasis === "high" ? "high" : "medium"}
                    leadingIcon={primaryAction.icon}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    size={buttonSize}
                    variant="brand"
                    emphasis="low"
                    leadingIcon={secondaryAction.icon}
                    onClick={secondaryAction.onClick}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}

            {detail && (
              <div className={styles.detail}>
                <Accordion border type="single">
                  <AccordionItem
                    title={detail.title ?? "Show technical details"}
                    leadingIcon={
                      detail.icon ?? <Icon name="help" size={20} />
                    }
                  >
                    {detail.children}
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

EmptyState.displayName = "EmptyState";
