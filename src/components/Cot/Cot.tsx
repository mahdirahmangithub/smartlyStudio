import React, { Children, cloneElement, isValidElement } from "react";
import { cx } from "../../utils/cx";
import styles from "./Cot.module.css";
import type { CotProps } from "./cotTypes";
import { CotItemContext } from "./cotContext";

export function Cot({ children, connector, className, ...rest }: CotProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const total = items.length;

  return (
    <ol className={cx(styles.root, className)} {...rest}>
      {items.map((child, i) => {
        const isLast = i === total - 1;
        // connector=false on Cot hides all connectors
        // last child always gets false; other items get undefined so CotItem
        // can decide based on its own status (idle hides connector by default)
        const connectorValue =
          connector === false || isLast ? false : undefined;

        const cloned = cloneElement(child as React.ReactElement<{ connector?: boolean }>, {
          connector: connectorValue,
        });

        // Provide per-child index + total so CotItem can auto-derive its
        // status from the surrounding CotContainer's progress.
        return (
          <CotItemContext.Provider key={i} value={{ index: i, total }}>
            {cloned}
          </CotItemContext.Provider>
        );
      })}
    </ol>
  );
}

Cot.displayName = "Cot";
