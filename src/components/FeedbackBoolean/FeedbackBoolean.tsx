import { useState, useCallback, useRef, useEffect } from "react";
import { IconButton } from "../IconButton";
import { RowContainer, type RowContainerDensity } from "../RowContainer";
import type { ButtonSize } from "../Button";
import { cx } from "../../utils/cx";
import styles from "./FeedbackBoolean.module.css";

export type FeedbackValue = "up" | "down" | null;

const PATHS = {
  thumb_up:
    "M21 8.0001C21.5333 8.0001 22 8.2001 22.4 8.6001C22.8 9.0001 23 9.46676 23 10.0001V12.0001C23 12.1168 22.9833 12.2418 22.95 12.3751C22.9167 12.5084 22.8833 12.6334 22.85 12.7501L19.85 19.8001C19.7 20.1334 19.45 20.4168 19.1 20.6501C18.75 20.8834 18.3833 21.0001 18 21.0001H7V8.0001L13 2.0501C13.25 1.8001 13.5458 1.65426 13.8875 1.6126C14.2292 1.57093 14.5583 1.63343 14.875 1.8001C15.1917 1.96676 15.425 2.2001 15.575 2.5001C15.725 2.8001 15.7583 3.10843 15.675 3.4251L14.55 8.0001H21ZM9 8.8501V19.0001H18L21 12.0001V10.0001H12L13.35 4.5001L9 8.8501ZM4 21.0001C3.45 21.0001 2.97917 20.8043 2.5875 20.4126C2.19583 20.0209 2 19.5501 2 19.0001V10.0001C2 9.4501 2.19583 8.97926 2.5875 8.5876C2.97917 8.19593 3.45 8.0001 4 8.0001H7V10.0001H4V19.0001H7V21.0001H4Z",
  thumb_up_fill:
    "M21 7.99983C21.5333 7.99983 22 8.19983 22.4 8.59983C22.8 8.99983 23 9.46649 23 9.99983V11.9998C23 12.1165 22.9875 12.2415 22.9625 12.3748C22.9375 12.5082 22.9 12.6332 22.85 12.7498L19.85 19.7998C19.7 20.1332 19.45 20.4165 19.1 20.6498C18.75 20.8832 18.3833 20.9998 18 20.9998H10C9.45 20.9998 8.97917 20.804 8.5875 20.4123C8.19583 20.0207 8 19.5498 8 18.9998V8.82483C8 8.55816 8.05417 8.30399 8.1625 8.06233C8.27083 7.82066 8.41667 7.60816 8.6 7.42483L14.025 2.02483C14.275 1.79149 14.5708 1.64983 14.9125 1.59983C15.2542 1.54983 15.5833 1.60816 15.9 1.77483C16.2167 1.94149 16.4458 2.17483 16.5875 2.47483C16.7292 2.77483 16.7583 3.08316 16.675 3.39983L15.55 7.99983H21ZM4 20.9998C3.45 20.9998 2.97917 20.804 2.5875 20.4123C2.19583 20.0207 2 19.5498 2 18.9998V9.99983C2 9.44983 2.19583 8.97899 2.5875 8.58733C2.97917 8.19566 3.45 7.99983 4 7.99983C4.55 7.99983 5.02083 8.19566 5.4125 8.58733C5.80417 8.97899 6 9.44983 6 9.99983V18.9998C6 19.5498 5.80417 20.0207 5.4125 20.4123C5.02083 20.804 4.55 20.9998 4 20.9998Z",
  thumb_down:
    "M3 16C2.46667 16 2 15.8 1.6 15.4C1.2 15 1 14.5333 1 14V12C1 11.8833 1.01667 11.7583 1.05 11.625C1.08333 11.4917 1.11667 11.3667 1.15 11.25L4.15 4.2C4.3 3.86667 4.55 3.58333 4.9 3.35C5.25 3.11667 5.61667 3 6 3H17V16L11 21.95C10.75 22.2 10.4542 22.3458 10.1125 22.3875C9.77083 22.4292 9.44167 22.3667 9.125 22.2C8.80833 22.0333 8.575 21.8 8.425 21.5C8.275 21.2 8.24167 20.8917 8.325 20.575L9.45 16H3ZM15 15.15V5H6L3 12V14H12L10.65 19.5L15 15.15ZM20 3C20.55 3 21.0208 3.19583 21.4125 3.5875C21.8042 3.97917 22 4.45 22 5V14C22 14.55 21.8042 15.0208 21.4125 15.4125C21.0208 15.8042 20.55 16 20 16H17V14H20V5H17V3H20Z",
  thumb_down_fill:
    "M3 16C2.46667 16 2 15.8 1.6 15.4C1.2 15 1 14.5333 1 14V12C1 11.8833 1.0125 11.7583 1.0375 11.625C1.0625 11.4917 1.1 11.3667 1.15 11.25L4.15 4.2C4.3 3.86667 4.55 3.58333 4.9 3.35C5.25 3.11667 5.61667 3 6 3H14C14.55 3 15.0208 3.19583 15.4125 3.5875C15.8042 3.97917 16 4.45 16 5V15.175C16 15.4417 15.9458 15.6958 15.8375 15.9375C15.7292 16.1792 15.5833 16.3917 15.4 16.575L9.975 21.975C9.725 22.2083 9.42917 22.35 9.0875 22.4C8.74583 22.45 8.41667 22.3917 8.1 22.225C7.78333 22.0583 7.55417 21.825 7.4125 21.525C7.27083 21.225 7.24167 20.9167 7.325 20.6L8.45 16H3ZM20 3C20.55 3 21.0208 3.19583 21.4125 3.5875C21.8042 3.97917 22 4.45 22 5V14C22 14.55 21.8042 15.0208 21.4125 15.4125C21.0208 15.8042 20.55 16 20 16C19.45 16 18.9792 15.8042 18.5875 15.4125C18.1958 15.0208 18 14.55 18 14V5C18 4.45 18.1958 3.97917 18.5875 3.5875C18.9792 3.19583 19.45 3 20 3Z",
} as const;

