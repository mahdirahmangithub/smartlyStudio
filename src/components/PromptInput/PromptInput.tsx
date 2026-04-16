import {
  Children,
  forwardRef,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { InlineTextarea } from "../InlineTextarea";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { Button } from "../Button";
import { Dropdown } from "../Dropdown";
import { FileAttachment } from "../FileAttachment";
import { Thumbnail } from "../Thumbnail";
import { RowContainer } from "../RowContainer";
import { isImageFile, isVideoFile } from "../../utils/inferFileType";
import { findActiveTrigger, replaceTextRange } from "../../utils/textareaTrigger";
import { getTextareaCaretViewportRect } from "../../utils/textareaCaretRect";
import { cx } from "../../utils/cx";
import styles from "./PromptInput.module.css";
import { ATTACHMENT_MENU_ITEMS } from "./promptInputAttachmentMenuData";
import { PromptInputAttachmentMenuItems } from "./PromptInputAttachmentMenu";
import type { PromptAttachedFile, PromptInputAttachmentKind, PromptInputTriggerConfig } from "./promptInputTypes";
import {
  PromptInputContext,
  usePromptInput,
  type PromptInputContextValue,
} from "./promptInputContext";
import { filterMenuItemsByQuery } from "../../utils/textareaTrigger";

export type { PromptAttachedFile, PromptInputAttachmentKind, PromptInputTriggerConfig } from "./promptInputTypes";

/** Default triggers: both `/` and `@` show the full attachment item list. */
export const DEFAULT_TRIGGER_MENUS: readonly PromptInputTriggerConfig[] = [
  { char: "/" },
  { char: "@" },
];

/* ── File helpers ── */

function newFileId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

type AttachmentMenuSource = "none" | "button" | "caret";

interface AttachmentMenuState {
  open: boolean;
  source: AttachmentMenuSource;
  forcedAtCaret: boolean;
  query: string;
  /** The trigger character that opened this session (e.g. '/', '@'), or null when opened via + button or forced-at-caret. */
  char: string | null;
  replaceStart: number | null;
  replaceEnd: number | null;
}

const INITIAL_MENU: AttachmentMenuState = {
  open: false,
  source: "none",
  forcedAtCaret: false,
  query: "",
  char: null,
  replaceStart: null,
  replaceEnd: null,
};

/** Horizontal gap from the `/` `@` trigger to the menu anchor (leading side in reading order). */
const TRIGGER_MENU_OFFSET_BEFORE_CHAR_PX = 20;

type CaretAnchorViewportOffset = { x?: number; y?: number };

function layoutCaretAnchor(
  ta: HTMLTextAreaElement,
  caret: number,
  anchorEl: HTMLDivElement,
  viewportOffset?: CaretAnchorViewportOffset,
): void {
  const r = getTextareaCaretViewportRect(ta, caret);
  if (!r) return;
  const dx = viewportOffset?.x ?? 0;
  const dy = viewportOffset?.y ?? 0;
  anchorEl.style.visibility = "visible";
  anchorEl.style.left = `${r.left + dx}px`;
  anchorEl.style.top = `${r.top + dy}px`;
  anchorEl.style.width = "2px";
  anchorEl.style.height = `${Math.max(12, r.height)}px`;
}

/* ── Root ── */

export interface PromptInputProps {
  /** Controlled value */
  value?: string;
  /** Change handler for controlled mode */
  onChange?: (value: string) => void;
  /** Whether the AI is currently generating */
  loading?: boolean;
  /** Disable all interaction */
  disabled?: boolean;
  /** True when at least one file/attachment is present (enables submit with empty text). */
  hasAttachments?: boolean;
  /** Validation or upload error — submit stays low/disabled even if there is text or attachments. */
  error?: boolean;
  /** Called when user submits the prompt */
  onSubmit?: (value: string) => void;
  /** Called when user clicks stop during loading */
  onStop?: () => void;
  /** Notified when built-in file attachments change (internal list). */
  onAttachedFilesChange?: (files: File[]) => void;
  /** Called when the user picks an item from the add (+) menu or from an inline trigger menu. */
  onAddAttachmentSelect?: (kind: PromptInputAttachmentKind) => void;
  /**
   * Per-trigger menu configuration. Each entry maps a single character (e.g. `'/'`, `'@'`) to
   * the items shown when that character fires the inline menu.
   *
   * When a trigger's `items` is omitted, the full built-in attachment list is used for that char.
   * The `+` button always shows all built-in items regardless of this prop.
   *
   * Defaults to `DEFAULT_TRIGGER_MENUS` (`/` and `@` both showing all attachment items).
   */
  triggerMenus?: readonly PromptInputTriggerConfig[];
  /** Additional class on the field card */
  className?: string;
  children?: ReactNode;
}

export const PromptInput = forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      loading = false,
      disabled = false,
      hasAttachments = false,
      error = false,
      onSubmit,
      onStop,
      onAttachedFilesChange,
      onAddAttachmentSelect,
      triggerMenus = DEFAULT_TRIGGER_MENUS,
      className,
      children,
    },
    ref,
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState("");
    const value = isControlled ? controlledValue : internalValue;

    const [attachedFiles, setAttachedFiles] = useState<PromptAttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    const caretAnchorRef = useRef<HTMLDivElement | null>(null);
    const addMenuOnSelectRef = useRef<((kind: PromptInputAttachmentKind) => void) | null>(null);
    const forcedAtCaretRef = useRef(false);
    /** After closing the + menu, avoid immediately reopening the / @ menu on the same value + selection (e.g. click-outside focuses the field). */
    const attachmentMenuDismissAfterButtonRef = useRef<{
      value: string;
      selectionStart: number;
    } | null>(null);
    /**
     * While the menu is open we record which anchor was used. After close, `source` is "none" but
     * the Dropdown still runs its exit layout — it must keep anchoring to the + button (not the
     * caret probe at 0,0) so the panel does not jump to the viewport corner.
     */
    const attachmentMenuLastOpenAnchorRef = useRef<"button" | "caret">("button");
    const attachmentMenuRef = useRef<AttachmentMenuState>(INITIAL_MENU);

    const [attachmentMenu, setAttachmentMenu] = useState<AttachmentMenuState>(INITIAL_MENU);
    const [caretAttachmentActiveIndex, setCaretAttachmentActiveIndex] = useState(0);
    const [buttonAttachmentActiveIndex, setButtonAttachmentActiveIndex] = useState(0);
    const prevCaretMenuOpenRef = useRef(false);
    const prevButtonMenuOpenRef = useRef(false);

    /** Item count reported by a custom renderContent menu (for arrow-key wrap). */
    const [renderContentItemCount, setRenderContentItemCount] = useState(0);
    /** Pick handler registered by a custom renderContent menu. */
    const renderContentPickHandlerRef = useRef<(() => void) | null>(null);

    const attachmentMenuId = useId();

    useLayoutEffect(() => {
      attachmentMenuRef.current = attachmentMenu;
    }, [attachmentMenu]);

    const { attachmentChild, bodyChildren } = useMemo(() => {
      let attachment: ReactNode = null;
      const body: ReactNode[] = [];
      Children.forEach(children, (child) => {
        if (
          isValidElement(child) &&
          (child.type as { displayName?: string }).displayName === "PromptInputAttachments"
        ) {
          if (attachment == null) attachment = child;
        } else if (child != null && child !== false) {
          body.push(child);
        }
      });
      return { attachmentChild: attachment, bodyChildren: body };
    }, [children]);

    const hasAttachmentsEffective = Boolean(hasAttachments) || attachedFiles.length > 0;

    const removeAttachedFile = useCallback(
      (id: string) => {
        setAttachedFiles((prev) => {
          const victim = prev.find((f) => f.id === id);
          if (victim?.previewUrl) URL.revokeObjectURL(victim.previewUrl);
          const next = prev.filter((f) => f.id !== id);
          onAttachedFilesChange?.(next.map((x) => x.file));
          return next;
        });
      },
      [onAttachedFilesChange],
    );

    const openAttachmentPicker = useCallback((kind: PromptInputAttachmentKind) => {
      if (kind === "link" || kind === "context" || kind === "google-drive") {
        return;
      }
      const input = fileInputRef.current;
      if (!input) return;
      input.accept = kind === "image" ? "image/*" : "*/*";
      input.value = "";
      input.click();
    }, []);

    const onFileInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files;
        if (!list?.length) return;
        setAttachedFiles((prev) => {
          const added = Array.from(list).map((file) => {
            const previewUrl = isImageFile(file) ? URL.createObjectURL(file) : undefined;
            return { id: newFileId(), file, previewUrl };
          });
          const next = [...prev, ...added];
          onAttachedFilesChange?.(next.map((x) => x.file));
          return next;
        });
        e.target.value = "";
      },
      [onAttachedFilesChange],
    );

    const setValue = useCallback(
      (v: string) => {
        if (!isControlled) setInternalValue(v);
        onChange?.(v);
      },
      [isControlled, onChange],
    );

    const closeAttachmentMenu = useCallback(() => {
      const prev = attachmentMenuRef.current;
      const ta = textareaRef.current;
      if (prev.open && prev.source === "button" && ta) {
        attachmentMenuDismissAfterButtonRef.current = {
          value: ta.value,
          selectionStart: ta.selectionStart ?? 0,
        };
      }
      forcedAtCaretRef.current = false;
      setAttachmentMenu(INITIAL_MENU);
      const anchor = caretAnchorRef.current;
      if (anchor) anchor.style.visibility = "hidden";
    }, []);

    const openAttachmentMenuFromButton = useCallback(() => {
      if (disabled || loading) return;
      forcedAtCaretRef.current = false;
      setAttachmentMenu({
        open: true,
        source: "button",
        forcedAtCaret: false,
        query: "",
        char: null,
        replaceStart: null,
        replaceEnd: null,
      });
    }, [disabled, loading]);

    const openAttachmentMenuAtCaret = useCallback(() => {
      if (disabled || loading) return;
      forcedAtCaretRef.current = true;
      setAttachmentMenu({
        open: true,
        source: "caret",
        forcedAtCaret: true,
        query: "",
        char: null,
        replaceStart: null,
        replaceEnd: null,
      });
    }, [disabled, loading]);

    const triggerCharsSet = useMemo(
      () => new Set(triggerMenus.map((t) => t.char)),
      [triggerMenus],
    );

    const syncAttachmentMenuFromTextarea = useCallback(() => {
      const ta = textareaRef.current;
      if (!ta || disabled || loading) return;

      const m = attachmentMenuRef.current;
      if (m.open && m.source === "button") return;

      const v = ta.value;
      const caret = ta.selectionStart ?? 0;

      const match = findActiveTrigger(v, caret, { triggers: triggerCharsSet });

      const dismissSnap = attachmentMenuDismissAfterButtonRef.current;
      if (dismissSnap != null) {
        const same = v === dismissSnap.value && caret === dismissSnap.selectionStart;
        if (!same) {
          attachmentMenuDismissAfterButtonRef.current = null;
        } else if (match) {
          return;
        } else {
          attachmentMenuDismissAfterButtonRef.current = null;
        }
      }

      if (forcedAtCaretRef.current && m.open && m.source === "caret") {
        const anchor = caretAnchorRef.current;
        if (anchor) layoutCaretAnchor(ta, caret, anchor);
        return;
      }

      if (match) {
        forcedAtCaretRef.current = false;
        setAttachmentMenu({
          open: true,
          source: "caret",
          forcedAtCaret: false,
          query: match.query,
          char: match.char,
          replaceStart: match.triggerIndex,
          replaceEnd: match.endIndex,
        });
      } else if (m.open && m.source === "caret" && m.forcedAtCaret) {
        const anchor = caretAnchorRef.current;
        if (anchor) layoutCaretAnchor(ta, caret, anchor);
      } else if (m.open && m.source === "caret" && !m.forcedAtCaret) {
        closeAttachmentMenu();
      }
    }, [closeAttachmentMenu, disabled, loading, triggerCharsSet]);

    const pickAttachmentKind = useCallback(
      (kind: PromptInputAttachmentKind) => {
        const state = attachmentMenuRef.current;
        const { replaceStart, replaceEnd } = state;
        const wasCaret = state.source === "caret";
        const wasForced = state.forcedAtCaret;

        closeAttachmentMenu();

        addMenuOnSelectRef.current?.(kind);
        onAddAttachmentSelect?.(kind);

        if (kind === "file" || kind === "image" || kind === "photos-files") {
          openAttachmentPicker(kind);
        }

        if (wasCaret && !wasForced && replaceStart != null && replaceEnd != null) {
          const next = replaceTextRange(value, replaceStart, replaceEnd, "");
          setValue(next);
          queueMicrotask(() => {
            const ta = textareaRef.current;
            if (!ta) return;
            ta.focus();
            ta.setSelectionRange(replaceStart, replaceStart);
          });
        }
      },
      [closeAttachmentMenu, onAddAttachmentSelect, openAttachmentPicker, setValue, value],
    );

    useLayoutEffect(() => {
      if (!attachmentMenu.open || attachmentMenu.source !== "caret") {
        const anchor = caretAnchorRef.current;
        if (anchor) anchor.style.visibility = "hidden";
        return;
      }
      const ta = textareaRef.current;
      const anchor = caretAnchorRef.current;
      if (!ta || !anchor) return;
      const caret = ta.selectionStart ?? 0;
      const inlineTrigger =
        !attachmentMenu.forcedAtCaret && attachmentMenu.replaceStart != null;
      if (inlineTrigger && attachmentMenu.replaceStart != null) {
        const rtl = getComputedStyle(ta).direction === "rtl";
        const dx = rtl ? TRIGGER_MENU_OFFSET_BEFORE_CHAR_PX : -TRIGGER_MENU_OFFSET_BEFORE_CHAR_PX;
        layoutCaretAnchor(ta, attachmentMenu.replaceStart, anchor, { x: dx });
      } else {
        layoutCaretAnchor(ta, caret, anchor);
      }
    }, [
      attachmentMenu.open,
      attachmentMenu.source,
      attachmentMenu.query,
      attachmentMenu.replaceStart,
      attachmentMenu.forcedAtCaret,
      value,
    ]);

    useEffect(() => {
      const onSel = () => {
        const ta = textareaRef.current;
        if (document.activeElement !== ta) return;
        syncAttachmentMenuFromTextarea();
      };
      document.addEventListener("selectionchange", onSel);
      return () => document.removeEventListener("selectionchange", onSel);
    }, [syncAttachmentMenuFromTextarea]);

    const submit = useCallback(() => {
      const trimmed = value.trim();
      if ((!trimmed && !hasAttachmentsEffective) || loading || disabled || error) return;
      closeAttachmentMenu();
      onSubmit?.(trimmed);
    }, [
      value,
      hasAttachmentsEffective,
      loading,
      disabled,
      error,
      onSubmit,
      closeAttachmentMenu,
    ]);

    const stop = useCallback(() => {
      onStop?.();
    }, [onStop]);

    /** Config for the trigger character that opened the current menu session. */
    const activeConfig = useMemo(
      () =>
        attachmentMenu.char
          ? triggerMenus.find((t) => t.char === attachmentMenu.char) ?? null
          : null,
      [attachmentMenu.char, triggerMenus],
    );

    const filteredAttachmentItems = useMemo(() => {
      // When the active trigger uses a custom renderer, skip filtering entirely.
      if (activeConfig?.renderContent) return [];

      const query = attachmentMenu.source === "button" ? "" : attachmentMenu.query;
      const char = attachmentMenu.char;

      // Button or forced-at-caret (no trigger char): show full built-in list.
      if (!char) return filterMenuItemsByQuery(ATTACHMENT_MENU_ITEMS, query);

      // Inline trigger: use the items configured for this char, falling back to the full list.
      const baseItems = activeConfig?.items ?? ATTACHMENT_MENU_ITEMS;
      return filterMenuItemsByQuery(baseItems, query);
    }, [activeConfig, attachmentMenu.source, attachmentMenu.query, attachmentMenu.char]);

    /** Effective item count for arrow-key wrap — custom renderContent reports its own count. */
    const effectiveCaretItemCount = activeConfig?.renderContent
      ? renderContentItemCount
      : filteredAttachmentItems.length;

    const attachmentMenuCombobox =
      attachmentMenu.open &&
      attachmentMenu.source === "caret" &&
      (activeConfig?.renderContent
        ? renderContentItemCount > 0
        : filteredAttachmentItems.length > 0);

    useEffect(() => {
      const open = attachmentMenu.open && attachmentMenu.source === "caret";
      const n = effectiveCaretItemCount;
      if (!open) {
        prevCaretMenuOpenRef.current = false;
        return;
      }
      if (!prevCaretMenuOpenRef.current) {
        setCaretAttachmentActiveIndex(0);
        prevCaretMenuOpenRef.current = true;
        return;
      }
      setCaretAttachmentActiveIndex((p) => {
        if (n === 0) return 0;
        return Math.min(p, n - 1);
      });
    }, [
      attachmentMenu.open,
      attachmentMenu.source,
      attachmentMenu.query,
      effectiveCaretItemCount,
    ]);

    useEffect(() => {
      const open = attachmentMenu.open && attachmentMenu.source === "button";
      const n = filteredAttachmentItems.length;
      if (!open) {
        prevButtonMenuOpenRef.current = false;
        return;
      }
      if (!prevButtonMenuOpenRef.current) {
        setButtonAttachmentActiveIndex(0);
        prevButtonMenuOpenRef.current = true;
        return;
      }
      setButtonAttachmentActiveIndex((p) => {
        if (n === 0) return 0;
        return Math.min(p, n - 1);
      });
    }, [attachmentMenu.open, attachmentMenu.source, filteredAttachmentItems.length]);

    useLayoutEffect(() => {
      if (!attachmentMenuCombobox) return;
      const id = `${attachmentMenuId}-opt-${caretAttachmentActiveIndex}`;
      const el = document.getElementById(id);
      if (!el) return;
      // Walk up from the option element to find the nearest scroll container
      // that is NOT the document/body (so we don't scroll the page).
      let sc: HTMLElement | null = el.parentElement;
      while (sc && sc !== document.documentElement) {
        const s = window.getComputedStyle(sc);
        if (s.overflowY === "auto" || s.overflowY === "scroll") break;
        sc = sc.parentElement;
      }
      if (!sc || sc === document.documentElement) return;
      if (caretAttachmentActiveIndex === 0) {
        sc.scrollTop = 0;
      } else if (caretAttachmentActiveIndex === effectiveCaretItemCount - 1) {
        sc.scrollTop = sc.scrollHeight;
      } else {
        const itemRect = el.getBoundingClientRect();
        const scRect = sc.getBoundingClientRect();
        if (itemRect.top < scRect.top) sc.scrollTop -= scRect.top - itemRect.top;
        else if (itemRect.bottom > scRect.bottom) sc.scrollTop += itemRect.bottom - scRect.bottom;
      }
    }, [
      attachmentMenuCombobox,
      caretAttachmentActiveIndex,
      attachmentMenuId,
      effectiveCaretItemCount,
    ]);

    const pickHighlightedCaretAttachment = useCallback(() => {
      if (activeConfig?.renderContent) {
        renderContentPickHandlerRef.current?.();
        return;
      }
      const item = filteredAttachmentItems[caretAttachmentActiveIndex];
      if (item) pickAttachmentKind(item.kind);
    }, [activeConfig, filteredAttachmentItems, caretAttachmentActiveIndex, pickAttachmentKind]);

    if (attachmentMenu.open) {
      attachmentMenuLastOpenAnchorRef.current =
        attachmentMenu.source === "button" ? "button" : "caret";
    }
    const dropdownAnchorRef =
      attachmentMenuLastOpenAnchorRef.current === "button" ? menuButtonRef : caretAnchorRef;

    const layoutRevision = `${attachmentMenu.open}-${attachmentMenu.source}-${value.length}-${attachmentMenu.query}-${attachmentMenu.forcedAtCaret}`;

    // Compute the context menu content while the menu is open.
    // The ref preserves the last rendered content so the exit animation shows
    // the real items fading out instead of an empty panel.
    const lastContextMenuContentRef = useRef<ReactNode>(null);
    const contextMenuContent = activeConfig?.renderContent
      ? activeConfig.renderContent({
          query: attachmentMenu.query,
          onClose: closeAttachmentMenu,
          activeIndex: caretAttachmentActiveIndex,
          setItemCount: setRenderContentItemCount,
          registerPickHandler: (fn) => { renderContentPickHandlerRef.current = fn; },
          menuId: attachmentMenuId,
        })
      : null;
    if (contextMenuContent !== null) {
      lastContextMenuContentRef.current = contextMenuContent;
    }

    const ctx: PromptInputContextValue = {
      value,
      setValue,
      loading,
      disabled,
      hasAttachments: hasAttachmentsEffective,
      error,
      attachedFiles,
      removeAttachedFile,
      openAttachmentPicker,
      textareaRef,
      submit,
      stop,
      syncAttachmentMenuFromTextarea,
      openAttachmentMenuAtCaret,
      openAttachmentMenuFromButton,
      pickAttachmentKind,
      menuButtonRef,
      addMenuOnSelectRef,
      attachmentMenuOpenForButton:
        attachmentMenu.open && attachmentMenu.source === "button",
      attachmentMenuId,
      attachmentMenuOpen: attachmentMenu.open,
      attachmentMenuSource: attachmentMenu.source,
      closeAttachmentMenu,
      caretAttachmentActiveIndex,
      setCaretAttachmentActiveIndex,
      buttonAttachmentActiveIndex,
      setButtonAttachmentActiveIndex,
      caretAttachmentItemCount: effectiveCaretItemCount,
      attachmentMenuCombobox,
      pickHighlightedCaretAttachment,
    };

    return (
      <PromptInputContext.Provider value={ctx}>
        <div
          ref={ref}
          role="group"
          aria-label="Prompt input"
          className={cx(styles.field, disabled && styles.disabled, className)}
        >
          <input
            ref={fileInputRef}
            type="file"
            className={styles.fileInputHidden}
            tabIndex={-1}
            aria-label="Attach files from device"
            multiple
            onChange={onFileInputChange}
          />
          <div className={styles.fieldMain}>
            {attachmentChild}
            <div className={styles.fieldInner}>{bodyChildren}</div>
          </div>
          <div ref={caretAnchorRef} className={styles.caretAnchor} aria-hidden />

          {/* Standard attachment menu — never opens when the active trigger uses renderContent */}
          <Dropdown
            id={attachmentMenuId}
            role={attachmentMenu.source === "caret" ? "listbox" : "menu"}
            open={attachmentMenu.open && !activeConfig?.renderContent}
            onClose={closeAttachmentMenu}
            anchorRef={dropdownAnchorRef}
            placement="bottom-start"
            width={240}
            offset={4}
            returnFocusRef={
              attachmentMenu.source === "button" ? undefined : textareaRef
            }
            autoFocus={attachmentMenu.source !== "caret"}
            panelKeyboardNav={attachmentMenu.source !== "caret"}
            keyboardWrap
            layoutRevision={layoutRevision}
            clickOutsideExtraRefs={
              attachmentMenu.source === "caret" ? [textareaRef] : undefined
            }
          >
            {filteredAttachmentItems.length === 0 ? (
              <Fragment>
                <div className={styles.menuEmpty} role="presentation">
                  No matches
                </div>
              </Fragment>
            ) : (
              <PromptInputAttachmentMenuItems items={filteredAttachmentItems} />
            )}
          </Dropdown>

          {/* Custom renderContent menu — only opens when the active trigger provides renderContent */}
          <Dropdown
            id={attachmentMenuId}
            role="listbox"
            open={attachmentMenu.open && !!activeConfig?.renderContent}
            onClose={closeAttachmentMenu}
            anchorRef={caretAnchorRef}
            placement="bottom-start"
            width={280}
            offset={4}
            returnFocusRef={textareaRef}
            autoFocus={false}
            panelKeyboardNav={false}
            keyboardWrap
            layoutRevision={layoutRevision}
            clickOutsideExtraRefs={[textareaRef]}
          >
            {lastContextMenuContentRef.current}
          </Dropdown>
        </div>
      </PromptInputContext.Provider>
    );
  },
);

