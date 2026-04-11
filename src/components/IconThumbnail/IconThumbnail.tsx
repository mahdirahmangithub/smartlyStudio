import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  type HTMLAttributes,
  type CSSProperties,
} from "react";
import { Icon, type IconName } from "../Icon";
import { Tooltip } from "../Tooltip";
import { detectSurface, surfaceTokenVar, type SurfaceType } from "../../utils/detectSurface";
import styles from "./IconThumbnail.module.css";
import { cx } from "../../utils/cx";

export type IconThumbnailSize = "sm" | "md" | "lg";

export interface IconThumbnailProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Icon to render inside the chip */
  icon: IconName;
  /** Size variant */
  size?: IconThumbnailSize;
  /** Show an outline ring that adapts to the parent surface background */
  outline?: boolean;
  /** Which surface background the outline should match. "auto" walks up the DOM to detect. */
  surface?: SurfaceType;
  /** Tooltip label shown on hover */
  tooltip?: string;
}

const ICON_SIZE: Record<IconThumbnailSize, number> = {
  lg: 20,
  md: 16,
  sm: 12,
};

export const IconThumbnail = forwardRef<HTMLSpanElement, IconThumbnailProps>(
  (
    {
      icon,
      size = "lg",
      outline = true,
      surface = "auto",
      tooltip,
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
        (innerRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
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

    const outlineColor = outline ? surfaceTokenVar(resolvedSurface) : undefined;

    const mergedStyle: CSSProperties | undefined = outlineColor
      ? ({ ...style, "--_it-outline-color": outlineColor } as CSSProperties)
      : style;

    const chip = (
      <span
        ref={mergedRef}
        className={cx(
          styles.thumbnail,
          styles[size],
          outline && styles.hasOutline,
          className
        )}
        style={mergedStyle}
        aria-hidden={!tooltip ? "true" : undefined}
        {...rest}
      >
        <Icon name={icon} size={ICON_SIZE[size]} />
      </span>
    );

    if (tooltip) {
      return (
        <Tooltip label={tooltip} placement="top" type="inverse" showTail={false}>
          {chip}
        </Tooltip>
      );
    }

    return chip;
  }
);

IconThumbnail.displayName = "IconThumbnail";
