import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./AppShell.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ── Root ── */

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Root = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShellRoot({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cx(styles.root, className)} {...rest}>
        {children}
      </div>
    );
  },
);

Root.displayName = "AppShell";

/* ── Content ── */

export interface AppShellContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Content = forwardRef<HTMLDivElement, AppShellContentProps>(
  function AppShellContent({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} className={cx(styles.content, className)} {...rest}>
        {children}
      </div>
    );
  },
);

Content.displayName = "AppShell.Content";

/* ── Panel ── */

export type PanelSide = "left" | "right";
export type PanelMode = "push" | "overlay";

export interface AppShellPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Which edge the panel sits on */
  side: PanelSide;
  /** Push shrinks the content area; overlay floats above it */
  mode: PanelMode;
  /** Panel width (number treated as px, string used as-is) */
  width: number | string;
  /** Whether the panel is visible (default true) */
  open?: boolean;
  children: ReactNode;
}

const Panel = forwardRef<HTMLDivElement, AppShellPanelProps>(
  function AppShellPanel(
    { side, mode, width, open = true, children, className, style, ...rest },
    ref,
  ) {
    const cssWidth = typeof width === "number" ? `${width}px` : width;

    if (mode === "push") {
      return (
        <div
          ref={ref}
          className={cx(styles.panel, styles.push, className)}
          style={
            {
              width: open ? cssWidth : 0,
              ...style,
            } as CSSProperties
          }
          {...rest}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cx(
          styles.panel,
          styles.overlay,
          styles[side],
          !open && styles.closed,
          className,
        )}
        style={{ width: cssWidth, ...style } as CSSProperties}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Panel.displayName = "AppShell.Panel";

/* ── Compound export ── */

export const AppShell = Object.assign(Root, {
  Content,
  Panel,
});
