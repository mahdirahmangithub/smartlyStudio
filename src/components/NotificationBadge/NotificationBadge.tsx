import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { detectSurface, SURFACE_TOKENS, type SurfaceType } from "../../utils/detectSurface";
import styles from "./NotificationBadge.module.css";
import { cx } from "../../utils/cx";

export type NotificationBadgeSize = "xs" | "sm" | "md" | "lg";
export type NotificationBadgeType =
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "alert";
export type NotificationBadgeEmphasis = "medium" | "high";
export type NotificationBadgeSurface = SurfaceType;

export interface NotificationBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  size?: NotificationBadgeSize;
  variant?: NotificationBadgeType;
  emphasis?: NotificationBadgeEmphasis;
  /** Show an outline ring that matches the parent surface background */
  outline?: boolean;
  /** Which surface background the outline should match. "auto" walks up the DOM to detect. */
  surface?: NotificationBadgeSurface;
  /** Icon content — renders the badge in icon mode */
  icon?: ReactNode;
}


export const NotificationBadge = forwardRef<
  HTMLSpanElement,
  NotificationBadgeProps
>(
  (
    {
      size = "sm",
      variant = "neutral",
      emphasis = "high",
      outline = false,
      surface = "auto",
      icon,
      children,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const innerRef = useRef<HTMLSpanElement>(null);
    const [resolvedSurface, setResolvedSurface] = useState<string>(
      surface === "auto" ? "default" : surface
    );

    const mergedRef = useCallback(
      (node: HTMLSpanElement | null) => {
        (innerRef as React.MutableRefObject<HTMLSpanElement | null>).current =
          node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLSpanElement | null>).current =
            node;
      },
      [ref]
    );

    useEffect(() => {
      if (!outline) return;
      if (surface !== "auto") {
        setResolvedSurface(surface);
        return;
      }
      const el = innerRef.current;
      if (!el) return;
      setResolvedSurface(detectSurface(el));
    }, [outline, surface]);

    const contentMode = children != null ? "text" : icon != null ? "icon" : "none";
    const isDot = contentMode === "none";

    const outlineColor = outline
      ? `var(${SURFACE_TOKENS[resolvedSurface]})`
      : undefined;

    return (
      <span
        ref={mergedRef}
        className={cx(
          styles.badge,
          isDot ? styles.dot : styles.withContent,
          styles[size],
          styles[variant],
          styles[emphasis],
          outline && styles.hasOutline,
          className
        )}
        style={
          outlineColor
            ? { ...style, "--_nb-outline-color": outlineColor } as React.CSSProperties
            : style
        }
        {...rest}
      >
        {contentMode === "icon" && (
          <span className={styles.iconSlot}>{icon}</span>
        )}

        {contentMode === "text" && (
          <span className={styles.label}>{children}</span>
        )}
      </span>
    );
  }
);

NotificationBadge.displayName = "NotificationBadge";
