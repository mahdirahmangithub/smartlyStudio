export interface AnimatedIconProps {
  /** Whether the icon is in its active/animated state. */
  active?: boolean;
  /** Icon size in px — matches the static Icon component sizing. */
  size?: number;
  /** CSS color value. Inherits from parent (currentColor) when omitted. */
  color?: string;
  className?: string;
}