interface ThumbIconProps {
  active: boolean;
  direction: "up" | "down";
  size: number;
  animating: boolean;
  onAnimationEnd: () => void;
}

function ThumbIcon({ active, direction, size, animating, onAnimationEnd }: ThumbIconProps) {
  const outlinePath = direction === "up" ? PATHS.thumb_up : PATHS.thumb_down;
  const fillPath = direction === "up" ? PATHS.thumb_up_fill : PATHS.thumb_down_fill;

  const wrapClass = animating
    ? direction === "up" ? styles.animateUpWrap : styles.animateDownWrap
    : undefined;

  const morphClass = animating
    ? direction === "up" ? styles.animateUpMorph : styles.animateDownMorph
    : undefined;

  return (
    <span
      className={cx(styles.morphWrap, active && styles.active, wrapClass)}
      onAnimationEnd={onAnimationEnd}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={styles.outlinePath}
      >
        <path d={outlinePath} fill="currentColor" />
      </svg>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={styles.fillPath}
      >
        <path
          d={fillPath}
          fill="currentColor"
          className={morphClass}
        />
      </svg>
    </span>
  );
}

export interface FeedbackBooleanProps {
  value?: FeedbackValue;
  defaultValue?: FeedbackValue;
  onChange?: (value: FeedbackValue) => void;
  size?: ButtonSize;
  density?: RowContainerDensity;
  disabled?: boolean;
  className?: string;
}

export function FeedbackBoolean({
  value: controlledValue,
  defaultValue = null,
  onChange,
  size = "md",
  density = "xs",
  disabled = false,
  className,
}: FeedbackBooleanProps) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<FeedbackValue>(defaultValue);
  const current = isControlled ? controlledValue : uncontrolledValue;
  const prevRef = useRef<FeedbackValue>(current);
  const [animatingUp, setAnimatingUp] = useState(false);
  const [animatingDown, setAnimatingDown] = useState(false);

  const handleClick = useCallback(
    (type: "up" | "down") => {
      if (!isControlled) setUncontrolledValue(type);
      onChange?.(type);
    },
    [isControlled, onChange]
  );

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = current;
    if (current === "up" && prev !== "up") setAnimatingUp(true);
    if (current === "down" && prev !== "down") setAnimatingDown(true);
  }, [current]);

  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <RowContainer density={density} className={className}>
      <IconButton
        size={size}
        variant="neutral"
        emphasis="low"
        icon={
          <ThumbIcon
            active={current === "up"}
            direction="up"
            size={iconSize}
            animating={animatingUp}
            onAnimationEnd={() => setAnimatingUp(false)}
          />
        }
        aria-label="Thumbs up"
        aria-pressed={current === "up"}
        onClick={() => handleClick("up")}
        disabled={disabled}
      />
      <IconButton
        size={size}
        variant="neutral"
        emphasis="low"
        icon={
          <ThumbIcon
            active={current === "down"}
            direction="down"
            size={iconSize}
            animating={animatingDown}
            onAnimationEnd={() => setAnimatingDown(false)}
          />
        }
        aria-label="Thumbs down"
        aria-pressed={current === "down"}
        onClick={() => handleClick("down")}
        disabled={disabled}
      />
    </RowContainer>
  );
}
