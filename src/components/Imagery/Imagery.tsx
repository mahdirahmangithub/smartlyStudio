import {
  forwardRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";
import styles from "./Imagery.module.css";

export type ImageryAspectRatio =
  | "1:1"
  | "3:2"
  | "2:3"
  | "4:3"
  | "3:4"
  | "5:4"
  | "4:5"
  | "16:9"
  | "9:16"
  | "golden-horizontal"
  | "golden-vertical"
  | "free-form";

export type ImageryRadius = "none" | "xs" | "sm" | "md" | "lg" | "full";

export type ImageryObjectFit =
  | "cover"
  | "contain"
  | "fill"
  | "none"
  | "scale-down";

export interface ImageryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  src: string;
  alt: string;
  aspectRatio?: ImageryAspectRatio;
  radius?: ImageryRadius;
  objectFit?: ImageryObjectFit;
  loading?: "lazy" | "eager";
  /** Content shown when the image fails to load */
  fallback?: ReactNode;
  onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Pass-through props for the inner <img> element */
  imgProps?: Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "loading" | "onError" | "onLoad"
  >;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const RATIO_CLASS: Record<string, string> = {
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

const RADIUS_CLASS: Record<ImageryRadius, string> = {
  none: styles["radius-none"],
  xs: styles["radius-xs"],
  sm: styles["radius-sm"],
  md: styles["radius-md"],
  lg: styles["radius-lg"],
  full: styles["radius-full"],
};

const FIT_CLASS: Partial<Record<ImageryObjectFit, string>> = {
  contain: styles.contain,
  fill: styles.fill,
  none: styles.none,
  "scale-down": styles.scaleDown,
};

export const Imagery = forwardRef<HTMLDivElement, ImageryProps>(
  (
    {
      src,
      alt,
      aspectRatio = "1:1",
      radius = "none",
      objectFit = "cover",
      loading = "lazy",
      fallback,
      onError,
      onLoad,
      imgProps,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);

    const handleError = useCallback(
      (e: SyntheticEvent<HTMLImageElement, Event>) => {
        setHasError(true);
        onError?.(e);
      },
      [onError]
    );

    const handleLoad = useCallback(
      (e: SyntheticEvent<HTMLImageElement, Event>) => {
        setHasError(false);
        onLoad?.(e);
      },
      [onLoad]
    );

    const ratioClass = RATIO_CLASS[aspectRatio];
    const radiusClass = RADIUS_CLASS[radius];

    return (
      <div
        ref={ref}
        role="img"
        aria-label={alt}
        className={cx(
          styles.imagery,
          ratioClass,
          radiusClass,
          className
        )}
        style={style}
        {...rest}
      >
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={handleError}
          onLoad={handleLoad}
          className={cx(styles.img, FIT_CLASS[objectFit])}
          {...imgProps}
        />

        {hasError && fallback && (
          <span className={styles.fallback} aria-hidden="true">
            {fallback}
          </span>
        )}
      </div>
    );
  }
);

Imagery.displayName = "Imagery";
