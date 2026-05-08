import {
  useCallback,
  useLayoutEffect,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

/**
 * Wires up the WAI-ARIA combobox pattern (input keeps DOM focus, options
 * highlighted via `aria-activedescendant`) for any "input + Dropdown" pair
 * in this design system.
 *
 * Used by Combobox internally and exposed for SelectInput / MultiSelectInput
 * consumers that want the same UX. Mirrors React Aria `useComboBox`'s
 * external surface — input is the active keyboard citizen, panel is passive.
 *
 * Usage:
 * ```tsx
 * const cbx = useDropdownCombobox({
 *   open, setOpen,
 *   panelId,
 *   inputRef,
 *   onCommit: (value, label) => { ... },
 *   revalidateKey: query, // triggers highlight reset when filter changes
 * });
 *
 * <SelectInput
 *   {...cbx.inputProps}
 *   onKeyDown={cbx.handleInputKeyDown}
 *   ...
 * />
 *
 * <Dropdown id={panelId} {...cbx.dropdownProps}>
 *   {options.map((opt) => (
 *     <SingleSelectOption
 *       key={opt.value}
 *       {...cbx.getOptionProps(opt.value, opt.label)}
 *       onChange={() => cbx.commit(opt.value, opt.label)}
 *       labelText={opt.label}
 *     />
 *   ))}
 * </Dropdown>
 * ```
 */
export interface UseDropdownComboboxConfig {
  /** Controlled open state of the Dropdown. */
  open: boolean;
  /** Setter for `open`; called on Escape and after commit. */
  setOpen: (open: boolean) => void;
  /** The Dropdown's `id` — used to derive option ids and find the panel. */
  panelId: string;
  /** Ref to the input element that owns DOM focus. */
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /** Fires when the user picks an option (via Enter, Tab, or click). */
  onCommit: (value: string, label: string) => void;
  /**
   * When this value changes (e.g. the filter query, or item count), the
   * highlight is re-validated against the currently visible options and
   * re-anchored to the first match if the previous highlight is gone.
   */
  revalidateKey?: unknown;
  /**
   * If true, Tab commits the highlighted option. Per React Aria precedent;
   * default true. Set false for cases where Tab should cancel/exit.
   */
  commitOnTab?: boolean;
}

export interface UseDropdownComboboxReturn {
  /** Currently highlighted option's `value` — null when nothing is highlighted. */
  highlightedKey: string | null;
  setHighlightedKey: (key: string | null) => void;
  /** Stable id for an option's interactive element. Use as `optionId`. */
  getItemId: (value: string) => string;
  /** Spread on the `<input>` (or `<SelectInput>` etc.). */
  inputProps: {
    "aria-activedescendant": string | undefined;
  };
  /** Spread on the `<Dropdown>`. */
  dropdownProps: {
    panelKeyboardNav: false;
  };
  /**
   * Returns the props to spread on each option element so it participates in
   * the activedescendant highlight + scroll/commit lookup.
   */
  getOptionProps: (
    value: string,
    label: string,
  ) => {
    optionId: string;
    isActive: boolean;
    unmanagedFocus: true;
    "data-combobox-value": string;
    "data-combobox-label": string;
  };
  /** Attach to the input's `onKeyDown`. */
  handleInputKeyDown: (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  /** Programmatically commit the currently highlighted option (if any). */
  commitHighlighted: () => boolean;
  /** Direct commit by value+label (e.g. mouse click on an option). */
  commit: (value: string, label: string) => void;
}

/** Sanitize a value into an id-safe suffix (matches Combobox's prior behavior). */
function sanitize(v: string): string {
  return v.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function useDropdownCombobox(
  config: UseDropdownComboboxConfig,
): UseDropdownComboboxReturn {
  const {
    open,
    setOpen,
    panelId,
    onCommit,
    revalidateKey,
    commitOnTab = true,
  } = config;

  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  const getItemId = useCallback(
    (value: string) => `${panelId}-opt-${sanitize(value)}`,
    [panelId],
  );

  /** Read currently visible, non-disabled options from the open panel. */
  const readVisibleOptions = useCallback((): {
    value: string;
    el: HTMLElement;
  }[] => {
    const panel = document.getElementById(panelId);
    if (!panel) return [];
    const els = Array.from(
      panel.querySelectorAll<HTMLElement>(
        '[role="option"]:not([aria-disabled="true"])',
      ),
    );
    return els
      .map((el) => {
        const wrapper = el.closest<HTMLElement>("[data-combobox-value]");
        const value = wrapper?.getAttribute("data-combobox-value");
        return value ? { value, el } : null;
      })
      .filter((x): x is { value: string; el: HTMLElement } => x !== null);
  }, [panelId]);

  const moveHighlight = useCallback(
    (delta: number | "first" | "last") => {
      const opts = readVisibleOptions();
      if (opts.length === 0) {
        setHighlightedKey(null);
        return;
      }
      let nextIdx: number;
      if (delta === "first") nextIdx = 0;
      else if (delta === "last") nextIdx = opts.length - 1;
      else {
        const currentIdx = opts.findIndex((o) => o.value === highlightedKey);
        if (currentIdx === -1) {
          nextIdx = delta > 0 ? 0 : opts.length - 1;
        } else {
          nextIdx = Math.max(0, Math.min(opts.length - 1, currentIdx + delta));
        }
      }
      const next = opts[nextIdx];
      setHighlightedKey(next.value);
      next.el.scrollIntoView({ block: "nearest" });
    },
    [readVisibleOptions, highlightedKey],
  );

  const commit = useCallback(
    (value: string, label: string) => {
      onCommit(value, label);
    },
    [onCommit],
  );

  const commitHighlighted = useCallback((): boolean => {
    if (!highlightedKey) return false;
    const panel = document.getElementById(panelId);
    if (!panel) return false;
    const el = panel.querySelector<HTMLElement>(
      `#${CSS.escape(getItemId(highlightedKey))}`,
    );
    if (!el) return false;
    const wrapper = el.closest<HTMLElement>("[data-combobox-value]");
    const value =
      wrapper?.getAttribute("data-combobox-value") ?? highlightedKey;
    const label =
      wrapper?.getAttribute("data-combobox-label") ?? highlightedKey;
    commit(value, label);
    return true;
  }, [highlightedKey, panelId, getItemId, commit]);

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        moveHighlight(1);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        moveHighlight(-1);
        return;
      }
      if (e.key === "Home") {
        if (!open) return;
        e.preventDefault();
        moveHighlight("first");
        return;
      }
      if (e.key === "End") {
        if (!open) return;
        e.preventDefault();
        moveHighlight("last");
        return;
      }
      if (e.key === "Enter") {
        if (open) {
          if (commitHighlighted()) e.preventDefault();
        } else {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (e.key === "Tab" && open) {
        // React Aria precedent — Tab commits the highlight, then closes.
        // Always close regardless: works for single-select (consumer's onCommit
        // typically also closes — redundant setOpen(false) is harmless) AND
        // multi-select (consumer's onCommit only toggles, so Tab still exits).
        // Don't preventDefault: we want native Tab focus movement after commit.
        if (commitOnTab) commitHighlighted();
        setOpen(false);
        return;
      }
    },
    [open, setOpen, moveHighlight, commitHighlighted, commitOnTab],
  );

  // Reset highlight when the panel closes — next open starts fresh.
  useLayoutEffect(() => {
    if (!open) setHighlightedKey(null);
  }, [open]);

  // Re-validate the highlight against currently visible options whenever the
  // filter / item set changes. Anchor to the first visible match so the input
  // always has a meaningful target for `aria-activedescendant`.
  useLayoutEffect(() => {
    if (!open) return;
    if (highlightedKey !== null) {
      const panel = document.getElementById(panelId);
      const stillVisible = panel?.querySelector(
        `#${CSS.escape(getItemId(highlightedKey))}`,
      );
      if (stillVisible) return;
    }
    const opts = readVisibleOptions();
    if (opts.length === 0) {
      setHighlightedKey(null);
      return;
    }
    setHighlightedKey(opts[0].value);
    // Intentionally include `revalidateKey` so the consumer can trigger a
    // re-anchor when their filter changes / items mount-unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, revalidateKey]);

  const activeDescendantId =
    open && highlightedKey ? getItemId(highlightedKey) : undefined;

  const getOptionProps = useCallback(
    (value: string, label: string) => ({
      optionId: getItemId(value),
      isActive: highlightedKey === value,
      unmanagedFocus: true as const,
      "data-combobox-value": value,
      "data-combobox-label": label,
    }),
    [getItemId, highlightedKey],
  );

  return {
    highlightedKey,
    setHighlightedKey,
    getItemId,
    inputProps: {
      "aria-activedescendant": activeDescendantId,
    },
    dropdownProps: {
      panelKeyboardNav: false as const,
    },
    getOptionProps,
    handleInputKeyDown,
    commitHighlighted,
    commit,
  };
}
