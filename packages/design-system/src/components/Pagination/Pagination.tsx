import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { IconButton } from "../IconButton";
import { ToggleButton } from "../ToggleButton";
import { Button } from "../Button";
import { Input } from "../Input";
import { Icon } from "../Icon";
import { Dropdown } from "../Dropdown";
import { SingleSelectOption } from "../SingleSelectOption";
import { cx } from "../../utils/cx";
import {
  buildPaginationItems,
  type PaginationItem,
} from "./buildPaginationItems";
import styles from "./Pagination.module.css";

/* ─────────────────────────── Types ─────────────────────────── */

export type PaginationSize = "sm" | "lg";

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total number of pages. `count <= 0` renders nothing. */
  count: number;
  /** Current page (1-indexed). Clamped to `[1, count]`. */
  page: number;
  /** Fires when the user navigates to a different page. */
  onChange: (page: number) => void;

  /**
   * Visual size of every sub-component (arrows, page buttons, input,
   * menu trigger). Default "sm".
   *  - "sm" → IconButton/ToggleButton/Button at "md", Input at "md".
   *  - "lg" → all sub-components at "lg" plus a wider ellipsis gutter.
   */
  size?: PaginationSize;

  /** Compact mode — input field instead of the page-button row. Default false. */
  compact?: boolean;
  /**
   * Which control sits between the prev / next arrows in compact mode.
   *  - "input" (default): a numeric Input. Type a page number, Enter / Blur
   *    to navigate.
   *  - "menu": a low-emphasis neutral Button labeled with the current page.
   *    Click opens a Dropdown listing every page; selecting one navigates.
   */
  compactControl?: "input" | "menu";
  /** Optional caption rendered before the prev button (compact mode only). */
  caption?: string;
  /**
   * Show the "of N" total after the next button (compact mode only).
   * Default true. Set to false for tight footers where the count is implied.
   */
  showTotal?: boolean;

  /** Pages around the current page (default 1). */
  siblingCount?: number;
  /** Pages always anchored at the start/end (default 1). */
  boundaryCount?: number;

  /** Disable the entire control. */
  disabled?: boolean;

  /** aria-label for the wrapping <nav>. Default "Pagination". */
  "aria-label"?: string;
  /** i18n hook for the per-page button aria-label. */
  getItemAriaLabel?: (page: number, isCurrent: boolean) => string;
  /** aria-label for the previous-page button. Default "Previous page". */
  previousAriaLabel?: string;
  /** aria-label for the next-page button. Default "Next page". */
  nextAriaLabel?: string;
  /**
   * i18n hook for the polite live-region announcement that fires on every
   * page change. Default `(page, count) => "Page {page} of {count}"`.
   */
  getAnnouncement?: (page: number, count: number) => string;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

const defaultGetItemAriaLabel = (p: number, isCurrent: boolean) =>
  isCurrent ? `Page ${p}, current page` : `Go to page ${p}`;

const defaultGetAnnouncement = (p: number, c: number) => `Page ${p} of ${c}`;

/* Map Pagination's two sizes onto the underlying primitives. The sub-
 * components have their own size enums (Button has sm/md/lg, Input has
 * md/lg/xl) so we centralize the translation here. */
const ICON_BUTTON_SIZE: Record<PaginationSize, "md" | "lg"> = {
  sm: "md",
  lg: "lg",
};
const TOGGLE_BUTTON_SIZE: Record<PaginationSize, "md" | "lg"> = {
  sm: "md",
  lg: "lg",
};
const BUTTON_SIZE: Record<PaginationSize, "md" | "lg"> = {
  sm: "md",
  lg: "lg",
};
const INPUT_SIZE: Record<PaginationSize, "md" | "lg"> = {
  sm: "md",
  lg: "lg",
};
const CHEVRON_ICON_SIZE: Record<PaginationSize, number> = {
  sm: 20,
  lg: 20,
};
const ELLIPSIS_ICON_SIZE: Record<PaginationSize, number> = {
  sm: 20,
  lg: 24,
};
const SIZE_CLASS: Record<PaginationSize, string> = {
  sm: styles.sizeSm,
  lg: styles.sizeLg,
};

type PageGroup =
  | { kind: "pages"; pages: number[] }
  | { kind: "ellipsis"; key: string };

function groupItems(items: PaginationItem[]): PageGroup[] {
  const groups: PageGroup[] = [];
  let current: number[] = [];
  let ellipsisIdx = 0;
  for (const item of items) {
    if (typeof item === "number") {
      current.push(item);
    } else {
      if (current.length) {
        groups.push({ kind: "pages", pages: current });
        current = [];
      }
      groups.push({ kind: "ellipsis", key: `${item}-${ellipsisIdx++}` });
    }
  }
  if (current.length) groups.push({ kind: "pages", pages: current });
  return groups;
}