PromptInput.displayName = "PromptInput";

/* ── Attachments region (full-width strip above textarea + footer) ── */

export interface PromptInputAttachmentsProps {
  /** Extra rows (e.g. links, context) — stacked under the file row with 8px gap. */
  children?: ReactNode;
  className?: string;
}

export function PromptInputAttachments({ children, className }: PromptInputAttachmentsProps) {
  const { attachedFiles, removeAttachedFile } = usePromptInput();
  const showFiles = attachedFiles.length > 0;

  if (!showFiles && !children) return null;

  return (
    <div className={cx(styles.attachmentShell, className)}>
      <div className={styles.attachmentRows}>
        {showFiles && (
          <RowContainer density="md" insetLeft="sm" insetRight="sm" surface="default">
            {attachedFiles.map(({ id, file, previewUrl }) => {
              if (isImageFile(file) && previewUrl) {
                return (
                  <FileAttachment
                    key={id}
                    thumbnail={
                      <Thumbnail
                        size="lg"
                        type="media"
                        src={previewUrl}
                        alt={file.name}
                      />
                    }
                    title={file.name}
                    onRemove={() => removeAttachedFile(id)}
                  />
                );
              }
              if (isVideoFile(file)) {
                return (
                  <FileAttachment
                    key={id}
                    file={file}
                    autoThumbnailSize="lg"
                    title={file.name}
                    onRemove={() => removeAttachedFile(id)}
                  />
                );
              }
              return (
                <FileAttachment
                  key={id}
                  file={file}
                  title={file.name}
                  description={formatFileSize(file.size)}
                  onRemove={() => removeAttachedFile(id)}
                />
              );
            })}
          </RowContainer>
        )}
        {children}
      </div>
    </div>
  );
}

