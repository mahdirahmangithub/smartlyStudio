import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {
  onUpdate: (showTop: boolean, showBottom: boolean) => void;
  threshold?: number;
}

/**
 * Watches the Lexical root element for vertical scroll and content changes,
 * calling onUpdate whenever the top/bottom fade visibility should change.
 * Uses registerRootListener so it correctly handles editor re-mounts.
 */
export function ScrollFadesPlugin({ onUpdate, threshold = 2 }: Props) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let rafId = 0;
    let teardown: (() => void) | null = null;

    const check = (el: HTMLElement) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const maxScroll = el.scrollHeight - el.clientHeight;
        onUpdate(el.scrollTop > threshold, el.scrollTop < maxScroll - threshold);
      });
    };

    const unregisterRoot = editor.registerRootListener((next, prev) => {
      teardown?.();
      teardown = null;
      if (!next) return;

      const onScroll = () => check(next);
      next.addEventListener("scroll", onScroll, { passive: true });

      const ro = new ResizeObserver(() => check(next));
      ro.observe(next);

      const mo = new MutationObserver(() => check(next));
      mo.observe(next, { childList: true, subtree: true, characterData: true });

      check(next);

      teardown = () => {
        cancelAnimationFrame(rafId);
        next.removeEventListener("scroll", onScroll);
        ro.disconnect();
        mo.disconnect();
      };

      void prev;
    });

    /* Also re-check after every editor update (value changes, pastes, etc.) */
    const unregisterUpdate = editor.registerUpdateListener(() => {
      const root = editor.getRootElement();
      if (root) check(root);
    });

    return () => {
      unregisterRoot();
      unregisterUpdate();
      teardown?.();
      cancelAnimationFrame(rafId);
    };
  }, [editor, onUpdate, threshold]);

  return null;
}
