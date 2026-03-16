import {
  forwardRef,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
  type AnimationEvent,
} from "react";
import styles from "./ExpandableBadge.module.css";
import { cx } from "../../utils/cx";

export type ExpandableBadgeSize = "sm" | "md" | "lg";
export type ExpandableBadgeType =
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "alert";
export type ExpandableBadgeSurface = "auto" | "default" | "over" | "under";

export interface ExpandableBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  size?: ExpandableBadgeSize;
  variant?: ExpandableBadgeType;
  expanded?: boolean;
  outline?: boolean;
  surface?: ExpandableBadgeSurface;
  children?: ReactNode;
}


const SURFACE_TOKENS: Record<string, string> = {
  default: "--element-surface-default",
  over: "--element-surface-over",
  under: "--element-surface-under",
};

const BADGE_PX: Record<ExpandableBadgeSize, number> = { sm: 2, md: 4, lg: 4 };
const BADGE_H: Record<ExpandableBadgeSize, number> = { sm: 16, md: 20, lg: 24 };

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

type AnimState = "idle" | "expanding" | "collapsing";

export const ExpandableBadge = forwardRef<
  HTMLSpanElement,
  ExpandableBadgeProps
>(
  (
    {
      size = "md",
      variant = "brand",
      expanded = false,
      outline = true,
      surface = "auto",
      children,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const badgeRef = useRef<HTMLSpanElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const [animState, setAnimState] = useState<AnimState>("idle");
    const [fullWidth, setFullWidth] = useState(0);
    const prevExpanded = useRef(expanded);
    const [resolvedSurface, setResolvedSurface] = useState<string>(
      surface === "auto" ? "default" : surface
    );

    const mergedRef = useCallback(
      (node: HTMLSpanElement | null) => {
        (badgeRef as React.MutableRefObject<HTMLSpanElement | null>).current =
          node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLSpanElement | null>).current =
            node;
      },
      [ref]
    );

    useLayoutEffect(() => {
      const label = labelRef.current;
      if (!label) return;
      const px = BADGE_PX[size];
      const h = BADGE_H[size];
      setFullWidth(Math.max(label.offsetWidth + px * 2, h));
    }, [children, size]);

    useEffect(() => {
      if (!outline) return;
      if (surface !== "auto") {
        setResolvedSurface(surface);
        return;
      }
      const el = badgeRef.current;
      if (!el) return;
      setResolvedSurface(detectSurface(el));
    }, [outline, surface]);

    useEffect(() => {
      if (prevExpanded.current === expanded) return;
      prevExpanded.current = expanded;
      setAnimState(expanded ? "expanding" : "collapsing");
    }, [expanded]);

    const handleAnimationEnd = useCallback(
      (e: AnimationEvent<HTMLSpanElement>) => {
        if (e.target === e.currentTarget) {
          setAnimState("idle");
        }
      },
      []
    );

    const isCollapsed = !expanded && animState === "idle";
    const isExpanded = expanded && animState === "idle";

    const outlineColor = outline
      ? `var(${SURFACE_TOKENS[resolvedSurface]})`
      : undefined;

    const vars: Record<string, string> = {};
    if (fullWidth > 0) vars["--_full-w"] = `${fullWidth}px`;
    if (outlineColor) vars["--_eb-outline-color"] = outlineColor;

    return (
      <span
        ref={mergedRef}
        className={cx(
          styles.badge,
          styles[size],
          styles[variant],
          isCollapsed && styles.collapsed,
          isExpanded && styles.expanded,
          animState === "expanding" && styles.expanding,
          animState === "collapsing" && styles.collapsing,
          outline && styles.hasOutline,
          className
        )}
        style={{ ...style, ...vars } as CSSProperties}
        onAnimationEnd={handleAnimationEnd}
        {...rest}
      >
        <span className={styles.labelWrap}>
          <span ref={labelRef} className={styles.label}>
            {children}
          </span>
        </span>
      </span>
    );
  }
);

ExpandableBadge.displayName = "ExpandableBadge";
