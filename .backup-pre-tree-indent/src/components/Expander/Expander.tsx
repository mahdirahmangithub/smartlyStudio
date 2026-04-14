import { Icon } from "../Icon";
import styles from "./Expander.module.css";

export interface ExpanderProps {
  expanded?: boolean;
  size?: "sm" | "lg";
  /** When omitted the Expander inherits color from its parent (currentColor). */
  emphasis?: "medium" | "low";
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const ICON_SIZE: Record<string, number> = { sm: 16, lg: 20 };

export function Expander({
  expanded = false,
  size = "sm",
  emphasis,
  error = false,
  disabled = false,
  className,
}: ExpanderProps) {
  const cls = [
    styles.expander,
    styles[size],
    emphasis && styles[emphasis],
    expanded && styles.expanded,
    error && styles.error,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} aria-hidden="true">
      <Icon name="arrow_chevron_down" size={ICON_SIZE[size]} />
    </span>
  );
}
