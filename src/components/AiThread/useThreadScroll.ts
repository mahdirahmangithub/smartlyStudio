import { useCallback, useEffect, useRef, useState } from "react";

const SMOOTH_SETTLE_MS = 500;
const TOP_PADDING = 24;
const SENTINEL_MARGIN = 16;

export interface UseThreadScrollOptions {
  generating: boolean;
  bottomOffset: number;
}

export interface UseThreadScrollResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  spacerRef: React.RefObject<HTMLDivElement | null>;
  showFab: boolean;
  onFabClick: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToMessage: (id: string, behavior?: ScrollBehavior) => void;
  scrollIfSticking: () => void;
}

export function useThreadScroll({
  generating,
  bottomOffset,
}: UseThreadScrollOptions): UseThreadScrollResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(false);
  const smoothTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerHeightRef = useRef(400);
  const bottomOffsetRef = useRef(bottomOffset);
  bottomOffsetRef.current = bottomOffset;

  // offsetTop of the submitted user bubble — used by syncSpacer to compute exact needed space.
  const userBubbleTopRef = useRef(-1);

  // Proportional spacer collapse state (only active after an upward scroll)
  const userScrolledRef = useRef(false);
  const scrollAnchorRef = useRef(0);
  const spacerBaseRef = useRef(0);

  const [showFab, setShowFab] = useState(false);

  const isSmoothScrolling = useCallback(() => smoothTimerRef.current !== null, []);

  // ── Container height ──────────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => { containerHeightRef.current = el.clientHeight; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Spacer sync ───────────────────────────────────────────────────────────
  //
  // Keeps spacer = max(0, containerHeight − exchangeHeight − bottomOffset).
  // As the response streams in the exchange grows and the spacer shrinks 1:1
  // so the user bubble stays exactly at the top with zero wasted space.
  const syncSpacer = useCallback(() => {
    const sentinel = sentinelRef.current;
    const spacer = spacerRef.current;
    if (!sentinel || !spacer || userScrolledRef.current || userBubbleTopRef.current < 0) return;
    const exchangeHeight = sentinel.offsetTop - userBubbleTopRef.current + TOP_PADDING + 1;
    const needed = Math.max(0, containerHeightRef.current - exchangeHeight - bottomOffsetRef.current);
    spacer.style.transition = "none";
    spacer.style.height = `${needed}px`;
  }, []);

  // ── Spacer lifecycle ──────────────────────────────────────────────────────

  const prevGenerating = useRef(generating);
  useEffect(() => {
    const wasGenerating = prevGenerating.current;
    prevGenerating.current = generating;

    if (!wasGenerating && generating) {
      // Reset collapse tracking for the new exchange.
      // userBubbleTopRef is NOT reset here — scrollToMessage sets it synchronously
      // before this effect fires. Resetting it here would break syncSpacer.
      userScrolledRef.current = false;
      scrollAnchorRef.current = 0;
      spacerBaseRef.current = 0;
    } else if (wasGenerating && !generating) {
      // Generation done: always lock in exact final spacer size,
      // even if the user scrolled during generation.
      userScrolledRef.current = false;
      syncSpacer();
    }
  }, [generating, syncSpacer]);

  // ── Scroll targets ────────────────────────────────────────────────────────

  const sentinelTarget = useCallback(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return 0;
    return Math.max(0, sentinel.offsetTop - container.clientHeight + bottomOffsetRef.current + SENTINEL_MARGIN);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    stickRef.current = true;
    setShowFab(false);
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    const target = sentinelTarget();
    if (behavior === "smooth") {
      el.scrollTo({ top: target, behavior: "smooth" });
      smoothTimerRef.current = setTimeout(() => {
        smoothTimerRef.current = null;
        if (stickRef.current && containerRef.current) {
          containerRef.current.scrollTo({ top: sentinelTarget(), behavior: "instant" });
        }
      }, SMOOTH_SETTLE_MS);
    } else {
      el.scrollTo({ top: target, behavior: "instant" });
    }
  }, [sentinelTarget]);

  // syncSpacer always runs (no stickRef guard) so spacer stays current even
  // when auto-follow is off. The scroll part is guarded by stickRef as usual.
  const scrollIfSticking = useCallback(() => {
    syncSpacer();

    if (!stickRef.current || !containerRef.current || isSmoothScrolling()) return;
    const container = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const sentinelBottom = sentinel.offsetTop;
    const viewportBottom = container.scrollTop + container.clientHeight - bottomOffsetRef.current;
    if (sentinelBottom <= viewportBottom) return;
    requestAnimationFrame(() => {
      if (!stickRef.current || !containerRef.current || isSmoothScrolling()) return;
      containerRef.current.scrollTo({ top: sentinelTarget(), behavior: "instant" });
    });
  }, [sentinelTarget, syncSpacer, isSmoothScrolling]);

  // ── IntersectionObserver: opt-in to auto-scroll ───────────────────────────
  //
  // When the user scrolls the sentinel into view (scrolled down to the bottom
  // of generated content), enter auto-scroll. This is the natural "I want to
  // follow the generation" gesture — no explicit button needed.
  // When sentinel leaves view (user scrolls up), the wheel handler exits auto-scroll.

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stickRef.current = true;
          setShowFab(false);
        } else if (!isSmoothScrolling() && container.scrollHeight > container.clientHeight + 8) {
          setShowFab(true);
        }
      },
      { root: container, rootMargin: `0px 0px -${Math.max(0, bottomOffset - SENTINEL_MARGIN - 16)}px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [bottomOffset]);

  // ── Gesture detection ─────────────────────────────────────────────────────
  //
  // Only upward scroll (finger down / wheel deltaY < 0) exits auto-follow and
  // begins proportional spacer collapse. Downward scroll is intentionally
  // ignored here — the IntersectionObserver handles auto-scroll entry when the
  // user scrolls far enough down to bring the sentinel into view.

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let lastTouchY = 0;

    const onScrollUp = () => {
      if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
      smoothTimerRef.current = null;
      stickRef.current = false;
      if (!userScrolledRef.current) {
        userScrolledRef.current = true;
        scrollAnchorRef.current = el.scrollTop;
        spacerBaseRef.current = spacerRef.current?.offsetHeight ?? 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) onScrollUp();
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (y > lastTouchY) onScrollUp(); // finger moves down = viewport scrolls up
      lastTouchY = y;
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Proportional spacer collapse: every pixel scrolled up removes a pixel of spacer.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const spacer = spacerRef.current;
      if (!userScrolledRef.current || !spacer || spacerBaseRef.current === 0) return;
      const scrolledUp = scrollAnchorRef.current - el.scrollTop;
      if (scrolledUp <= 0) return;
      spacer.style.transition = "none";
      spacer.style.height = `${Math.max(0, spacerBaseRef.current - scrolledUp)}px`;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => () => {
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
  }, []);

  // ── scrollToMessage ───────────────────────────────────────────────────────
  //
  // Positions the submitted user bubble at the top of the viewport.
  // Auto-follow is NOT entered here — the user opts in by scrolling down.

  const scrollToMessage = useCallback((id: string, behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-message-id="${id}"]`) as HTMLElement | null;
    if (!el) return;

    userBubbleTopRef.current = el.offsetTop;

    // Set full spacer immediately so the scroll target is within scrollHeight bounds.
    // The generating useEffect fires after this (effects run post-paint), so without
    // this the scroll target may be unreachable and get clamped.
    const spacer = spacerRef.current;
    if (spacer) {
      spacer.style.transition = "none";
      spacer.style.height = `${containerHeightRef.current}px`;
    }

    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    const targetTop = Math.max(0, el.offsetTop - TOP_PADDING);
    container.scrollTo({ top: targetTop, behavior });
    stickRef.current = false; // passive by default — user opts in by scrolling down

    // Double-rAF snap: after the initial scroll the browser re-layouts items that
    // are now near the viewport (replacing content-visibility placeholders with real
    // heights). Two frames is enough for that re-layout to complete.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const node = containerRef.current?.querySelector(
          `[data-message-id="${id}"]`,
        ) as HTMLElement | null;
        if (node && containerRef.current) {
          containerRef.current.scrollTo({
            top: Math.max(0, node.offsetTop - TOP_PADDING),
            behavior: "instant",
          });
        }
      });
    });

    // Settle snap after animation to absorb any drift
    smoothTimerRef.current = setTimeout(() => {
      smoothTimerRef.current = null;
      const fresh = containerRef.current?.querySelector(
        `[data-message-id="${id}"]`,
      ) as HTMLElement | null;
      if (fresh && containerRef.current) {
        containerRef.current.scrollTo({
          top: Math.max(0, fresh.offsetTop - TOP_PADDING),
          behavior: "instant",
        });
      }
    }, SMOOTH_SETTLE_MS);
  }, []);

  const onFabClick = useCallback(() => scrollToBottom("smooth"), [scrollToBottom]);

  return {
    containerRef,
    sentinelRef,
    spacerRef,
    showFab,
    onFabClick,
    scrollToBottom,
    scrollToMessage,
    scrollIfSticking,
  };
}