PromptInputAttachments.displayName = "PromptInputAttachments";

/* ── PromptInputTextarea ── */

export interface PromptInputTextareaProps {
  /** Placeholder text */
  placeholder?: string;
  /** Max height before scrolling (px). Defaults to 132 per design spec. */
  maxHeight?: number;
  /** Additional class on the InlineTextarea wrapper */
  className?: string;
}

export function PromptInputTextarea({
  placeholder = "Generate smartly...",
  maxHeight = 132,
  className,
}: PromptInputTextareaProps) {
  const {
    value,
    setValue,
    loading,
    disabled,
    textareaRef,
    submit,
    syncAttachmentMenuFromTextarea,
    attachmentMenuSource,
    attachmentMenuId,
    attachmentMenuCombobox,
    caretAttachmentActiveIndex,
    setCaretAttachmentActiveIndex,
    caretAttachmentItemCount,
    pickHighlightedCaretAttachment,
    closeAttachmentMenu,
  } = usePromptInput();
  const id = useId();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      queueMicrotask(() => syncAttachmentMenuFromTextarea());
    },
    [setValue, syncAttachmentMenuFromTextarea],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.nativeEvent.isComposing) return;

      if (attachmentMenuCombobox) {
        if (e.key === "ArrowDown" && !e.shiftKey) {
          e.preventDefault();
          setCaretAttachmentActiveIndex((i) => {
            if (caretAttachmentItemCount <= 0) return 0;
            const last = caretAttachmentItemCount - 1;
            return i >= last ? 0 : i + 1;
          });
          return;
        }
        if (e.key === "ArrowUp" && !e.shiftKey) {
          e.preventDefault();
          setCaretAttachmentActiveIndex((i) => {
            if (caretAttachmentItemCount <= 0) return 0;
            const last = caretAttachmentItemCount - 1;
            return i <= 0 ? last : i - 1;
          });
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          closeAttachmentMenu();
          return;
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          pickHighlightedCaretAttachment();
          return;
        }
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [
      attachmentMenuCombobox,
      caretAttachmentItemCount,
      setCaretAttachmentActiveIndex,
      closeAttachmentMenu,
      pickHighlightedCaretAttachment,
      submit,
    ],
  );

  const listboxId = attachmentMenuId;
  const activeDescendantId =
    attachmentMenuCombobox && attachmentMenuSource === "caret"
      ? `${attachmentMenuId}-opt-${caretAttachmentActiveIndex}`
      : undefined;

  return (
    <div className={styles.textareaWrap}>
      <div className={styles.textareaInset}>
        <InlineTextarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          autoExpand
          maxHeight={maxHeight}
          size="lg"
          className={className}
          role={attachmentMenuCombobox ? "combobox" : undefined}
          aria-controls={attachmentMenuCombobox ? listboxId : undefined}
          aria-expanded={attachmentMenuCombobox ? true : undefined}
          aria-autocomplete={attachmentMenuCombobox ? "list" : undefined}
          aria-activedescendant={activeDescendantId}
        />
      </div>
    </div>
  );
}

