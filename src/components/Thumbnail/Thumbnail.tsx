import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "../Icon";
import { Imagery } from "../Imagery";
import { Spinner, type SpinnerSize } from "../Spinner";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./Thumbnail.module.css";

export type ThumbnailSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ThumbnailType = "media" | "icon" | "text";

export interface ThumbnailProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  size?: ThumbnailSize;
  type?: ThumbnailType;
  error?: boolean;
  loading?: boolean;
  video?: boolean;
  /** Image source — required for type="media" */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Custom icon — used when type="icon" */
  icon?: ReactNode;
  /** Text content — used when type="text" (e.g. "+7") */
  text?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const SIZE_CLASS: Record<ThumbnailSize, string> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  "2xl": styles.xxl,
};

const ICON_SIZE: Record<ThumbnailSize, number> = {
  xs: 16,
  sm: 16,
  md: 24,
  lg: 24,
  xl: 24,
  "2xl": 24,
};

const SPINNER_SIZE: Record<ThumbnailSize, SpinnerSize> = {
  xs: "sm",
  sm: "md",
  md: "lg",
  lg: "lg",
  xl: "xl",
  "2xl": "xl",
};

const PLAY_ICON_SIZE: Record<ThumbnailSize, number> = {
  xs: 12,
  sm: 12,
  md: 16,
  lg: 16,
  xl: 16,
  "2xl": 16,
};

const TEXT_CLASS: Record<ThumbnailSize, string> = {
  xs: styles.textSm,
  sm: styles.textSm,
  md: styles.textSm,
  lg: styles.textLg,
  xl: styles.textLg,
  "2xl": styles.textLg,
};

export const Thumbnail = forwardRef<HTMLDivElement, ThumbnailProps>(
  (
    {
      size = "md",
      type = "media",
      error = false,
      loading = false,
      video = false,
      src,
      alt = "",
      icon,
      text = "",
      className,
      ...rest
    },
    ref
  ) => {
    const isMedia = type === "media";
    const showError = error && !isMedia;
    const [textRef, isTextTruncated] = useIsTruncated<HTMLSpanElement>(text);

    return (
      <div
        ref={ref}
        className={cx(
          styles.thumbnail,
          SIZE_CLASS[size],
          isMedia && styles.media,
          showError && styles.error,
          className
        )}
        {...rest}
      >
        {/* media content */}
        {isMedia && !error && src && (
          <Imagery
            src={src}
            alt={alt}
            aspectRatio="1:1"
            radius="none"
            objectFit="cover"
            className={styles.imagery}
          />
        )}

        {/* icon content */}
        {type === "icon" && !showError && (
          <div className={styles.content}>
            <span className={styles.iconSlot}>
              {icon || <Icon name="favorite_fill" size={ICON_SIZE[size]} />}
            </span>
          </div>
        )}

        {/* text content */}
        {type === "text" && !showError && (
          <Tooltip label={text} disabled={!isTextTruncated} placement="top" type="inverse" showTail={false}>
            <div className={styles.content}>
              <span ref={textRef} className={cx(styles.text, TEXT_CLASS[size])}>{text}</span>
            </div>
          </Tooltip>
        )}

        {/* error state (icon & text types only) */}
        {showError && (
          <div className={styles.content}>
            <span className={styles.errorIcon}>
              <Icon name="warning_fill" size={ICON_SIZE[size]} />
            </span>
          </div>
        )}

        {/* loading overlay */}
        {loading && !showError && (
          <div data-theme="light" className={styles.forceLight}>
            <div className={styles.loading}>
              <Spinner size={SPINNER_SIZE[size]} type="inverse" />
            </div>
          </div>
        )}

        {/* video badge (media only) */}
        {isMedia && video && !error && (
          <div data-theme="light" className={styles.forceLight}>
            <div className={styles.videoBadge}>
              <span className={styles.playIcon}>
                <Icon name="play_arrow_fill" size={PLAY_ICON_SIZE[size]} />
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Thumbnail.displayName = "Thumbnail";
