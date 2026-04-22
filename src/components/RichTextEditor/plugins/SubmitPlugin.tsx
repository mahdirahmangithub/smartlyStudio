import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from "lexical";

interface Props {
  onSubmit: (value: string) => void;
  /** When true (default), Shift+Enter inserts a newline instead of submitting. */
  shiftEnterNewline?: boolean;
}

/**
 * Intercepts Enter key in the editor. Without Shift, calls onSubmit with
 * the current plain-text content. Shift+Enter passes through (inserts newline).
 */
export function SubmitPlugin({ onSubmit, shiftEnterNewline = true }: Props) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event && (shiftEnterNewline ? !event.shiftKey : true)) {
          event.preventDefault();
          const value = editor.getEditorState().read(() => $getRoot().getTextContent());
          onSubmit(value);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, onSubmit, shiftEnterNewline]);

  return null;
}
