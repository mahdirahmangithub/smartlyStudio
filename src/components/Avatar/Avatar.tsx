import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Icon } from "../Icon";
import { Imagery } from "../Imagery";
import { NotificationBadge } from "../NotificationBadge";
import styles from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  size?: AvatarSize;
  round?: boolean;
  /** Show a status notification dot */
  status?: boolean;
  /** Image URL — renders the avatar in image mode */
  src?: string;
  /** Required accessible label */
  alt: string;
  /** Up to 2 characters — renders the avatar in initials mode */
  initials?: string;
  /** Custom icon — renders the avatar in icon mode. Defaults to person_fill. */
  icon?: ReactNode;
  /** Seed string for deterministic color picking (defaults to initials value) */
  colorSeed?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const ICON_SIZE: Record<AvatarSize, number> = { xs: 16, sm: 20, md: 24, lg: 32 };

const NB_SIZE: Record<AvatarSize, "xs" | "sm" | "md" | "lg"> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
};

// Curated palette — every entry passes WCAG AA (≥ 4.5:1) with at least one
// of the two text colors (gray-600 for light bg, gray-100 for dark bg).
const AVATAR_PALETTE = [
  { var: "--color-smartly-200", hex: "#d7a9ff" },
  { var: "--color-red-200", hex: "#fca597" },
  { var: "--color-orange-150", hex: "#ffbd8a" },
  { var: "--color-yellow-100", hex: "#f7e25f" },
  { var: "--color-lime-100", hex: "#d2ec5f" },
  { var: "--color-green-150", hex: "#82dea1" },
  { var: "--color-teal-150", hex: "#77daf8" },
  { var: "--color-blue-200", hex: "#7ac1ff" },
  { var: "--color-purple-200", hex: "#c1b2eb" },
  { var: "--color-magenta-200", hex: "#faa5d2" },
  { var: "--color-smartly-700", hex: "#5e18af" },
  { var: "--color-red-700", hex: "#950909" },
  { var: "--color-orange-800", hex: "#471e00" },
  { var: "--color-green-700", hex: "#00420f" },
  { var: "--color-teal-700", hex: "#003c52" },
  { var: "--color-blue-700", hex: "#003694" },
  { var: "--color-purple-700", hex: "#3d28a9" },
  { var: "--color-magenta-700", hex: "#870b62" },
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function srgbChannel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Primitive tokens are theme-invariant, so text never shifts across themes.
// --color-gray-600 (#444546) = light-mode --text-neutral-secondary-default
// --color-gray-100 (#dfe0e2) = light-mode --text-neutral-inverse-secondary-default
const DARK_TEXT_HEX = "#444546";
const LIGHT_TEXT_HEX = "#dfe0e2";
const DARK_TEXT_LUM = relativeLuminance(...hexToRgb(DARK_TEXT_HEX));
const LIGHT_TEXT_LUM = relativeLuminance(...hexToRgb(LIGHT_TEXT_HEX));

function pickAvatarColor(seed: string): { bg: string; fg: string } {
  const idx = hashString(seed) % AVATAR_PALETTE.length;
  const entry = AVATAR_PALETTE[idx];
  const bgLum = relativeLuminance(...hexToRgb(entry.hex));

  const darkCR = contrastRatio(bgLum, DARK_TEXT_LUM);
  const lightCR = contrastRatio(bgLum, LIGHT_TEXT_LUM);

  const fg =
    darkCR >= lightCR
      ? "var(--color-gray-600)"
      : "var(--color-gray-100)";

  return { bg: `var(${entry.var})`, fg };
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = "md",
      round = false,
      status = false,
      src,
      alt,
      initials,
      icon,
      colorSeed,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const mode: "image" | "initials" | "icon" = src
      ? "image"
      : initials
        ? "initials"
        : "icon";

    const avatarColor = useMemo(() => {
      if (mode !== "initials" && mode !== "icon") return null;
      const seed = colorSeed || initials || "?";
      return pickAvatarColor(seed);
    }, [mode, colorSeed, initials]);

    const vars: Record<string, string> = {};
    if (avatarColor) {
      vars["--_avatar-bg"] = avatarColor.bg;
      vars["--_avatar-fg"] = avatarColor.fg;
    }

    return (
      <div
        ref={ref}
        role="img"
        aria-label={alt}
        className={cx(
          styles.avatar,
          styles[size],
          round && styles.round,
          className
        )}
        style={{ ...style, ...vars } as CSSProperties}
        {...rest}
      >
        <div className={styles.container}>
          {mode === "image" && (
            <Imagery
              src={src!}
              alt={alt}
              aspectRatio="1:1"
              radius="none"
              objectFit="cover"
            />
          )}

          {mode === "initials" && (
            <div className={styles.base}>
              <span className={styles.initials}>
                {(initials || "").slice(0, 2)}
              </span>
            </div>
          )}

          {mode === "icon" && (
            <div className={styles.base}>
              <span className={styles.iconSlot}>
                {icon || (
                  <Icon
                    name="person_fill"
                    size={ICON_SIZE[size]}
                    type="monochrome"
                  />
                )}
              </span>
            </div>
          )}
        </div>

        {status && (
          <span className={styles.status}>
            <NotificationBadge
              size={NB_SIZE[size]}
              variant="alert"
              emphasis="high"
              outline
            />
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
