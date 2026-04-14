import { forwardRef, useCallback, useId, useRef, useState } from "react";
import { DragHandle, type DragHandleSize, type DragHandleType } from "../DragHandle";
import { Dropdown, type DropdownPlacement } from "../Dropdown";
import { GenericSelectOption } from "../GenericSelectOption";
import { Icon } from "../Icon";
import { cx } from "../../utils/cx";


export interface DragHandleMenuProps {
  /** Visual variant passed to DragHandle */
  type?: DragHandleType;
  /** Size variant passed to DragHandle */
  size?: DragHandleSize;
  /** 0-based index of this item in the list */
  index: number;
  /** Total number of items in the list */
  total: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  /** Dropdown placement relative to the handle */
  placement?: DropdownPlacement;
  className?: string;
}

export const DragHandleMenu = forwardRef<HTMLButtonElement, DragHandleMenuProps>(
  (
    {
      type = "dot",
      size = "lg",
      index,
      total,
      onMoveUp,
      onMoveDown,
      onMoveToTop,
      onMoveToBottom,
      placement = "bottom-start",
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    const isFirst = index === 0;
    const isLast = index === total - 1;

    const toggle = useCallback(() => setOpen((prev) => !prev), []);
    const close = useCallback(() => setOpen(false), []);

    const handleAction = useCallback(
      (action?: () => void) => {
        if (!action) return;
        close();
        action();
      },
      [close],
    );

    const mergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        (anchorRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [ref],
    );

    return (
      <>
        <DragHandle
          ref={mergedRef}
          type={type}
          size={size}
          className={cx(className)}
          onClick={toggle}
          aria-label={`Reorder options, position ${index + 1} of ${total}`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
        />

        <Dropdown
          open={open}
          onClose={close}
          anchorRef={anchorRef}
          placement={placement}
          id={menuId}
          width={200}
          role="menu"
          returnFocusRef={anchorRef}
        >
          <GenericSelectOption
            labelText="Move to top"
            description={false}
            disabled={isFirst}
            leading={<Icon name="vertical_align_top" size={20} />}
            onClick={() => handleAction(onMoveToTop)}
            itemRole="menuitem"
          />
          <GenericSelectOption
            labelText="Move up"
            description={false}
            disabled={isFirst}
            leading={<Icon name="arrow_chevron_up" size={20} />}
            onClick={() => handleAction(onMoveUp)}
            itemRole="menuitem"
          />
          <GenericSelectOption
            labelText="Move down"
            description={false}
            disabled={isLast}
            leading={<Icon name="arrow_chevron_down" size={20} />}
            onClick={() => handleAction(onMoveDown)}
            itemRole="menuitem"
          />
          <GenericSelectOption
            labelText="Move to bottom"
            description={false}
            disabled={isLast}
            leading={<Icon name="vertical_align_bottom" size={20} />}
            onClick={() => handleAction(onMoveToBottom)}
            itemRole="menuitem"
          />
        </Dropdown>
      </>
    );
  },
);

DragHandleMenu.displayName = "DragHandleMenu";
