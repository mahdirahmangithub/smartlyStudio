import React, { Children, cloneElement, isValidElement } from "react";
import { cx } from "../../utils/cx";
import styles from "./Cot.module.css";
import type { CotProps } from "./cotTypes";

export function Cot({ children, connector, className, ...rest }: CotProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <ol className={cx(styles.root, className)} {...rest}>
      {items.map((child, i) => {
        const isLast = i === items.length - 1;
        // connector=false on Cot hides all connectors
        // otherwise last child gets connector=false automatically
        const connectorValue =
          connector === false ? false : isLast ? false : true;

        return cloneElement(child as React.ReactElement<{ connector?: boolean }>, {
          connector: connectorValue,
        });
      })}
    </ol>
  );
}

Cot.displayName = "Cot";
