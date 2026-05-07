import { useRef, useState, useEffect } from "react";

/**
 * Returns a ref to attach to a text element and a boolean indicating
 * whether the element's content is visually truncated (scrollWidth > clientWidth).
 * Re-checks on resize and whenever `text` changes.
 */
export function useIsTruncated<T extends HTMLElement = HTMLElement>(
  text?: string,
) {
  const ref = useRef<T>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return [ref, isTruncated] as const;
}
