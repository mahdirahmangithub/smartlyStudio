import {
  useState,
  useRef,
  useId,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { Tag, type TagSize } from "../Tag";
import { Dropdown } from "../Dropdown";

export interface MoreTagProps {
  /** Number of overflow items (rendered as "+N") */
  count: number;
  size?: TagSize;
  /** Called when the more-tag dropdown opens (use to close the parent dropdown) */
  onOpen?: () => void;
  /** Called when the more-tag dropdown closes */
  onClose?: () => void;
  /** Optional header node passed to the Dropdown (e.g. SelectOptionHeader for search) */
  header?: ReactNode;
  /** Dropdown body – list of options the user can unselect */
  children: ReactNode;
  disabled?: boolean;
}

export function MoreTag({
  count,
  size = "md",
  onOpen,
  onClose,
  header,
  children,
  disabled = false,
}: MoreTagProps) {
  const [open, setOpen] = useState(false);
  const tagRef = useRef<HTMLSpanElement>(null);
  const dropdownId = useId();

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    onOpen?.();
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    openDropdown();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      openDropdown();
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const stopEvent = (e: MouseEvent) => e.stopPropagation();

  const wrappedHeader = header ? (
    <div onClick={stopEvent} onMouseDown={stopEvent}>
      {header}
    </div>
  ) : undefined;

  const handleContentClick = (e: MouseEvent) => {
    e.stopPropagation();
    requestAnimationFrame(() => {
      const panel = document.getElementById(dropdownId);
      if (!panel || panel.contains(document.activeElement)) return;
      const input = panel.querySelector<HTMLElement>("input");
      if (input) { input.focus(); return; }
      const option = panel.querySelector<HTMLElement>(
        '[role="option"]:not([aria-disabled="true"])'
      );
      option?.focus();
    });
  };

  return (
    <>
      <Tag
        ref={tagRef}
        size={size}
        variant="neutral"
        label={`+${count}`}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-expanded={open}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{ cursor: disabled ? "default" : "pointer" }}
      />
      <Dropdown
        id={dropdownId}
        open={open}
        onClose={handleClose}
        anchorRef={tagRef}
        header={wrappedHeader}
        returnFocusRef={tagRef}
      >
        <div onClick={handleContentClick} onMouseDown={(e) => e.stopPropagation()}>
          {children}
        </div>
      </Dropdown>
    </>
  );
}
