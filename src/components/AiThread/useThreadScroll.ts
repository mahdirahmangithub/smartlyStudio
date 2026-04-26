import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const SMOOTH_SETTLE_MS = 500;
const TOP_PADDING = 24;
const SENTINEL_MARGIN = 16;

export interface UseThreadScrollOptions {
  generating: boolean;
  bottomOffset: number;
  /** When provided, scroll operations target this element instead of the internal container. */
  scrollContainerRef?: RefObject<HTMLElement>;
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

// Returns the element's scroll-top offset within the given scroll container.
// Works regardless of the offsetParent chain — unlike offsetTop which only
// works when the scroll container is the direct offsetParent.
function getTopInScroller(el: HTMLElement, scroller: HTMLElement): number {
  return el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
}

export function useThreadScroll({
  generating,
  bottomOffset,
  scrollContainerRef,
}: UseThreadScrollOptions): UseThreadScrollResult {
  // containerRef always points to the inner content div (used for DOM queries
  // and gesture listeners). In external mode it is NOT the scroll container.
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(false);
  const smoothTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerHeightRef = useRef(400);
  const bottomOffsetRef = useRef(bottomOffset);
  bottomOffsetRef.current = bottomOffset;

  const userBubbleTopRef = useRef(-1);

  const userScrolledRef = useRef(false);
  const scrollAnchorRef = useRef(0);
  const spacerBaseRef = useRef(0);

  const [showFab, setShowFab] = useState(false);

  const isSmoothScrolling = useCallback(() => smoothTimerRef.current !== null, []);

  // Resolves the active scroll container at call time.
  const getScroller = useCallback((): HTMLElement | null => {
    return scrollContainerRef?.current ?? containerRef.current;
  }, [scrollContainerRef]);

  // ── Container height ──────────────────────────────────────────────────────
  // Tracks clientHeight of the scroll container (viewport height in external mode).

  useEffect(() => {
    const el = getScroller();
    if (!el) return;
    const update = () => { containerHeightRef.current = el.clientHeight; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  // getScroller is stable; re-run only when the external ref identity changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollContainerRef]);

  // ── Position helper ───────────────────────────────────────────────────────
  // In self mode: use offsetTop (zero-cost, no BoundingClientRect reflow).
  // In external mode: use BoundingClientRect to resolve position relative to
  // the external scroll container regardless of the offsetParent chain.

  const getTop = useCallback((el: HTMLElement): number => {
    const scroller = getScroller();
    if (!scroller || !scrollContainerRef) return el.offsetTop;
    return getTopInScroller(el, scroller);
  }, [getScroller, scrollContainerRef]);

  // ── Spacer sync ───────────────────────────────────────────────────────────

  const syncSpacer = useCallback(() => {
    const sentinel = sentinelRef.current;
    const spacer = spacerRef.current;
    if (!sentinel || !spacer || userScrolledRef.current || userBubbleTopRef.current < 0) return;
    const exchangeHeight = getTop(sentinel) - userBubbleTopRef.current + TOP_PADDING + 1;
    const needed = Math.max(0, containerHeightRef.current - exchangeHeight - bottomOffsetRef.current);
    spacer.style.transition = "none";
    spacer.style.height = `${needed}px`;
  }, [getTop]);

  // ── Spacer lifecycle ──────────────────────────────────────────────────────

  const prevGenerating = useRef(generating);
  useEffect(() => {
    const wasGenerating = prevGenerating.current;
    prevGenerating.current = generating;

    if (!wasGenerating && generating) {
      userScrolledRef.current = false;
      scrollAnchorRef.current = 0;
      spacerBaseRef.current = 0;
    } else if (wasGenerating && !generating) {
      userScrolledRef.current = false;
      syncSpacer();
    }
  }, [generating, syncSpacer]);

  // ── Scroll targets ────────────────────────────────────────────────────────

  const sentinelTarget = useCallback(() => {
    const sentinel = sentinelRef.current;
    const scroller = getScroller();
    if (!sentinel || !scroller) return 0;
    return Math.max(0, getTop(sentinel) - scroller.clientHeight + bottomOffsetRef.current + SENTINEL_MARGIN);
  }, [getTop, getScroller]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const scroller = getScroller();
    if (!scroller) return;
    stickRef.current = true;
    setShowFab(false);
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    const target = sentinelTarget();
    if (behavior === "smooth") {
      scroller.scrollTo({ top: target, behavior: "smooth" });
      smoothTimerRef.current = setTimeout(() => {
        smoothTimerRef.current = null;
        if (stickRef.current) {
          getScroller()?.scrollTo({ top: sentinelTarget(), behavior: "instant" });
        }
      }, SMOOTH_SETTLE_MS);
    } else {
      scroller.scrollTo({ top: target, behavior: "instant" });
    }
  }, [sentinelTarget, getScroller]);

  const scrollIfSticking = useCallback(() => {
    syncSpacer();

    const scroller = getScroller();
    if (!stickRef.current || !scroller || isSmoothScrolling()) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const sentinelBottom = getTop(sentinel);
    const viewportBottom = scroller.scrollTop + scroller.clientHeight - bottomOffsetRef.current;
    if (sentinelBottom <= viewportBottom) return;
    requestAnimationFrame(() => {
      if (!stickRef.current || isSmoothScrolling()) return;
      getScroller()?.scrollTo({ top: sentinelTarget(), behavior: "instant" });
    });
  }, [sentinelTarget, syncSpacer, isSmoothScrolling, getTop, getScroller]);

  // ── IntersectionObserver: opt-in to auto-scroll ───────────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scroller = getScroller();
    if (!sentinel || !scroller) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          stickRef.current = true;
          setShowFab(false);
        } else if (!isSmoothScrolling() && scroller.scrollHeight > scroller.clientHeight + 8) {
          setShowFab(true);
        }
      },
      { root: scroller, rootMargin: `0px 0px -${Math.max(0, bottomOffset - SENTINEL_MARGIN - 16)}px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomOffset, scrollContainerRef]);

  // ── Gesture detection ─────────────────────────────────────────────────────
  // Listeners stay on the content element (containerRef) so only gestures
  // inside the thread break auto-follow — not scrolling elsewhere on the page.
  // scrollTop is read from the scroller, not the content element.

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
        scrollAnchorRef.current = getScroller()?.scrollTop ?? 0;
        spacerBaseRef.current = spacerRef.current?.offsetHeight ?? 0;
      }
    };

    const onWheel = (e: WheelEvent) => { if (e.deltaY < 0) onScrollUp(); };
    const onTouchStart = (e: TouchEvent) => { lastTouchY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (y > lastTouchY) onScrollUp();
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
  // getScroller is stable across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Proportional spacer collapse ──────────────────────────────────────────
  // Scroll listener attaches to the scroller (external or internal).

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller) return;
    const onScroll = () => {
      const spacer = spacerRef.current;
      if (!userScrolledRef.current || !spacer || spacerBaseRef.current === 0) return;
      const scrolledUp = scrollAnchorRef.current - scroller.scrollTop;
      if (scrolledUp <= 0) return;
      spacer.style.transition = "none";
      spacer.style.height = `${Math.max(0, spacerBaseRef.current - scrolledUp)}px`;
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollContainerRef]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => () => {
    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
  }, []);

  // ── scrollToMessage ───────────────────────────────────────────────────────

  const scrollToMessage = useCallback((id: string, behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current;
    const scroller = getScroller();
    if (!container || !scroller) return;
    const el = container.querySelector(`[data-message-id="${id}"]`) as HTMLElement | null;
    if (!el) return;

    userBubbleTopRef.current = getTop(el);

    const spacer = spacerRef.current;
    if (spacer) {
      spacer.style.transition = "none";
      spacer.style.height = `${containerHeightRef.current}px`;
    }

    if (smoothTimerRef.current) clearTimeout(smoothTimerRef.current);
    const targetTop = Math.max(0, getTop(el) - TOP_PADDING);
    scroller.scrollTo({ top: targetTop, behavior });
    stickRef.current = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const node = containerRef.current?.querySelector(
          `[data-message-id="${id}"]`,
        ) as HTMLElement | null;
        const s = getScroller();
        if (node && s) {
          s.scrollTo({ top: Math.max(0, getTop(node) - TOP_PADDING), behavior: "instant" });
        }
      });
    });

    smoothTimerRef.current = setTimeout(() => {
      smoothTimerRef.current = null;
      const fresh = containerRef.current?.querySelector(
        `[data-message-id="${id}"]`,
      ) as HTMLElement | null;
      const s = getScroller();
      if (fresh && s) {
        s.scrollTo({ top: Math.max(0, getTop(fresh) - TOP_PADDING), behavior: "instant" });
      }
    }, SMOOTH_SETTLE_MS);
  }, [getTop, getScroller]);

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