PromptInputTextarea.displayName = "PromptInputTextarea";

/* ── Footer ── */

export interface PromptInputFooterProps {
  children?: ReactNode;
  className?: string;
}

export function PromptInputFooter({ children, className }: PromptInputFooterProps) {
  return (
    <div className={cx(styles.footer, className)} role="toolbar" aria-label="Prompt actions">
      {children}
    </div>
  );
}

PromptInputFooter.displayName = "PromptInputFooter";

/* ── Footer start (left cluster: add menu, tools, …) ── */

export interface PromptInputFooterStartProps {
  children?: ReactNode;
  className?: string;
}

export function PromptInputFooterStart({ children, className }: PromptInputFooterStartProps) {
  return <div className={cx(styles.footerStart, className)}>{children}</div>;
}

PromptInputFooterStart.displayName = "PromptInputFooterStart";

export interface PromptInputAddMenuProps {
  /** Called after the user picks an attachment type. */
  onSelect?: (kind: PromptInputAttachmentKind) => void;
  /** Accessible name for the trigger (tooltip + aria). */
  addLabel?: string;
  className?: string;
}

export function PromptInputAddMenu({
  onSelect,
  addLabel = "Add attachment",
  className,
}: PromptInputAddMenuProps) {
  const {
    disabled,
    loading,
    openAttachmentMenuFromButton,
    menuButtonRef,
    addMenuOnSelectRef,
    attachmentMenuOpenForButton,
    attachmentMenuId,
  } = usePromptInput();
  const busy = disabled || loading;

  useLayoutEffect(() => {
    addMenuOnSelectRef.current = onSelect ?? null;
    return () => {
      addMenuOnSelectRef.current = null;
    };
  }, [onSelect, addMenuOnSelectRef]);

  return (
    <IconButton
      ref={menuButtonRef}
      className={className}
      icon={<Icon name="add" />}
      aria-label={addLabel}
      aria-haspopup="menu"
      aria-expanded={attachmentMenuOpenForButton}
      aria-controls={attachmentMenuOpenForButton ? attachmentMenuId : undefined}
      variant="neutral"
      emphasis="low"
      size="md"
      disabled={busy}
      onClick={() => !busy && openAttachmentMenuFromButton()}
    />
  );
}

