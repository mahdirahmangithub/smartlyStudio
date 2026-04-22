import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {
  disabled: boolean;
}

/** Syncs the disabled prop to Lexical's editable state. */
export function DisabledPlugin({ disabled }: Props) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return null;
}
