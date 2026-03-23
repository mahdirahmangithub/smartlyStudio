import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { BodyText, type BodyTextProps } from "../BodyText";
import { Button } from "../Button";
import { Footer, type FooterProps } from "../Footer";
import { Icon } from "../Icon";
import { Checkbox } from "../Checkbox";
import { ProgressiveBlur } from "../ProgressiveBlur";
import { Spinner } from "../Spinner";
import { TitleText, type TitleTextSize } from "../TitleText";
import styles from "./Card.module.css";
import type { ImageryAspectRatio } from "../Imagery";

export type CardVariant = "outline" | "outline-hairline" | "elevated";
export type CardDensity = "sm" | "lg";
export type CardRadius = "xs" | "sm" | "md" | "lg";
export type CardLayout = "vertical" | "horizontal-leading" | "horizontal-trailing";

interface CardContextValue {
  density: CardDensity;
  disabled: boolean;
  inset: boolean;
  layout: CardLayout;
  selected: boolean | undefined;
}

const CardContext = createContext<CardContextValue>({
  density: "sm",
  disabled: false,
  inset: false,
  layout: "vertical",
  selected: undefined,
});

const LAYOUT_CLASS: Record<CardLayout, string | undefined> = {
  vertical: undefined,
  "horizontal-leading": styles.horizontalLeading,
  "horizontal-trailing": styles.horizontalTrailing,
};

const RADIUS_CLASS: Record<CardRadius, string | undefined> = {
  xs: styles.radiusXs,
  sm: styles.radiusSm,
  md: styles.radiusMd,
  lg: undefined,
};

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual style: outline (border) or elevated (shadow) */
  variant?: CardVariant;
  /** Vertical spacing density: sm = 16px, lg = 24px padding-top on content */
  density?: CardDensity;
  /** Border-radius size: xs (4px), sm (8px), md (12px), lg (16px) */
  radius?: CardRadius;
  /** Layout direction: vertical, horizontal-leading, or horizontal-trailing */
  layout?: CardLayout;
  /** Shows the select indicator ring */
  selected?: boolean;
  /** Disabled visual state — no interaction */
  disabled?: boolean;
  /** Non-interactive: no hover, press, or focus styles */
  isStatic?: boolean;
  /** When true, media gets inset padding matching density */
  inset?: boolean;
}

const INTERACTIVE_SELECTORS = "a[href],button,input,select,textarea,[role='button'],[role='checkbox'],[role='radio'],[role='switch'],[role='combobox'],[role='listbox'],[role='menu'],[role='menuitem'],[tabindex='0']";

function isInteractiveChild(target: EventTarget | null, container: HTMLElement): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== container) {
    if (el.matches(INTERACTIVE_SELECTORS)) return true;
    el = el.parentElement;
  }
  return false;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    variant = "outline",
    density = "sm",
    radius = "lg",
    layout = "vertical",
    selected,
    disabled,
    isStatic,
    inset = false,
    className,
    children,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const interactive = !isStatic && !disabled;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isInteractiveChild(e.target, e.currentTarget)) return;
      onClick?.(e);
    },
    [onClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (interactive && onClick && (e.key === "Enter" || e.key === " ")) {
        if (isInteractiveChild(e.target, e.currentTarget)) return;
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    },
    [interactive, onClick, onKeyDown],
  );

  const ctx: CardContextValue = { density, disabled: !!disabled, inset, layout, selected };

  return (
    <CardContext.Provider value={ctx}>
      <article
        ref={ref}
        className={cx(
          styles.card,
          styles[variant],
          RADIUS_CLASS[radius],
          LAYOUT_CLASS[layout],
          selected && styles.selected,
          disabled && styles.disabled,
          isStatic && styles.static,
          className,
        )}
        role={interactive && onClick ? "button" : undefined}
        aria-disabled={disabled || undefined}
        aria-selected={selected != null ? selected : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? handleClick : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
        {...rest}
      >
        {children}
      </article>
    </CardContext.Provider>
  );
});

Card.displayName = "Card";

/* ── CardMedia ── */

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the media container — used in horizontal layouts (e.g., "30%", "200px") */
  width?: string | number;
}

export const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(
  function CardMedia({ width, className, style, children, ...rest }, ref) {
    const { density, inset, layout } = useContext(CardContext);
    const horizontal = layout !== "vertical";
    return (
      <div
        ref={ref}
        className={cx(
          styles.media,
          horizontal && styles.mediaHorizontal,
          inset && styles.mediaInset,
          inset && styles[density],
          className,
        )}
        style={
          horizontal && width != null
            ? { ...style, width }
            : style
        }
        {...rest}
      >
        <div className={cx(styles.mediaInner, !inset && styles.mediaInnerFlush)}>{children}</div>
      </div>
    );
  },
);

CardMedia.displayName = "CardMedia";

/* ── CardMediaContent ── */

export type CardMediaContentType =
  | "image"
  | "icon"
  | "file-type"
  | "font"
  | "loading"
  | "error";

