/**
 * Parse an active inline trigger (e.g. `/`, `@`) before the caret for typeahead menus.
 * Trigger is valid only at start of string or after whitespace.
 * Query is the substring from immediately after the trigger through the caret (no newlines).
 */

export interface ActiveTextareaTrigger {
  char: string;
  /** Index of the trigger character in `value`. */
  triggerIndex: number;
  /** Filter text after the trigger up to the caret. */
  query: string;
  /** Exclusive end index for replacing trigger + query on pick (usually the caret). */
  endIndex: number;
}

export interface FindActiveTriggerOptions {
  /** Characters that start a session (e.g. `/` and `@`). */
  triggers: ReadonlySet<string>;
}

/**
 * Walk backward from the caret to find the nearest valid trigger.
 * Returns null if no active session (including when another trigger char appears inside the query).
 */
export function findActiveTrigger(
  value: string,
  caret: number,
  options: FindActiveTriggerOptions,
): ActiveTextareaTrigger | null {
  const { triggers } = options;
  if (caret < 1) return null;

  for (let i = caret - 1; i >= 0; i--) {
    const ch = value[i];
    if (!triggers.has(ch)) continue;

    const atBoundary = i === 0 || /\s/.test(value[i - 1] ?? "");
    if (!atBoundary) continue;

    const querySlice = value.slice(i + 1, caret);
    if (querySlice.includes("\n")) continue;

    /* Disallow another trigger character inside the query (e.g. `//`, `/foo@`). */
    let nested = false;
    for (const t of triggers) {
      if (querySlice.includes(t)) {
        nested = true;
        break;
      }
    }
    if (nested) continue;

    return {
      char: ch,
      triggerIndex: i,
      query: querySlice,
      endIndex: caret,
    };
  }

  return null;
}

export function replaceTextRange(
  value: string,
  start: number,
  end: number,
  insertion: string,
): string {
  const a = Math.max(0, Math.min(start, value.length));
  const b = Math.max(a, Math.min(end, value.length));
  return value.slice(0, a) + insertion + value.slice(b);
}

export interface FilterableMenuItem {
  label: string;
  keywords?: readonly string[];
}

/**
 * Case-insensitive substring match; prefix matches sort first.
 */
export function filterMenuItemsByQuery<T extends FilterableMenuItem>(
  items: readonly T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];

  const scored = items
    .map((item) => {
      const label = item.label.toLowerCase();
      const hay = [label, ...(item.keywords ?? []).map((k) => k.toLowerCase())].join(" ");
      if (!hay.includes(q)) return null;
      const prefix = label.startsWith(q) ? 0 : 1;
      return { item, prefix };
    })
    .filter((x): x is { item: T; prefix: number } => x != null);

  scored.sort((a, b) => a.prefix - b.prefix || a.item.label.localeCompare(b.item.label));
  return scored.map((s) => s.item);
}
