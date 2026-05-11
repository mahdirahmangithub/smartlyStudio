import { useCallback, useRef, useState, useEffect, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { TitleText } from "../TitleText";
import { AiButton, type AiButtonSize } from "../AiButton";
import { Button } from "../Button";
import { useScrollFade } from "../ScrollFade";
import { detectFadeColor, surfaceTokenVar, type SurfaceType } from "../../utils/detectSurface";
import { cx } from "../../utils/cx";
import styles from "./PromptInputRecommendations.module.css";

export interface RecommendationItem {
  id: string;
  label: string;
  leadingIcon?: ReactNode;
  onSelect: () => void;
}

export interface PromptInputRecommendationsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: RecommendationItem[];
  /** Optional section title rendered above the buttons row. */
  title?: string;
  /** Leading icon passed to TitleText (e.g. `<Icon name="favorite_fill" size={16} />`). */
  titleIcon?: ReactNode;
  /** Size of every AiButton + inner Button. @default "md" */
  buttonSize?: AiButtonSize;
  /** Emphasis of the inner Button. @default "low" */
  buttonEmphasis?: "low" | "high";
  /** Surface to match for fade gradient. @default "auto" */
  surface?: SurfaceType;
}

export function PromptInputRecommendations({
  items,
  title,
  titleIcon,
  buttonSize = "md",
  buttonEmphasis = "low",
  surface = "auto",
  className,
  ...rest
}: PromptInputRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { showStart, showEnd, onScroll } = useScrollFade(scrollRef, "horizontal");

  const [fadeColor, setFadeColor] = useState("transparent");

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    setFadeColor(surface === "auto" ? detectFadeColor(el) : surfaceTokenVar(surface));
  }, [surface]);

  const fadeStartStyle = { background: `linear-gradient(to right, ${fadeColor}, transparent)` };
  const fadeEndStyle = { background: `linear-gradient(to left, ${fadeColor}, transparent)` };

  /* ── Roving tabindex: only one button is in the page tab order at a time;
   * Left/Right walks siblings, Tab leaves the row entirely. Mirrors WAI-ARIA
   * toolbar pattern. ─────────────────────────────────────────────────────── */
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep activeIndex valid if `items` shrinks.
  useEffect(() => {
    if (activeIndex >= items.length && items.length > 0) {
      setActiveIndex(items.length - 1);
    }
  }, [items.length, activeIndex]);

  const handleRowKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (activeIndex + 1) % items.length;
      setActiveIndex(next);
      buttonRefs.current[next]?.focus();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (activeIndex - 1 + items.length) % items.length;
      setActiveIndex(next);
      buttonRefs.current[next]?.focus();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      buttonRefs.current[0]?.focus();
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      const last = items.length - 1;
      setActiveIndex(last);
      buttonRefs.current[last]?.focus();
    }
  }, [activeIndex, items.length]);

  return (
    <div className={cx(styles.root, className)} {...rest}>
      {title && (
        <TitleText size="xs" title={title} leadingIcon={titleIcon} />
      )}
      <div ref={wrapperRef} className={styles.rowWrapper}>
        <div
          ref={scrollRef}
          className={styles.row}
          role="toolbar"
          aria-orientation="horizontal"
          aria-label={title ?? "Prompt recommendations"}
          onScroll={onScroll}
          onKeyDown={handleRowKeyDown}
        >
          {items.map((item, i) => (
            <AiButton key={item.id} size={buttonSize}>
              <Button
                ref={(el) => { buttonRefs.current[i] = el; }}
                variant="neutral"
                emphasis={buttonEmphasis}
                size={buttonSize}
                leadingIcon={item.leadingIcon}
                tabIndex={i === activeIndex ? 0 : -1}
                onClick={item.onSelect}
                onFocus={() => setActiveIndex(i)}
              >
                {item.label}
              </Button>
            </AiButton>
          ))}
        </div>
        <div
          className={cx(styles.fade, styles.fadeStart, showStart && styles.fadeVisible)}
          style={fadeStartStyle}
          aria-hidden="true"
        />
        <div
          className={cx(styles.fade, styles.fadeEnd, showEnd && styles.fadeVisible)}
          style={fadeEndStyle}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

PromptInputRecommendations.displayName = "PromptInputRecommendations";