const RATIO_CLASS: Partial<Record<ImageryAspectRatio, string>> = {
  "1:1": styles["ratio-1-1"],
  "3:2": styles["ratio-3-2"],
  "2:3": styles["ratio-2-3"],
  "4:3": styles["ratio-4-3"],
  "3:4": styles["ratio-3-4"],
  "5:4": styles["ratio-5-4"],
  "4:5": styles["ratio-4-5"],
  "16:9": styles["ratio-16-9"],
  "9:16": styles["ratio-9-16"],
  "golden-horizontal": styles["ratio-golden-h"],
  "golden-vertical": styles["ratio-golden-v"],
};

interface CardMediaContentBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio — same values as Imagery (no radius) */
  aspectRatio?: ImageryAspectRatio;
}

interface CardMediaContentImageProps extends CardMediaContentBaseProps {
  type: "image";
  /** img, video, or any media element */
  children: ReactNode;
}

interface CardMediaContentIconProps extends CardMediaContentBaseProps {
  type: "icon";
  /** Icon name from the DS icon set */
  iconName?: string;
}

interface CardMediaContentFileTypeProps extends CardMediaContentBaseProps {
  type: "file-type";
  /** File extension label (e.g., ".pdf", ".docx") */
  extension: string;
}

interface CardMediaContentFontProps extends CardMediaContentBaseProps {
  type: "font";
  /** Preview text to display */
  preview?: string;
}

interface CardMediaContentLoadingProps extends CardMediaContentBaseProps {
  type: "loading";
  /** Loading label text */
  label?: string;
}

interface CardMediaContentErrorProps extends CardMediaContentBaseProps {
  type: "error";
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Retry button click handler */
  onRetry?: () => void;
  /** Retry button label */
  retryLabel?: string;
}

export type CardMediaContentProps =
  | CardMediaContentImageProps
  | CardMediaContentIconProps
  | CardMediaContentFileTypeProps
  | CardMediaContentFontProps
  | CardMediaContentLoadingProps
  | CardMediaContentErrorProps;

export const CardMediaContent = forwardRef<HTMLDivElement, CardMediaContentProps>(
  function CardMediaContent(props, ref) {
    const { type, aspectRatio = "1:1", className, ...rest } = props;
    const { disabled } = useContext(CardContext);

    const ratioClass = aspectRatio !== "free-form" ? RATIO_CLASS[aspectRatio] : undefined;

    const rootClassName = cx(
      styles.mediaContent,
      ratioClass,
      type === "image" && styles.mediaContentImage,
      className,
    );

    if (type === "image") {
      const { children, ...divRest } = rest as Omit<CardMediaContentImageProps, "type" | "aspectRatio" | "className">;
      return (
        <div ref={ref} className={rootClassName} {...divRest}>
          {children}
          {disabled && <div className={styles.mediaContentDisableOverlay} />}
        </div>
      );
    }

    const isError = type === "error";
    const bgClass = isError ? styles.alertBg : styles.brandBg;

    const overlayContent = renderOverlayContent(props, disabled);

    const { ...divRest } = rest as Omit<CardMediaContentBaseProps, "type" | "aspectRatio" | "className">;

    return (
      <div ref={ref} className={rootClassName} {...divRest}>
        <div className={cx(styles.mediaContentOverlay, bgClass, disabled && styles.disabled)}>
          {overlayContent}
        </div>
        {disabled && <div className={styles.mediaContentDisableOverlay} />}
      </div>
    );
  },
);

function renderOverlayContent(props: CardMediaContentProps, disabled: boolean): ReactNode {
  switch (props.type) {
    case "icon": {
      const { iconName = "image" } = props;
      return (
        <span className={styles.mediaContentIcon}>
          <Icon name={iconName as any} size={48} />
        </span>
      );
    }
    case "file-type": {
      const { extension } = props;
      return <span className={styles.mediaContentFileType}>{extension}</span>;
    }
    case "font": {
      const { preview = "Font preview" } = props;
      return <span className={styles.mediaContentFont}>{preview}</span>;
    }
    case "loading": {
      const { label = "Loading..." } = props;
      return (
        <>
          <Spinner size="lg" type={disabled ? "neutral" : "brand"} />
          <span className={styles.mediaContentLoadingLabel}>{label}</span>
        </>
      );
    }
    case "error": {
      const {
        title = "Error",
        description = "Something went wrong",
        onRetry,
        retryLabel = "Retry",
      } = props;
      return (
        <>
          <Icon
            name="warning_fill"
            size={24}
            className={disabled ? styles.mediaContentErrorTitle : undefined}
            style={disabled ? undefined : { color: "var(--text-alert-default)" }}
          />
          <span className={styles.mediaContentErrorTitle}>{title}</span>
          <span className={styles.mediaContentErrorDescription}>{description}</span>
          {onRetry && (
            <Button
              size="sm"
              variant="neutral"
              emphasis="medium"
              onClick={onRetry}
              disabled={disabled}
            >
              {retryLabel}
            </Button>
          )}
        </>
      );
    }
    default:
      return null;
  }
}

CardMediaContent.displayName = "CardMediaContent";

/* ── CardMediaBar ── */

