import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Button, type ButtonSize, type ButtonType, type ButtonEmphasis } from "../Button";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { cx } from "../../utils/cx";
import styles from "./CopyButton.module.css";

export interface CopyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "onCopy"> {
  /** The text value to copy to the clipboard */
  value: string;
  /** Button size */
  size?: ButtonSize;
  /** Button color variant */
  variant?: ButtonType;
  /** Button emphasis level */
  emphasis?: ButtonEmphasis;
  /** Optional label — when provided, renders as a `Button` with leading icon. When omitted, renders as an `IconButton`. */
  children?: ReactNode;
  /** Icon size override. Defaults to 20 for md/lg, 16 for sm. */
  iconSize?: number;
  /** Duration in ms the check icon is shown after copy (default 1500) */
  feedbackDuration?: number;
  /** Called after a successful copy */
  onCopy?: (value: string) => void;
  /** aria-label for the icon-only variant (default "Copy") */
  "aria-label"?: string;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

const DEFAULT_ICON_SIZE: Record<ButtonSize, number> = {
  sm: 16,
  md: 16,
  lg: 20,
};

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      value,
      size = "md",
      variant = "neutral",
      emphasis = "low",
      children,
      iconSize,
      feedbackDuration = 1500,
      onCopy,
      "aria-label": ariaLabel = "Copy",
      ...rest
    },
    ref,
  ) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const resolvedIconSize = iconSize ?? DEFAULT_ICON_SIZE[size];

    const handleClick = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        rest.onClick?.(e);
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setCopied(false), feedbackDuration);
          onCopy?.(value);
        } catch {
          // Clipboard API not available — fail silently
        }
      },
      [value, feedbackDuration, onCopy, rest.onClick],
    );

    const currentLabel = copied ? "Copied" : ariaLabel;

    const animatedIcon = (
      <span className={cx(styles.iconSwap, copied && styles.copied)}>
        <Icon name="content_copy" size={resolvedIconSize} className={styles.copyIcon} />
        <Icon name="check" size={resolvedIconSize} className={styles.checkIcon} />
      </span>
    );

    if (children != null) {
      return (
        <Button
          ref={ref}
          size={size}
          variant={variant}
          emphasis={emphasis}
          leadingIcon={animatedIcon}
          {...rest}
          onClick={handleClick}
          aria-label={currentLabel}
        >
          {children}
        </Button>
      );
    }

    return (
      <IconButton
        ref={ref}
        size={size}
        variant={variant}
        emphasis={emphasis}
        icon={animatedIcon}
        {...rest}
        onClick={handleClick}
        aria-label={currentLabel}
      />
    );
  },
);

CopyButton.displayName = "CopyButton";
