/**
 * Match a keyboard event against a shortcut string like `"mod+k"`,
 * `"mod+shift+enter"`, `"alt+left"`, etc.
 *
 * Tokens:
 * - `mod` — Cmd on macOS / iOS, Ctrl elsewhere. Cross-platform shortcut.
 * - `ctrl` — explicit Ctrl key (no Cmd substitution on Mac).
 * - `meta` — explicit Cmd / Win key.
 * - `shift`, `alt` — modifier keys.
 * - The final token is the key name (case-insensitive, matched against `e.key`).
 *
 * Examples:
 *   matchesShortcut(e, "mod+k")            // ⌘K on Mac, Ctrl+K elsewhere
 *   matchesShortcut(e, "mod+shift+enter")  // ⌘⇧↩ on Mac, Ctrl+Shift+↩ elsewhere
 *   matchesShortcut(e, "alt+left")         // ⌥← (back navigation)
 *   matchesShortcut(e, "escape")           // unmodified Escape
 */
export function matchesShortcut(
  e: KeyboardEvent | React.KeyboardEvent,
  shortcut: string,
): boolean {
  const parts = shortcut.toLowerCase().split("+").map((p) => p.trim());
  const key = parts[parts.length - 1];
  const needMod = parts.includes("mod");
  const needCtrl = parts.includes("ctrl");
  const needMeta = parts.includes("meta");
  const needShift = parts.includes("shift");
  const needAlt = parts.includes("alt");

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);
  const modPressed = isMac ? e.metaKey : e.ctrlKey;

  if (e.key.toLowerCase() !== key) return false;
  if (needMod !== modPressed) return false;
  if (needCtrl && !e.ctrlKey) return false;
  if (needMeta && !e.metaKey) return false;
  // When `mod` is specified we already enforced its presence; otherwise the
  // unmodified case must reject any incidental mod presses (Cmd on Mac, Ctrl
  // elsewhere) — but not the explicit ctrl/meta variants.
  if (!needMod && !needCtrl && !needMeta) {
    if (modPressed) return false;
  }
  if (needShift !== e.shiftKey) return false;
  if (needAlt !== e.altKey) return false;
  return true;
}
