import { useEffect, useRef, useState, type RefObject } from "react";
import type { AiThreadHandle } from "./aiThreadTypes";

/**
 * Tracks which message is currently nearest the top of the visible area and
 * returns its id. Designed for use with `<AiThreadDialogIndicator>`.
 *
 * Pass the **same scroll container** you gave to `<AiThread>` via
 * `scrollContainerRef`. When the thread owns its own scroll (no external ref),
 * pass `null` — the hook will detect window scroll automatically.
 *
 * ```tsx
 * // Page-scroll layout
 * const threadRef = useRef<AiThreadHandle>(null);
 * const activeId = useAiThreadActiveMessage(threadRef, messages, null);
 * //                                                              ^ page scrolls
 *
 * // Drawer / inner-container layout
 * const drawerScrollRef = useRef<HTMLDivElement>(null);
 * const activeId = useAiThreadActiveMessage(threadRef, messages, drawerScrollRef.current);
 *
 * // AiThread self-scroll (no external ref)
 * const activeId = useAiThreadActiveMessage(threadRef, messages, null);
 * ```
 */
export function useAiThreadActiveMessage(
  handle: RefObject<AiThreadHandle | null>,
  items: readonly { id: string }[],
  /**
   * The element that owns the scroll. Pass the same value you give
   * `<AiThread scrollContainerRef={...}>`. Pass `null` for page scroll
   * (window) or AiThread's own internal scroll.
   */
  scrollContainer: HTMLElement | null = null,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setActiveId(null);
      return;
    }

    const findActive = () => {
      const all = Array.from(
        document.querySelectorAll<HTMLElement>("[data-message-id]"),
      );
      if (all.length === 0) return;

      let bestId: string | null = null;
      let bestScore = -Infinity;

      for (const el of all) {
        const { top, bottom } = el.getBoundingClientRect();
        if (bottom <= 0) continue;
        if (top > window.innerHeight) continue;
        const score = top <= 0 ? bottom : -top;
        if (score > bestScore) {
          bestScore = score;
          bestId = el.dataset.messageId ?? null;
        }
      }

      if (bestId) setActiveId(bestId);
    };

    findActive();

    // Determine which target to listen on.
    // - Explicit inner container → listen there
    // - No explicit container (page scroll or thread's own scroll) → listen on window
    const isInnerContainer =
      scrollContainer !== null &&
      scrollContainer !== document.documentElement &&
      scrollContainer !== document.body;

    const target: EventTarget = isInnerContainer ? scrollContainer : window;
    target.addEventListener("scroll", findActive, { passive: true });

    return () => target.removeEventListener("scroll", findActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollContainer, items.map((m) => m.id).join(",")]);

  return activeId;
}
