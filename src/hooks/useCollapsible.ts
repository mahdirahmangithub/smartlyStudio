import { useRef, useLayoutEffect } from "react";

/**
 * Drives a height + opacity expand/collapse animation on a container element.
 *
 * The consumer must apply the collapsed base styles on the element
 * (e.g. `overflow: hidden; height: 0; opacity: 0`).
 * The hook imperatively animates between collapsed and expanded states
 * using the design-system expand/collapse animation tokens.
 *
 * @param expanded  Whether the content should be visible.
 * @returns `ref` — attach to the collapsible wrapper `<div>`.
 */
export function useCollapsible(expanded: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const prevExpandedRef = useRef(expanded);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prev = prevExpandedRef.current;
    prevExpandedRef.current = expanded;

    if (prev === expanded) {
      el.style.height = expanded ? "auto" : "0px";
      el.style.opacity = expanded ? "var(--opacity-100)" : "var(--opacity-0)";
      return;
    }

    if (expanded) {
      el.style.transition = "none";
      el.style.height = "auto";
      el.style.opacity = "var(--opacity-100)";
      const fullHeight = el.scrollHeight;

      el.style.height = "0px";
      el.style.opacity = "var(--opacity-0)";

      requestAnimationFrame(() => {
        el.style.transition = `height var(--animation-state-expand-duration) var(--animation-state-expand-easing), opacity var(--animation-state-expand-duration) var(--animation-state-expand-easing)`;
        el.style.height = `${fullHeight}px`;
        el.style.opacity = "var(--opacity-100)";
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
        el.style.transition = `height var(--animation-state-collapse-duration) var(--animation-state-collapse-easing), opacity var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)`;
        el.style.height = "0px";
        el.style.opacity = "var(--opacity-0)";
      });
    }
  }, [expanded]);

  return { ref };
}