PromptInputAddMenu.displayName = "PromptInputAddMenu";

export interface PromptInputToolsButtonProps {
  onClick?: () => void;
  /** Button label */
  label?: string;
  className?: string;
}

export function PromptInputToolsButton({
  onClick,
  label = "Tools",
  className,
}: PromptInputToolsButtonProps) {
  const { disabled, loading } = usePromptInput();
  const busy = disabled || loading;

  return (
    <Button
      className={className}
      variant="neutral"
      emphasis="low"
      size="md"
      disabled={busy}
      leadingIcon={<Icon name="page_info" size={20} />}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

PromptInputToolsButton.displayName = "PromptInputToolsButton";

/* ── Submit / Stop button ── */

export interface PromptInputSubmitProps {
  /** Label shown in tooltip when ready to send. */
  submitLabel?: string;
  /** Label shown in tooltip during loading. */
  stopLabel?: string;
  className?: string;
}

export function PromptInputSubmit({
  submitLabel = "Send",
  stopLabel = "Stop generating",
  className,
}: PromptInputSubmitProps) {
  const { value, loading, disabled, hasAttachments, error, submit, stop } = usePromptInput();
  const hasText = value.trim().length > 0;
  const canSubmit = (hasText || hasAttachments) && !error;

  if (loading) {
    return (
      <div className={cx(styles.footerEnd, className)}>
        <IconButton
          icon={<Icon name="stop_fill" />}
          aria-label={stopLabel}
          variant="neutral"
          emphasis="low"
          size="md"
          onClick={stop}
        />
      </div>
    );
  }

  return (
    <div className={cx(styles.footerEnd, className)}>
      <IconButton
        icon={<Icon name="arrow_upward" />}
        aria-label={submitLabel}
        variant="brand"
        emphasis={canSubmit ? "high" : "low"}
        size="md"
        disabled={disabled || !canSubmit}
        onClick={submit}
      />
    </div>
  );
}

PromptInputSubmit.displayName = "PromptInputSubmit";
