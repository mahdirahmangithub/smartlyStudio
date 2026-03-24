import { forwardRef, type HTMLAttributes, type ComponentType, type SVGProps } from "react";
import { cx } from "../../utils/cx";
import styles from "./Illustration.module.css";
import { AllDone, Bolt, Idea, LetsStart, NoResult, UpgradeNow } from "./illustrations";

const ILLUSTRATION_MAP: Record<IllustrationType, ComponentType<SVGProps<SVGSVGElement>>> = {
  "all-done": AllDone,
  "bolt": Bolt,
  "idea": Idea,
  "lets-start": LetsStart,
  "no-result": NoResult,
  "upgrade-now": UpgradeNow,
};

export type IllustrationType = "all-done" | "bolt" | "idea" | "lets-start" | "no-result" | "upgrade-now";

export type IllustrationSize = "sm" | "lg";

export interface IllustrationProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Which illustration to render */
  type: IllustrationType;
  /** sm = 80×80, lg = 140×140 */
  size?: IllustrationSize;
}

export const Illustration = forwardRef<HTMLDivElement, IllustrationProps>(
  ({ type, size = "sm", className, ...rest }, ref) => {
    const SvgComponent = ILLUSTRATION_MAP[type];

    return (
      <div
        ref={ref}
        role="img"
        aria-label={type}
        className={cx(styles.illustration, styles[size], className)}
        {...rest}
      >
        <SvgComponent aria-hidden="true" />
      </div>
    );
  }
);

Illustration.displayName = "Illustration";