export interface CardMediaBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Left section: action icon buttons (placed after the auto-checkbox when selectable) */
  leading?: ReactNode;
  /** Right section: action icon buttons */
  trailing?: ReactNode;
  /** Callback when the selection checkbox is toggled */
  onSelectChange?: (checked: boolean) => void;
}

export const CardMediaBar = forwardRef<HTMLDivElement, CardMediaBarProps>(
  function CardMediaBar({ leading, trailing, onSelectChange, className, ...rest }, ref) {
    const { selected, disabled } = useContext(CardContext);
    const selectable = selected != null;

    return (
      <div ref={ref} className={cx(styles.mediaBar, className)} data-theme="light" {...rest}>
        <ProgressiveBlur position="top">
          <div className={styles.mediaBarContent}>
            <div className={styles.mediaBarLeading}>
              {selectable && (
                <div className={styles.mediaBarSwitch}>
                  <Checkbox
                    size="lg"
                    checked={!!selected}
                    disabled={disabled}
                    onChange={(checked) => onSelectChange?.(checked)}
                  />
                </div>
              )}
              {leading}
            </div>
            <div className={styles.mediaBarTrailing}>{trailing}</div>
          </div>
        </ProgressiveBlur>
      </div>
    );
  },
);

CardMediaBar.displayName = "CardMediaBar";

/* ── CardContent (body + footer vertical container) ── */

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, children, ...rest }, ref) {
    const { density } = useContext(CardContext);
    return (
      <div
        ref={ref}
        className={cx(styles.content, styles[density], className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

CardContent.displayName = "CardContent";

/* ── CardPretitle ── */

export interface CardPretitleProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardPretitle = forwardRef<HTMLDivElement, CardPretitleProps>(
  function CardPretitle({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cx(styles.pretitle, className)} {...rest}>
        {children}
      </div>
    );
  },
);

CardPretitle.displayName = "CardPretitle";

/* ── CardBody ── */

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  function CardBody({ className, children, ...rest }, ref) {
    const { density } = useContext(CardContext);
    return (
      <div
        ref={ref}
        className={cx(styles.body, styles[density], className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

CardBody.displayName = "CardBody";

/* ── CardSlot (arbitrary children area inside body) ── */

export interface CardSlotProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardSlot = forwardRef<HTMLDivElement, CardSlotProps>(
  function CardSlot({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={className} {...rest}>
        {children}
      </div>
    );
  },
);

CardSlot.displayName = "CardSlot";

/* ── CardFooter ── */

export type CardFooterProps = Omit<FooterProps, "density">;

export const CardFooter = forwardRef<HTMLElement, CardFooterProps>(
  function CardFooter({ className, ...rest }, ref) {
    const { density } = useContext(CardContext);
    return (
      <Footer
        ref={ref}
        density={density}
        className={cx(styles.footer, className)}
        {...rest}
      />
    );
  },
);

CardFooter.displayName = "CardFooter";

/* ── CardTitle ── */

export type CardTitleSize = "sm" | "md" | "lg";

const TITLE_SIZE_MAP: Record<CardTitleSize, TitleTextSize> = {
  lg: "md",
  md: "sm",
  sm: "2xs",
};

export interface CardTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Visual size — controls typography and gap */
  size?: CardTitleSize;
  /** Title text content */
  title: ReactNode;
  /** Optional leading element (icon, thumbnail, avatar) */
  leading?: ReactNode;
  /** Optional trailing slot (action buttons, badges, etc.) */
  trailing?: ReactNode;
}

export const CardTitle = forwardRef<HTMLDivElement, CardTitleProps>(
  function CardTitle(
    { size = "md", title, leading, trailing, className, ...rest },
    ref,
  ) {
    const { disabled } = useContext(CardContext);
    return (
      <div
        ref={ref}
        className={cx(
          styles.cardTitle,
          styles[size],
          disabled && styles.cardTitleDisabled,
          className,
        )}
        {...rest}
      >
        {leading && (
          <div className={styles.cardTitleLeading}>{leading}</div>
        )}
        <div className={styles.cardTitleText}>
          <TitleText size={TITLE_SIZE_MAP[size]} title={title} as="h3" />
        </div>
        {trailing && (
          <div className={styles.cardTitleTrailing}>{trailing}</div>
        )}
      </div>
    );
  },
);

CardTitle.displayName = "CardTitle";

/* ── CardDescription ── */

export type CardDescriptionProps = Omit<BodyTextProps, "size" | "emphasis" | "lineClamp"> &
  Partial<Pick<BodyTextProps, "size" | "emphasis" | "lineClamp">>;

export function CardDescription({
  size = "lg",
  emphasis = "medium",
  lineClamp = 6,
  className,
  children,
  ...rest
}: CardDescriptionProps) {
  const { disabled } = useContext(CardContext);
  return (
    <BodyText
      size={size}
      emphasis={emphasis}
      lineClamp={lineClamp}
      className={cx(disabled && styles.cardDescriptionDisabled, className)}
      {...rest}
    >
      {children}
    </BodyText>
  );
}
