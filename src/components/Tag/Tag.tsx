import {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { InputClear, type InputClearSize, type InputClearType } from "../InputClear";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./Tag.module.css";
import { cx } from "../../utils/cx";

export type TagSize = "md" | "lg";

export type TagType =
  | "brand"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "alert"
  | "cat-1"
  | "cat-2"
  | "cat-3"
  | "cat-4"
  | "cat-5"
  | "cat-6";

export type TagEmphasis = "high" | "low";
export type TagSurface = "auto" | "default" | "over" | "under";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  size?: TagSize;
  variant?: TagType;
  emphasis?: TagEmphasis;
  label?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  outline?: boolean;
  /** Which surface background the outline should match. "auto" walks up the DOM to detect. */
  surface?: TagSurface;
  onRemove?: () => void;
}

const TYPE_CLASS: Record<TagType, string> = {
  brand: styles.brand,
  neutral: styles.neutral,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  alert: styles.alert,
  "cat-1": styles.cat1,
  "cat-2": styles.cat2,
  "cat-3": styles.cat3,
  "cat-4": styles.cat4,
  "cat-5": styles.cat5,
  "cat-6": styles.cat6,
};

const INPUT_CLEAR_SIZE: Record<TagSize, InputClearSize> = {
  md: "2xs",
  lg: "xs",
};

const SURFACE_TOKENS: Record<string, string> = {
  default: "--element-surface-default",
  over: "--element-surface-over",
  under: "--element-surface-under",
};

function detectSurface(element: HTMLElement): string {
  let el: HTMLElement | null = element.parentElement;
  while (el) {
    const rawBg = el.style.background || el.style.backgroundColor;
    if (rawBg) {
      for (const [key, token] of Object.entries(SURFACE_TOKENS)) {
        if (rawBg.includes(`var(${token})`)) return key;
      }
    }
    el = el.parentElement;
  }

  const tokenColors: [string, string][] = [];
  for (const [key, token] of Object.entries(SURFACE_TOKENS)) {
    const temp = document.createElement("div");
    temp.style.backgroundColor = `var(${token})`;
    element.appendChild(temp);
    const resolved = getComputedStyle(temp).backgroundColor;
    element.removeChild(temp);
    if (
      resolved &&
      resolved !== "rgba(0, 0, 0, 0)" &&
      resolved !== "transparent"
    ) {
      tokenColors.push([key, resolved]);
    }
  }

  el = element.parentElement;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      for (let i = tokenColors.length - 1; i >= 0; i--) {
        if (bg === tokenColors[i][1]) return tokenColors[i][0];
      }
      break;
    }
    el = el.parentElement;
  }
  return "default";
}

function getClearVariant(variant: TagType, emphasis: TagEmphasis): InputClearType {
  if (emphasis === "high") return "inverse";
  if (variant.startsWith("cat-")) return "neutral";
  return variant as InputClearType;
}


export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      size = "md",
      variant = "neutral",
      emphasis = "low",
      label,
      leadingIcon,
      trailingIcon,
      outline = false,
      surface = "auto",
      onRemove,
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

    const isCategorical = variant.startsWith("cat-");

    const [computedOutlineColor, setComputedOutlineColor] = useState<string | undefined>();

    useEffect(() => {
      if (!outline) return;
      const el = innerRef.current;
      if (!el) return;

      const resolve = () => {
        const resolved = surface === "auto" ? detectSurface(el) : surface;
        setResolvedSurface(resolved);

        if (isCategorical && el.parentElement) {
          const token = SURFACE_TOKENS[resolved];
          const probe = document.createElement("div");
          probe.style.backgroundColor = `var(${token})`;
          el.parentElement.appendChild(probe);
          setComputedOutlineColor(getComputedStyle(probe).backgroundColor);
          el.parentElement.removeChild(probe);
        }
      };

      resolve();

      if (!isCategorical) return;

      const themeAncestor = el.closest<HTMLElement>("[data-theme]")?.parentElement?.closest<HTMLElement>("[data-theme]");
      if (!themeAncestor) return;

      const obs = new MutationObserver(() => resolve());
      obs.observe(themeAncestor, { attributes: true, attributeFilter: ["data-theme"] });
      return () => obs.disconnect();
    }, [outline, surface, isCategorical]);

    const [labelRef, isLabelTruncated] = useIsTruncated<HTMLSpanElement>(label);

    const handleRemoveClick = (e: MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const outlineColor = outline
      ? isCategorical && computedOutlineColor
        ? computedOutlineColor
        : `var(${SURFACE_TOKENS[resolvedSurface]})`
      : undefined;

    const mergedStyle: CSSProperties | undefined = outlineColor
      ? { ...style, "--_tag-outline-color": outlineColor } as CSSProperties
      : style;

    return (
      <span
        ref={mergedRef}
        className={cx(
          styles.tag,
          styles[size],
          styles[emphasis],
          TYPE_CLASS[variant],
          outline && styles.hasOutline,
          className
        )}
        data-theme={isCategorical ? "light" : undefined}
        style={mergedStyle}
        {...rest}
      >
        <span className={styles.content}>
          {leadingIcon && (
            <span className={styles.leadingIcon}>{leadingIcon}</span>
          )}

          <span className={styles.labelGroup}>
            {label && (
              <Tooltip label={label} disabled={!isLabelTruncated} placement="top" type="inverse" showTail={false}>
                <span className={styles.label}>
                  <span ref={labelRef} className={styles.labelText}>{label}</span>
                </span>
              </Tooltip>
            )}

            {trailingIcon && (
              <span className={styles.trailingIcon}>{trailingIcon}</span>
            )}
          </span>
        </span>

        {onRemove && (
          <span className={styles.clearSlot}>
            <InputClear
              size={INPUT_CLEAR_SIZE[size]}
              variant={getClearVariant(variant, emphasis)}
              round
              onClick={handleRemoveClick}
              aria-label="Remove"
            />
          </span>
        )}
      </span>
    );
  }
);

Tag.displayName = "Tag";
