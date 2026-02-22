import {
  useRef,
  useState,
  useCallback,
  useEffect,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
  type CSSProperties,
} from "react";
import { Icon } from "../Icon";
import styles from "./ScrollFade.module.css";

export type ScrollFadeDirection = "horizontal" | "vertical";
export type ScrollFadeSurface = "default" | "over" | "under" | "auto";

export interface ScrollFadeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  direction?: ScrollFadeDirection;
  /** Which surface background to match. "auto" walks up the DOM to detect. */
  surface?: ScrollFadeSurface;
  /** Size of the fade gradient in px */
  fadeSize?: number;
  /** Show chevron arrow indicators at each edge */
  showChevrons?: boolean;
  /** Width (horizontal) / height (vertical) of the chevron column in px */
  chevronSize?: number;
  /** Scroll position threshold in px to avoid subpixel flicker */
  threshold?: number;
  /** Class applied to the inner scrollable element */
  scrollAreaClassName?: string;
  /** Style applied to the inner scrollable element */
  scrollAreaStyle?: CSSProperties;
  children: ReactNode;
}

// ── helpers ────────────────────────────────────────────────────────────

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const SURFACE_TOKENS: Record<string, string> = {
  default: "--element-surface-default",
  over: "--element-surface-over",
  under: "--element-surface-under",
};

function detectSurface(element: HTMLElement): string {
  // Strategy 1: walk up and check inline style values for var() references.
  // This is the only reliable way when multiple tokens resolve to the same
  // computed color (e.g. light theme: default and over are both white).
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

  // Strategy 2: fall back to computed rgb comparison for class-based backgrounds.
  // Resolve tokens inside the themed container so they inherit the right values.
  const tokenColors: [string, string][] = [];
  for (const [key, token] of Object.entries(SURFACE_TOKENS)) {
    const temp = document.createElement("div");
    temp.style.backgroundColor = `var(${token})`;
    element.appendChild(temp);
    const resolved = getComputedStyle(temp).backgroundColor;
    element.removeChild(temp);
    if (resolved && resolved !== "rgba(0, 0, 0, 0)" && resolved !== "transparent") {
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

// ── hook ───────────────────────────────────────────────────────────────

export interface UseScrollFadeResult {
  showStart: boolean;
  showEnd: boolean;
  onScroll: () => void;
  refresh: () => void;
}

export function useScrollFade(
  scrollRef: React.RefObject<HTMLElement | null>,
  direction: ScrollFadeDirection = "horizontal",
  threshold = 2
): UseScrollFadeResult {
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (direction === "horizontal") {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setShowStart(el.scrollLeft > threshold);
      setShowEnd(el.scrollLeft < maxScroll - threshold);
    } else {
      const maxScroll = el.scrollHeight - el.clientHeight;
      setShowStart(el.scrollTop > threshold);
      setShowEnd(el.scrollTop < maxScroll - threshold);
    }
  }, [scrollRef, direction, threshold]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);

    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [scrollRef, update]);

  return { showStart, showEnd, onScroll: update, refresh: update };
}

// ── component ──────────────────────────────────────────────────────────

export const ScrollFade = forwardRef<HTMLDivElement, ScrollFadeProps>(
  (
    {
      direction = "horizontal",
      surface = "auto",
      fadeSize = 40,
      showChevrons = false,
      chevronSize = 20,
      threshold = 2,
      className,
      scrollAreaClassName,
      scrollAreaStyle,
      children,
      style,
      ...rest
    },
    ref
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { showStart, showEnd, onScroll } = useScrollFade(
      scrollRef,
      direction,
      threshold
    );

    const [resolvedSurface, setResolvedSurface] = useState<string>(
      surface === "auto" ? "default" : surface
    );

    useEffect(() => {
      if (surface !== "auto") {
        setResolvedSurface(surface);
        return;
      }
      const el = wrapperRef.current;
      if (!el) return;
      setResolvedSurface(detectSurface(el));
    }, [surface]);

    const tokenVar = `var(${SURFACE_TOKENS[resolvedSurface]})`;

    const isH = direction === "horizontal";
    const startGrad = isH
      ? `linear-gradient(to right, ${tokenVar}, transparent)`
      : `linear-gradient(to bottom, ${tokenVar}, transparent)`;
    const endGrad = isH
      ? `linear-gradient(to left, ${tokenVar}, transparent)`
      : `linear-gradient(to top, ${tokenVar}, transparent)`;

    const fadeDimStyle: CSSProperties = isH
      ? { width: fadeSize }
      : { height: fadeSize };
    const chevronDimStyle: CSSProperties = isH
      ? { width: chevronSize }
      : { height: chevronSize };

    const startIcon = isH ? "chevron_left" : "arrow_chevron_up";
    const endIcon = isH ? "chevron_right" : "arrow_chevron_down";

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    return (
      <div
        ref={mergedRef}
        className={cx(styles.wrapper, styles[direction], className)}
        style={style}
        {...rest}
      >
        <div
          ref={scrollRef}
          className={cx(
            styles.scrollArea,
            styles[direction],
            scrollAreaClassName
          )}
          style={scrollAreaStyle}
          onScroll={onScroll}
        >
          {children}
        </div>

        {/* Fade overlays */}
        <div
          className={cx(
            styles.fade,
            styles.fadeStart,
            styles[direction],
            showStart && styles.visible
          )}
          style={{ background: startGrad, ...fadeDimStyle }}
          aria-hidden="true"
        />
        <div
          className={cx(
            styles.fade,
            styles.fadeEnd,
            styles[direction],
            showEnd && styles.visible
          )}
          style={{ background: endGrad, ...fadeDimStyle }}
          aria-hidden="true"
        />

        {/* Optional chevron indicators */}
        {showChevrons && (
          <>
            <div
              className={cx(
                styles.chevron,
                styles.chevronStart,
                styles[direction],
                showStart && styles.visible
              )}
              style={chevronDimStyle}
              aria-hidden="true"
            >
              <Icon name={startIcon} size={12} />
            </div>
            <div
              className={cx(
                styles.chevron,
                styles.chevronEnd,
                styles[direction],
                showEnd && styles.visible
              )}
              style={chevronDimStyle}
              aria-hidden="true"
            >
              <Icon name={endIcon} size={12} />
            </div>
          </>
        )}
      </div>
    );
  }
);

ScrollFade.displayName = "ScrollFade";
