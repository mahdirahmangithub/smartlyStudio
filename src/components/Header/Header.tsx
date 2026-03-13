import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { BodyText, type BodyTextSize } from "../BodyText";
import { Divider } from "../Divider";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { RowContainer } from "../RowContainer";
import { TitleText, type TitleTextSize } from "../TitleText";
import type { ButtonSize } from "../Button";
import styles from "./Header.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type HeaderSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type HeaderDensity = "sm" | "lg";

export interface HeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "slot"> {
  /** Visual size of the header */
  size?: HeaderSize;
  /** Density — sm is compact (16px padding), lg is spacious (24px padding) */
  density?: HeaderDensity;
  /** Title text */
  title: string;
  /** Description text below the title */
  description?: string;
  /** Leading thumbnail element (typically Thumbnail component) */
  thumbnail?: ReactNode;
  /** Callback for back button — shows a back chevron when provided */
  onBack?: () => void;
  /** Callback for close button — shows an X icon when provided */
  onClose?: () => void;
  /** Custom slot content between title and actions */
  slot?: ReactNode;
  /** Action area (typically RowContainer with Button components) */
  actions?: ReactNode;
  /** Show bottom divider */
  divider?: boolean;
}

const sizeClass: Record<HeaderSize, string> = {
  "2xl": styles.size2xl,
  xl: styles.sizeXl,
  lg: styles.sizeLg,
  md: styles.sizeMd,
  sm: styles.sizeSm,
};

const titleSizeMap: Record<HeaderSize, TitleTextSize> = {
  "2xl": "xl",
  xl: "lg",
  lg: "sm",
  md: "xs",
  sm: "2xs",
};

const bodySizeMap: Record<HeaderSize, BodyTextSize> = {
  "2xl": "lg",
  xl: "lg",
  lg: "md",
  md: "md",
  sm: "sm",
};

const iconButtonSizeMap: Record<HeaderSize, ButtonSize> = {
  "2xl": "md",
  xl: "md",
  lg: "md",
  md: "md",
  sm: "sm",
};

export const Header = forwardRef<HTMLElement, HeaderProps>(
  function Header(
    {
      size = "lg",
      density = "sm",
      title,
      description,
      thumbnail,
      onBack,
      onClose,
      slot,
      actions,
      divider = false,
      className,
      ...rest
    },
    ref,
  ) {
    const hasLeading = thumbnail != null || onBack != null;
    const btnSize = iconButtonSizeMap[size];

    return (
      <header
        ref={ref}
        className={cx(
          styles.root,
          sizeClass[size],
          density === "lg" && styles.densityLg,
          divider && styles.hasDivider,
          className,
        )}
        {...rest}
      >
        <div className={styles.content}>
          <div className={styles.titleActions}>
            {onBack && (
              <IconButton
                size={btnSize}
                variant="neutral"
                emphasis="low"
                icon={<Icon name="chevron_left" size={16} />}
                aria-label="Back"
                onClick={onBack}
              />
            )}

            {thumbnail && (
              <span className={styles.thumbnail}>{thumbnail}</span>
            )}

            <div className={styles.title}>
              <TitleText size={titleSizeMap[size]} title={title} as="h2" />
            </div>

            {(slot || actions || onClose) && (
              <span className={styles.rightGroup}>
                {slot && (
                  <RowContainer density="md">{slot}</RowContainer>
                )}
                {actions && (
                  <RowContainer density="md">{actions}</RowContainer>
                )}
                {onClose && (
                  <IconButton
                    size={btnSize}
                    variant="neutral"
                    emphasis="low"
                    icon={<Icon name="close" size={16} />}
                    aria-label="Close"
                    onClick={onClose}
                  />
                )}
              </span>
            )}
          </div>

          {description && (
            <div className={styles.descriptionRow}>
              {hasLeading && <span className={styles.descriptionSpacer} />}
              <div className={styles.descriptionText}>
                <BodyText size={bodySizeMap[size]} emphasis="medium">
                  {description}
                </BodyText>
              </div>
            </div>
          )}
        </div>

        {divider && (
          <div className={styles.divider}>
            <Divider />
          </div>
        )}
      </header>
    );
  },
);

Header.displayName = "Header";
