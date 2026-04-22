import { useCallback } from "react";
import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { Chip } from "../../Chip";
import { Icon } from "../../Icon";
import type { IconName } from "../../Icon";
import styles from "./ChipNode.module.css";

/* ── Serialised shape (needed for copy/paste) ── */

export type SerializedChipNode = Spread<
  { label: string; icon?: IconName },
  SerializedLexicalNode
>;

/* ── Node class ── */

export class ChipNode extends DecoratorNode<React.JSX.Element> {
  __label: string;
  __icon: IconName | undefined;

  static getType(): string {
    return "rte-chip";
  }

  static clone(node: ChipNode): ChipNode {
    return new ChipNode(node.__label, node.__icon, node.__key);
  }

  static importJSON(json: SerializedChipNode): ChipNode {
    return $createChipNode(json.label, json.icon);
  }

  constructor(label: string, icon?: IconName, key?: NodeKey) {
    super(key);
    this.__label = label;
    this.__icon = icon;
  }

  exportJSON(): SerializedChipNode {
    return {
      ...super.exportJSON(),
      type: "rte-chip",
      label: this.__label,
      icon: this.__icon,
      version: 1,
    };
  }

  /* The DOM element Lexical mounts the React decorator into */
  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    span.setAttribute("data-rte-chip", "true");
    return span;
  }

  /* Returning false means Lexical never calls createDOM again — React handles updates */
  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  /* When true, pressing Backspace/Delete while the node is selected removes it */
  isKeyboardSelectable(): boolean {
    return true;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): React.JSX.Element {
    return (
      <ChipNodeDecorator
        label={this.__label}
        icon={this.__icon}
        nodeKey={this.__key}
      />
    );
  }
}

/* ── Helpers ── */

export function $createChipNode(label: string, icon?: IconName): ChipNode {
  return new ChipNode(label, icon);
}

export function $isChipNode(node: LexicalNode | null | undefined): node is ChipNode {
  return node instanceof ChipNode;
}

/* ── Decorator component ── */

/*
 * Rendered by Lexical as a React portal inside the <span> from createDOM().
 * Must never be editable itself — Lexical sets contenteditable="false" on the
 * portal's host span automatically.
 */
function ChipNodeDecorator({
  label,
  icon,
  nodeKey,
}: {
  label: string;
  icon?: IconName;
  nodeKey: NodeKey;
}) {
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  /* Clicking the chip selects the node in Lexical without blurring the editor */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // keep editor focus
      clearSelection();
      setSelected(true);
    },
    [clearSelection, setSelected],
  );

  return (
    <span
      className={styles.wrapper}
      data-selected={isSelected || undefined}
      onMouseDown={handleMouseDown}
    >
      <Chip
        size="sm"
        leadingIcon={icon ? <Icon name={icon} size={12} /> : undefined}
        tabIndex={-1} // editor handles keyboard nav; chip itself is not focusable
      >
        {label}
      </Chip>
    </span>
  );
}
