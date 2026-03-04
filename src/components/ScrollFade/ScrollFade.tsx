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

function extractBgToken(element: HTMLElement): string | null {
  const raw = element.style.background || element.style.backgroundColor;
  if (raw) {
    const m = raw.match(/var\((--[^),]+)/);
    if (m) return m[1];
  }

  let token: string | null = null;

  const walk = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        try { if (!element.matches(rule.selectorText)) continue; } catch { continue; }
        for (const prop of ["background", "background-color"]) {
          const val = rule.style.getPropertyValue(prop);
          if (val) {
            const m = val.match(/var\((--[^),]+)/);
            if (m) token = m[1];
          }
        }
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules);
      }
    }
  };

  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* cross-origin */ }
  }
  return token;
}

function detectFadeColor(element: HTMLElement): string {
  let el: HTMLElement | null = element.parentElement;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const token = extractBgToken(el);
      return token ? `var(${token})` : bg;
    }
    el = el.parentElement;
  }
  return "var(--element-surface-default)";
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

    const [fadeColor, setFadeColor] = useState("transparent");

    useEffect(() => {
      if (surface !== "auto") {
        setFadeColor(`var(${SURFACE_TOKENS[surface]})`);
        return;
      }

      const el = wrapperRef.current;
      if (!el) return;
      setFadeColor(detectFadeColor(el));
    }, [surface]);

    const isH = direction === "horizontal";
    const startGrad = isH
      ? `linear-gradient(to right, ${fadeColor}, transparent)`
      : `linear-gradient(to bottom, ${fadeColor}, transparent)`;
    const endGrad = isH
      ? `linear-gradient(to left, ${fadeColor}, transparent)`
      : `linear-gradient(to top, ${fadeColor}, transparent)`;

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
