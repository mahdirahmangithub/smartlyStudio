import { useEffect, useLayoutEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
} from "lexical";
import { findActiveTrigger, type ActiveTextareaTrigger } from "../../../utils/textareaTrigger";

export type { ActiveTextareaTrigger };

export interface TriggerMenuPluginProps {
  /** Set of characters that open the menu (e.g. new Set(["/", "@"])). */
  triggers: ReadonlySet<string>;
  disabled?: boolean;
  /**
   * Called whenever a trigger is active under the caret.
   * `caretRect` is the viewport-relative bounding rect of the current caret position.
   */
  onMatch: (match: ActiveTextareaTrigger, caretRect: DOMRect) => void;
  /** Called whenever no trigger is active (caret moved away, text deleted, etc). */
  onDismiss: () => void;
  /**
   * Raw keydown handler injected into the editor command pipeline.
   * Return `true` to consume the event (prevents default + stops further commands,
   * including KEY_ENTER_COMMAND firing for Enter).
   */
  onKeyDown?: (e: KeyboardEvent) => boolean;
}

/**
 * Lexical plugin that detects trigger characters (/ @ etc.) under the caret
 * and fires match/dismiss callbacks so a parent can open/close a dropdown.
 *
 * Uses stable refs internally so it registers commands only once, never
 * causing unnecessary re-renders or command churn as parent state changes.
 */
export function TriggerMenuPlugin({
  triggers,
  disabled,
  onMatch,
  onDismiss,
  onKeyDown,
}: TriggerMenuPluginProps) {
  const [editor] = useLexicalComposerContext();

  // Stable refs — keep callbacks/options current without re-registering commands
  const onMatchRef = useRef(onMatch);
  const onDismissRef = useRef(onDismiss);
  const onKeyDownRef = useRef(onKeyDown);
  const disabledRef = useRef(disabled);
  const triggersRef = useRef(triggers);

  useLayoutEffect(() => {
    onMatchRef.current = onMatch;
    onDismissRef.current = onDismiss;
    onKeyDownRef.current = onKeyDown;
    disabledRef.current = disabled;
    triggersRef.current = triggers;
  });

  // Update listener — detects trigger on every editor state change
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (disabledRef.current) {
        onDismissRef.current();
        return;
      }

      editorState.read(() => {
        const text = $getRoot().getTextContent();
        const caretOffset = $getCaretOffset();

        if (caretOffset < 0) {
          onDismissRef.current();
          return;
        }

        const match = findActiveTrigger(text, caretOffset, { triggers: triggersRef.current });

        if (match) {
          const sel = window.getSelection();
          if (!sel || sel.rangeCount === 0) return;
          const rect = sel.getRangeAt(0).getBoundingClientRect();
          // Skip degenerate rects (IME composition, hidden editor, etc.)
          if (rect.width === 0 && rect.height === 0) return;
          onMatchRef.current(match, rect);
        } else {
          onDismissRef.current();
        }
      });
    });
  }, [editor]);

  // Key command — single stable registration; delegates to current ref
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (e) => onKeyDownRef.current?.(e) ?? false,
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}

/**
 * Computes the absolute character offset of the collapsed selection anchor
 * within the plain-text string returned by `$getRoot().getTextContent()`.
 * Returns -1 when selection is absent, non-collapsed, or on an element node.
 */
function $getCaretOffset(): number {
  const sel = $getSelection();
  if (!$isRangeSelection(sel) || !sel.isCollapsed()) return -1;

  const anchor = sel.anchor;
  if (anchor.type !== "text") return -1;

  const anchorKey = anchor.key;
  const root = $getRoot();
  let offset = 0;

  const paragraphs = root.getChildren();
  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi];

    if ($isTextNode(para)) {
      if (para.getKey() === anchorKey) return offset + anchor.offset;
      offset += para.getTextContentSize();
    } else if ($isElementNode(para)) {
      let childOffset = 0;
      let foundInPara = false;
      for (const child of para.getChildren()) {
        if ($isTextNode(child) && child.getKey() === anchorKey) {
          foundInPara = true;
          childOffset += anchor.offset;
          break;
        }
        childOffset += child.getTextContentSize();
      }
      if (foundInPara) return offset + childOffset;
      offset += para.getTextContentSize();
    }

    // \n separator between paragraphs (matches getTextContent() behaviour)
    if (pi < paragraphs.length - 1) offset += 1;
  }

  return -1;
}
