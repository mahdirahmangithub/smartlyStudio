import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type MouseEventHandler,
} from "react";
import { Hint } from "../Hint";
import styles from "./Entity.module.css";
import { cx } from "../../utils/cx";


export interface EntityProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Leading element — an Icon (16px), large Icon (20px), Thumbnail (md), or any ReactNode */
  leading?: ReactNode;
  /** Title text (truncated to 1 line) */
  title: string;
  /** Hint tooltip label — renders a Hint (info icon) inline next to the title */
  hint?: string;
  /** Description content below the title */
  description?: ReactNode;
  /** Max visible lines for description (uses -webkit-line-clamp). Omit for no truncation. */
  descriptionLineClamp?: number;
  /** Persistent actions — always visible on the right side */
  persistentActions?: ReactNode;
  /** Hidden actions — revealed on hover, positioned left of persistent actions */
  hiddenActions?: ReactNode;
  /** Error state — title and description use alert color */
  error?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler — makes the whole entity interactive (styling deferred to consumer) */
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const Entity = forwardRef<HTMLDivElement, EntityProps>(
  (
    {
      leading,
      title,
      hint,
      description,
      descriptionLineClamp,
      persistentActions,
      hiddenActions,
      error = false,
      disabled = false,
      onClick,
      className,
      ...rest
    },
    ref,
  ) => {
    const hasActions = !!(persistentActions || hiddenActions);
    const interactive = !!onClick && !disabled;

    return (
      <div
        ref={ref}
        className={cx(
          styles.root,
          error && styles.error,
          disabled && styles.disabled,
          interactive && styles.interactive,
          className,
        )}
        onClick={interactive ? onClick : undefined}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-disabled={disabled || undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        {...rest}
      >
        <div className={styles.base}>
          <div className={styles.leadingText}>
            {leading && (
              <div className={styles.leading} aria-hidden="true">
                {leading}
              </div>
            )}

            <div className={styles.text}>
              <div className={styles.titleRow}>
                <span className={styles.title}>{title}</span>
                {hint && <Hint size="sm" label={hint} />}
              </div>

              {description != null && (
                <div
                  className={styles.description}
                  style={
                    descriptionLineClamp
                      ? ({
                          WebkitLineClamp: descriptionLineClamp,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  {description}
                </div>
              )}
            </div>
          </div>

          {hasActions && (
            <div className={styles.actions}>
              {hiddenActions && (
                <div className={styles.hiddenActions}>
                  {hiddenActions}
                </div>
              )}
              {persistentActions && (
                <div className={styles.persistentActions}>
                  {persistentActions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Entity.displayName = "Entity";
