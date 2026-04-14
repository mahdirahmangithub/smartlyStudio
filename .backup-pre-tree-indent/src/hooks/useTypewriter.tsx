import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export type TrailMode = "trail" | "settle" | "off";

export interface UseTypewriterOptions {
  /** Milliseconds per character (default 30) */
  speed?: number;
  /** Start typing automatically (default false) */
  autoStart?: boolean;
  /** Callback when typing completes */
  onDone?: () => void;
  /** Fade trail width in px (0 = disabled, default 0) */
  fade?: number;
}

export interface TypewriterTrail {
  /** Current trail mode */
  mode: TrailMode;
  /** CSS mask style for the active mode (empty object when off) */
  style: React.CSSProperties;
  /** Number of characters revealed so far */
  revealed: number;
  /**
   * Wrap a text string so the trailing portion gets the fade mask.
   * Pass the visible text and its global character offset.
   */
  renderText: (text: string, globalStart: number) => React.ReactNode;
}

export interface UseTypewriterReturn {
  /** The currently visible portion of the text */
  displayed: string;
  /** Whether the typewriter is currently typing */
  isTyping: boolean;
  /** Whether the full text has been revealed */
  isDone: boolean;
  /** Start or restart the animation */
  start: () => void;
  /** Skip to the end immediately */
  skip: () => void;
  /** Reset to empty */
  reset: () => void;
  /** Trail fade state and helpers */
  trail: TypewriterTrail;
}

function buildMaskStyles(fade: number) {
  const gradient =
    `linear-gradient(to right, black calc(100% - ${fade}px), transparent 100%)`;

  const typing: React.CSSProperties = {
    WebkitMaskImage: gradient,
    maskImage: gradient,
    WebkitMaskSize: `calc(100% + ${fade}px) 100%`,
    maskSize: `calc(100% + ${fade}px) 100%`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: `-${fade}px 0`,
    maskPosition: `-${fade}px 0`,
    transition: `-webkit-mask-position 150ms ease-out, mask-position 150ms ease-out`,
  };

  const settle: React.CSSProperties = {
    ...typing,
    WebkitMaskPosition: "0 0",
    maskPosition: "0 0",
  };

  return { typing, settle };
}

const EMPTY_STYLE: React.CSSProperties = {};

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const { speed = 30, autoStart = false, onDone, fade = 0 } = options;
  const [index, setIndex] = useState(autoStart ? 0 : -1);
  const [settling, setSettling] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const isIdle = index === -1;
  const isDone = index >= text.length;
  const isTyping = !isIdle && !isDone;

  const masks = useMemo(() => (fade > 0 ? buildMaskStyles(fade) : null), [fade]);
  const trailChars = useMemo(() => Math.max(20, Math.ceil(fade / 5)), [fade]);

  useEffect(() => {
    if (!isTyping) return;

    let running = true;
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const elapsed = now - lastTickRef.current;
      if (elapsed >= speed) {
        const chars = Math.max(1, Math.floor(elapsed / speed));
        setIndex((i) => Math.min(i + chars, text.length));
        lastTickRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTyping, speed, text.length]);

  useEffect(() => {
    if (isDone && index > 0) {
      onDoneRef.current?.();
      if (fade > 0) {
        setSettling(true);
        settleTimerRef.current = setTimeout(() => setSettling(false), 200);
      }
    }
    return () => clearTimeout(settleTimerRef.current);
  }, [isDone, index, fade]);

  useEffect(() => {
    if (index <= 0) setSettling(false);
  }, [index]);

  const start = useCallback(() => setIndex(0), []);
  const skip = useCallback(() => setIndex(text.length), [text.length]);
  const reset = useCallback(() => setIndex(-1), []);

  const displayed = isIdle ? "" : text.slice(0, index);
  const revealed = displayed.length;
  const mode: TrailMode = isTyping ? "trail" : settling ? "settle" : "off";

  const currentStyle =
    mode === "off" || !masks
      ? EMPTY_STYLE
      : mode === "settle"
        ? masks.settle
        : masks.typing;

  const renderText = (text: string, globalStart: number): React.ReactNode => {
    if (text.length === 0) return null;
    if (mode === "off" || !masks) return text;
    if (globalStart + text.length < revealed) return text;

    const trailGlobal = Math.max(globalStart, revealed - trailChars);
    let splitAt = trailGlobal - globalStart;
    while (
      splitAt > 0 &&
      splitAt < text.length &&
      text[splitAt] !== " " &&
      text[splitAt - 1] !== " "
    ) {
      splitAt--;
    }

    const before = splitAt > 0 ? text.slice(0, splitAt) : null;
    const trailText = text.slice(splitAt);

    if (!before) return <span style={currentStyle}>{trailText}</span>;
    return (
      <>
        {before}
        <span style={currentStyle}>{trailText}</span>
      </>
    );
  };

  return {
    displayed,
    isTyping,
    isDone,
    start,
    skip,
    reset,
    trail: { mode, style: currentStyle, revealed, renderText },
  };
}
