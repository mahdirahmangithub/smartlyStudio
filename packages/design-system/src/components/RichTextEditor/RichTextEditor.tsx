import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Klass, LexicalNode } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type LexicalEditor,
} from "lexical";
import { Icon } from "../Icon";
import { cx } from "../../utils/cx";
import { ControlledValuePlugin } from "./plugins/ControlledValuePlugin";
import { SubmitPlugin } from "./plugins/SubmitPlugin";
import { DisabledPlugin } from "./plugins/DisabledPlugin";
import { ScrollFadesPlugin } from "./plugins/ScrollFadesPlugin";
import styles from "./RichTextEditor.module.css";

/* ── Types ── */

export type RichTextEditorSize = "sm" | "lg";

/** Imperative handle exposed via forwardRef. */
export interface RichTextEditorHandle {
  focus(): void;
  blur(): void;
  getEditor(): LexicalEditor;
}

export interface RichTextEditorProps {
  /** Controlled plain-text value. */
  value?: string;
  /** Initial plain-text value for uncontrolled usage. */
  defaultValue?: string;
  /** Fires on every keystroke with the current plain-text content. */
  onChange?: (value: string) => void;
  /** Called on Enter (without Shift). Receives current plain-text content. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Maximum editor height before it starts scrolling. */
  maxHeight?: number | string;
  /** Minimum editor height. */
  minHeight?: number | string;
  /** sm = label/sm (14 px), lg = label/md (16 px). */
  size?: RichTextEditorSize;
  /** Show a focus ring outline around the component. */
  focusIndicator?: boolean;
  /** Show an edit icon overlay on hover (hidden while focused). */
  hoverIndicator?: boolean;
  /**
   * Show top/bottom scroll fades when content overflows maxHeight.
   * Defaults to true when maxHeight is set, false otherwise.
   * The fade color is controlled by the `--rte-fade-bg` CSS variable
   * (defaults to `--element-surface-default`).
   */
  scrollFades?: boolean;
  /**
   * Custom Lexical node classes to register (e.g. ChipNode, MentionNode).
   * Must be stable — define the array outside the component or wrap in useMemo.
   */
  nodes?: Klass<LexicalNode>[];
  /**
   * Extra Lexical plugins rendered inside the composer.
   * Use to inject custom command handlers (e.g. TriggerMenuPlugin).
   */
  plugins?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /* ARIA passthrough — important for combobox/menu integration */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  "aria-expanded"?: boolean | "true" | "false";
  "aria-controls"?: string;
  "aria-activedescendant"?: string;
  "aria-multiline"?: boolean | "true" | "false";
  role?: string;
}

/* ── Internal: EditorRef plugin ── */

function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);
  return null;
}

/* ── Internal: onChange plugin ── */

function OnChangePlugin({ onChange }: { onChange?: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const text = editorState.read(() => $getRoot().getTextContent());
      if (text === lastRef.current) return;
      lastRef.current = text;
      onChange?.(text);
    });
  }, [editor, onChange]);

  return null;
}

/* ── Main component ── */

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onSubmit,
      placeholder = "",
      disabled = false,
      maxHeight,
      minHeight,
      size = "sm",
      focusIndicator = false,
      hoverIndicator = false,
      scrollFades: scrollFadesProp,
      nodes,
      plugins,
      className,
      style,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      "aria-autocomplete": ariaAutocomplete,
      "aria-expanded": ariaExpanded,
      "aria-controls": ariaControls,
      "aria-activedescendant": ariaActivedescendant,
      "aria-multiline": ariaMultiline,
      role,
    },
    ref,
  ) => {
    const instanceId = useId();
    const editorRef = useRef<LexicalEditor | null>(null);
    const initialValueRef = useRef(value ?? defaultValue ?? "");

    /* Default: show fades whenever maxHeight is set */
    const scrollFadesEnabled = scrollFadesProp ?? maxHeight !== undefined;

    const [showFadeTop, setShowFadeTop] = useState(false);
    const [showFadeBottom, setShowFadeBottom] = useState(false);

    const handleScrollFadeUpdate = useCallback((top: boolean, bottom: boolean) => {
      setShowFadeTop(top);
      setShowFadeBottom(bottom);
    }, []);

    /* Stable config — never re-creates the editor on re-render */
    const initialConfig = useMemo(
      () => ({
        namespace: `RTE-${instanceId}`,
        onError: (error: Error) => {
          throw error;
        },
        nodes: nodes ?? [],
        editorState: initialValueRef.current
          ? () => {
              const root = $getRoot();
              const para = $createParagraphNode();
              para.append($createTextNode(initialValueRef.current));
              root.append(para);
            }
          : undefined,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      blur: () => {
        const root = editorRef.current?.getRootElement();
        if (root instanceof HTMLElement) root.blur();
      },
      getEditor: () => editorRef.current!,
    }));

    const editorStyle: CSSProperties = {};
    if (maxHeight !== undefined) {
      editorStyle.maxHeight =
        typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      editorStyle.overflowY = "auto";
    }
    if (minHeight !== undefined) {
      editorStyle.minHeight =
        typeof minHeight === "number" ? `${minHeight}px` : minHeight;
    }

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div
          className={cx(
            styles.root,
            styles[size],
            disabled && styles.disabled,
            className,
          )}
          style={style}
        >
          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                id={id}
                className={styles.editor}
                style={editorStyle}
                role={role}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledby}
                aria-describedby={ariaDescribedby}
                aria-autocomplete={ariaAutocomplete}
                aria-expanded={ariaExpanded}
                aria-controls={ariaControls}
                aria-activedescendant={ariaActivedescendant}
                aria-multiline={ariaMultiline}
              />
            }
            placeholder={
              placeholder ? (
                <div className={styles.placeholder} aria-hidden="true">
                  {placeholder}
                </div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <EditorRefPlugin editorRef={editorRef} />
          <OnChangePlugin onChange={onChange} />
          <DisabledPlugin disabled={disabled} />

          {value !== undefined && <ControlledValuePlugin value={value} />}
          {onSubmit && <SubmitPlugin onSubmit={onSubmit} />}
          {plugins}
          {scrollFadesEnabled && (
            <ScrollFadesPlugin onUpdate={handleScrollFadeUpdate} />
          )}

          {/* Scroll fades — sit inside .root so they clip to its bounds */}
          {scrollFadesEnabled && (
            <>
              <div
                className={cx(styles.fade, styles.fadeTop, showFadeTop && styles.fadeVisible)}
                aria-hidden="true"
              />
              <div
                className={cx(styles.fade, styles.fadeBottom, showFadeBottom && styles.fadeVisible)}
                aria-hidden="true"
              />
            </>
          )}

          {focusIndicator && <div className={styles.focusRing} aria-hidden="true" />}
          {hoverIndicator && (
            <div className={styles.hoverOverlay} aria-hidden="true">
              <Icon
                name="edit"
                size={size === "lg" ? 20 : 16}
                className={styles.hoverIcon}
              />
            </div>
          )}
        </div>
      </LexicalComposer>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";
