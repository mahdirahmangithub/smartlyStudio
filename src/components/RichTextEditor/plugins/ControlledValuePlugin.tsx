import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

interface Props {
  value: string;
}

/**
 * Syncs a controlled `value` string into the Lexical editor.
 * Guards against update loops by comparing against the last value we pushed.
 */
export function ControlledValuePlugin({ value }: Props) {
  const [editor] = useLexicalComposerContext();
  const lastSetRef = useRef<string | null>(null);

  useEffect(() => {
    if (value === lastSetRef.current) return;

    const current = editor.getEditorState().read(() => $getRoot().getTextContent());
    if (value === current) {
      lastSetRef.current = value;
      return;
    }

    lastSetRef.current = value;
    editor.update(() => {
      const root = $getRoot();
      // NOTE: root.clear() removes all nodes including any DecoratorNodes (e.g. ChipNode).
      // This is intentional for fully controlled plain-text usage. If you need to preserve
      // inline chips/mentions across external value changes, manage deletion surgically
      // via editor.update() inside your trigger-pick handler instead of going through setValue.
      root.clear();
      const para = $createParagraphNode();
      if (value) para.append($createTextNode(value));
      root.append(para);
    });
  }, [editor, value]);

  return null;
}
