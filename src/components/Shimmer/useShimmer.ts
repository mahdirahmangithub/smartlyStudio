import styles from "./Shimmer.module.css";

/**
 * Returns a CSS class name that applies the AI loading shimmer effect.
 *
 * The shimmer combines two simultaneous animations:
 * - **Opacity pulse** between 48 % and 88 % (2 s, linear, infinite)
 * - **Mask sweep** – a gradient band moves horizontally (2 s, linear, infinite)
 *
 * @param enabled – `true` to activate the shimmer, `false` to disable it
 *                  without unmounting or affecting layout.
 * @param inverse – When `true`, inverts the mask gradient so the centre of the
 *                  sweep is the most visible part and the edges fade out.
 *                  Defaults to `false` (centre is the least visible / "glint" style).
 * @param pulse –   When `false`, disables the opacity pulse animation and keeps
 *                  only the mask sweep. Defaults to `true`.
 *
 * @returns A class name string (empty when disabled). Append it to the
 *          target element's `className`.
 *
 * @example
 * ```tsx
 * import { useShimmer } from "../components/Shimmer";
 *
 * function MyComponent({ loading }: { loading: boolean }) {
 *   const shimmer = useShimmer(loading);
 *   return <div className={`${styles.card} ${shimmer}`}>…</div>;
 * }
 *
 * // Inverse mode – bright spotlight sweeping through dimmed content
 * function AltComponent({ loading }: { loading: boolean }) {
 *   const shimmer = useShimmer(loading, true);
 *   return <div className={`${styles.card} ${shimmer}`}>…</div>;
 * }
 * ```
 *
 * **Note:** CSS masks require the element to have a rendered box.
 * For inline elements (`<span>`, `<a>`, etc.) apply `display: inline-block`
 * so the mask renders correctly.
 */
export function useShimmer(
  enabled: boolean,
  inverse?: boolean,
  pulse?: boolean,
): string {
  if (!enabled) return "";

  const classes: string[] = [];

  if (inverse) {
    classes.push(styles.shimmerInverse);
  } else {
    classes.push(styles.shimmer);
  }

  if (pulse === false) {
    classes.push(styles.noPulse);
  }

  return classes.join(" ");
}
