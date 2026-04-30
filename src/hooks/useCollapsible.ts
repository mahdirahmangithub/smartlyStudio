import { useRef, useLayoutEffect } from "react";

export interface UseCollapsibleOptions {
  /**
   * Height when collapsed. Accepts any CSS height value (e.g. `"0px"`,
   * `"128px"`, or `"var(--spacing-11xl)"`). Defaults to `"0px"` — the
   * "fully hidden" case used by accordions, expandable rows, etc.
   */
  collapsedHeight?: string;
  /**
   * Whether to fade opacity during the transition. Defaults to `true` for
   * the typical "hidden ↔ visible" expand. Set `false` when the collapsed
   * state still shows partial content (e.g. a clipped preview that should
   * stay fully opaque while only the height grows).
   */
  fadeOpacity?: boolean;
}

/**
 * Drives a height + opacity expand/collapse animation on a container element.
 *
 * The consumer must apply the collapsed base styles on the element
 * (e.g. `overflow: hidden; height: 0; opacity: 0`).
 * The hook imperatively animates between collapsed and expanded states
 * using the design-system expand/collapse animation tokens.
 *
 * @param expanded  Whether the content should be visible.
 * @param options   Optional `collapsedHeight` and `fadeOpacity` overrides
 *                  (defaults: `"0px"` and `true`).
 * @returns `ref` — attach to the collapsible wrapper `<div>`.
 */
export function useCollapsible(
  expanded: boolean,
  options: UseCollapsibleOptions = {},
) {
  const { collapsedHeight = "0px", fadeOpacity = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const prevExpandedRef = useRef(expanded);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prev = prevExpandedRef.current;
    prevExpandedRef.current = expanded;

    if (prev === expanded) {
      el.style.height = expanded ? "auto" : collapsedHeight;
      if (fadeOpacity) {
        el.style.opacity = expanded ? "var(--opacity-100)" : "var(--opacity-0)";
      }
      return;
    }

    if (expanded) {
      el.style.transition = "none";
      el.style.height = "auto";
      if (fadeOpacity) el.style.opacity = "var(--opacity-100)";
      const fullHeight = el.scrollHeight;

      el.style.height = collapsedHeight;
      if (fadeOpacity) el.style.opacity = "var(--opacity-0)";

      requestAnimationFrame(() => {
        const heightTransition = `height var(--animation-state-expand-duration) var(--animation-state-expand-easing)`;
        const opacityTransition = `opacity var(--animation-state-expand-duration) var(--animation-state-expand-easing)`;
        el.style.transition = fadeOpacity
          ? `${heightTransition}, ${opacityTransition}`
          : heightTransition;
        el.style.height = `${fullHeight}px`;
        if (fadeOpacity) el.style.opacity = "var(--opacity-100)";
      });

      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName !== "height") return;
        el.style.height = "auto";
        el.removeEventListener("transitionend", onEnd);
      };
      el.addEventListener("transitionend", onEnd);
    } else {
      el.style.height = `${el.scrollHeight}px`;
      el.style.transition = "none";
      requestAnimationFrame(() => {
        const heightTransition = `height var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)`;
        const opacityTransition = `opacity var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)`;
        el.style.transition = fadeOpacity
          ? `${heightTransition}, ${opacityTransition}`
          : heightTransition;
        el.style.height = collapsedHeight;
        if (fadeOpacity) el.style.opacity = "var(--opacity-0)";
      });
    }
  }, [expanded, collapsedHeight, fadeOpacity]);

  return { ref };
}