/* ─────────────────────────── Component ─────────────────────────── */

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      count,
      page,
      onChange,
      compact = false,
      compactControl = "input",
      caption,
      showTotal = true,
      siblingCount = 1,
      boundaryCount = 1,
      disabled = false,
      size = "sm",
      className,
      "aria-label": ariaLabel = "Pagination",
      getItemAriaLabel = defaultGetItemAriaLabel,
      previousAriaLabel = "Previous page",
      nextAriaLabel = "Next page",
      getAnnouncement = defaultGetAnnouncement,
      ...rest
    },
    ref,
  ) {
    const totalId = useId();
    const pageListRef = useRef<HTMLOListElement>(null);

    const [announcement, setAnnouncement] = useState("");
    const isFirstAnnouncementRef = useRef(true);

    // Compute clamped values up-front so hooks below can depend on them.
    // Math.max(1, ...) keeps safeCount valid even when `count` is invalid;
    // the `count <= 0` early return below still prevents render in that case.
    const safeCount = Math.max(1, Math.floor(count));
    const safePage = Math.min(Math.max(1, Math.floor(page)), safeCount);

    useEffect(() => {
      if (count <= 0) return;
      // Skip the mount announcement; only fire after a real page change.
      if (isFirstAnnouncementRef.current) {
        isFirstAnnouncementRef.current = false;
        return;
      }
      setAnnouncement(getAnnouncement(safePage, safeCount));
    }, [count, safePage, safeCount, getAnnouncement]);

    const handlePageListKeyDown = useCallback(
      (event: KeyboardEvent<HTMLOListElement>) => {
        if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey)
          return;
        const list = pageListRef.current;
        if (!list) return;
        const buttons = Array.from(
          list.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
        );
        if (buttons.length === 0) return;
        const currentIndex = buttons.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (currentIndex === -1) return;

        let nextIndex: number | undefined;
        switch (event.key) {
          case "ArrowRight":
            event.preventDefault();
            nextIndex = Math.min(currentIndex + 1, buttons.length - 1);
            break;
          case "ArrowLeft":
            event.preventDefault();
            nextIndex = Math.max(currentIndex - 1, 0);
            break;
          case "Home":
            event.preventDefault();
            nextIndex = 0;
            break;
          case "End":
            event.preventDefault();
            nextIndex = buttons.length - 1;
            break;
          default:
            return;
        }

        const target = buttons[nextIndex!];
        if (target && target !== document.activeElement) target.focus();
      },
      [],
    );

    const liveRegion = (
      <span
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </span>
    );

    if (count <= 0) return null;

    const goPrev = () => {
      if (!disabled && safePage > 1) onChange(safePage - 1);
    };
    const goNext = () => {
      if (!disabled && safePage < safeCount) onChange(safePage + 1);
    };
    const goTo = (p: number) => {
      if (!disabled && p !== safePage && p >= 1 && p <= safeCount) onChange(p);
    };

    const prevButton = (
      <IconButton
        icon={<Icon name="chevron_left" size={CHEVRON_ICON_SIZE[size]} />}
        aria-label={previousAriaLabel}
        emphasis="low"
        variant="neutral"
        size={ICON_BUTTON_SIZE[size]}
        hideTooltip
        disabled={disabled || safePage <= 1}
        onClick={goPrev}
      />
    );

    const nextButton = (
      <IconButton
        icon={<Icon name="chevron_right" size={CHEVRON_ICON_SIZE[size]} />}
        aria-label={nextAriaLabel}
        emphasis="low"
        variant="neutral"
        size={ICON_BUTTON_SIZE[size]}
        hideTooltip
        disabled={disabled || safePage >= safeCount}
        onClick={goNext}
      />
    );

    if (compact) {
      return (
        <nav
          ref={ref}
          aria-label={ariaLabel}
          className={cx(styles.root, styles.compact, SIZE_CLASS[size], className)}
          {...rest}
        >
          {liveRegion}
          {caption && <span className={styles.caption}>{caption}</span>}
          <div className={styles.compactBase}>
            {prevButton}
            {compactControl === "menu" ? (
              <CompactMenu
                page={safePage}
                count={safeCount}
                onChange={goTo}
                disabled={disabled}
                totalId={showTotal ? totalId : undefined}
                size={size}
              />
            ) : (
              <CompactInput
                page={safePage}
                count={safeCount}
                onChange={goTo}
                disabled={disabled}
                totalId={showTotal ? totalId : undefined}
                size={size}
              />
            )}
            {nextButton}
          </div>
          {showTotal && (
            <span className={styles.totalText} id={totalId}>
              of {safeCount}
            </span>
          )}
        </nav>
      );
    }

    const items = buildPaginationItems(
      safeCount,
      safePage,
      boundaryCount,
      siblingCount,
    );
    const groups = groupItems(items);

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={cx(styles.root, SIZE_CLASS[size], className)}
        {...rest}
      >
        {liveRegion}
        {prevButton}
        <ol
          ref={pageListRef}
          className={styles.pageList}
          onKeyDown={handlePageListKeyDown}
        >
          {groups.map((g, gi) => {
            if (g.kind === "ellipsis") {
              return (
                <li
                  key={g.key}
                  aria-hidden="true"
                  className={styles.ellipsis}
                >
                  <Icon name="more_horiz" size={ELLIPSIS_ICON_SIZE[size]} />
                </li>
              );
            }

            const isJoined = g.pages.length > 1;
            return (
              <li key={`g-${gi}`}>
                <ol className={isJoined ? styles.joinedList : styles.singleList}>
                  {g.pages.map((p, pi) => {
                    const isCurrent = p === safePage;
                    const positionClass = isJoined
                      ? pi === 0
                        ? styles.joinedFirst
                        : pi === g.pages.length - 1
                          ? styles.joinedLast
                          : styles.joinedMiddle
                      : undefined;
                    return (
                      <li key={p}>
                        <ToggleButton
                          size={TOGGLE_BUTTON_SIZE[size]}
                          emphasis="medium"
                          checked={isCurrent}
                          disabled={disabled}
                          aria-label={getItemAriaLabel(p, isCurrent)}
                          aria-current={isCurrent ? "page" : undefined}
                          tabIndex={isCurrent ? 0 : -1}
                          onClick={() => goTo(p)}
                          className={cx(
                            styles.pageButton,
                            positionClass,
                            isCurrent && styles.pageButtonCurrent,
                          )}
                        >
                          {p}
                        </ToggleButton>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>
        {nextButton}
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";

/* ─────────────────────────── Compact input ─────────────────────────── */

interface CompactInputProps {
  page: number;
  count: number;
  onChange: (page: number) => void;
  disabled: boolean;
  totalId: string | undefined;
  size: PaginationSize;
}

function CompactInput({
  page,
  count,
  onChange,
  disabled,
  totalId,
  size,
}: CompactInputProps) {
  const [draft, setDraft] = useState(String(page));

  // Re-sync the input when the parent's `page` updates (e.g. the user clicked
  // prev/next, or a sibling Pagination instance changed pages).
  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const submit = () => {
    const trimmed = draft.trim();
    const parsed = Number(trimmed);
    if (trimmed && Number.isFinite(parsed)) {
      const clamped = Math.min(Math.max(1, Math.floor(parsed)), count);
      setDraft(String(clamped));
      if (clamped !== page) onChange(clamped);
    } else {
      // Restore the displayed value on invalid input.
      setDraft(String(page));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.compactForm}>
      <Input
        size={INPUT_SIZE[size]}
        numeric
        min={1}
        max={count}
        precision={0}
        value={draft}
        disabled={disabled || count <= 1}
        aria-label="Go to page"
        aria-describedby={totalId}
        className={styles.compactInput}
        onChange={handleChange}
        onBlur={submit}
      />
    </form>
  );
}

/* ─────────────────────────── Compact menu ─────────────────────────── */

interface CompactMenuProps {
  page: number;
  count: number;
  onChange: (page: number) => void;
  disabled: boolean;
  totalId: string | undefined;
  size: PaginationSize;
}

function CompactMenu({
  page,
  count,
  onChange,
  disabled,
  totalId,
  size,
}: CompactMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const pages = useMemo(
    () => Array.from({ length: count }, (_, i) => i + 1),
    [count],
  );

  const handleSelect = (p: number) => {
    setOpen(false);
    if (p !== page) onChange(p);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        size={BUTTON_SIZE[size]}
        variant="neutral"
        emphasis="low"
        disabled={disabled || count <= 1}
        aria-label="Select page"
        aria-describedby={totalId}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={styles.compactMenuTrigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        {page}
      </Button>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={triggerRef}
        returnFocusRef={triggerRef}
        role="listbox"
        aria-label="Select page"
        maxHeight={320}
        /* Numeric width fed into Dropdown's positioning math — close to
         * the rendered `4ch + var(--spacing-md)` value so the panel sits
         * correctly relative to the trigger. The exact visual width comes
         * from .compactMenuDropdown's CSS, which !important-overrides the
         * inline style the Dropdown sets from this prop. */
        width={48}
        className={styles.compactMenuDropdown}
      >
        {pages.map((p) => (
          <SingleSelectOption
            key={p}
            labelText={String(p)}
            description={false}
            checked={p === page}
            onChange={() => handleSelect(p)}
          />
        ))}
      </Dropdown>
    </>
  );
}
