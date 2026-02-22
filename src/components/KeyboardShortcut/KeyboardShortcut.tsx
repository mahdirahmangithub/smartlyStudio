import type { HTMLAttributes } from "react";
import styles from "./KeyboardShortcut.module.css";

export type KeyboardShortcutSize = "sm" | "lg";

export interface KeyboardShortcutProps
  extends HTMLAttributes<HTMLElement> {
  /** The key label to display (e.g. "⌘", "Shift", "K") */
  keyText: string;
  size?: KeyboardShortcutSize;
  /** When true, renders as a plain combiner label (e.g. "+") without key chrome */
  combiner?: boolean;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function KeyboardShortcut({
  keyText,
  size = "sm",
  combiner = false,
  className,
  ...rest
}: KeyboardShortcutProps) {
  return (
    <kbd
      className={cx(
        styles.key,
        styles[size],
        combiner ? styles.combiner : styles.styled,
        className
      )}
      {...rest}
    >
      {keyText}
    </kbd>
  );
}
