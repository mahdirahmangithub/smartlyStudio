import { Fragment } from "react";
import { Icon } from "../Icon";
import { GenericSelectOption } from "../GenericSelectOption";
import { OptionSeparator } from "../OptionSeparator";
import type { MenuNode } from "../../types/MenuNode";
import { usePromptInput } from "./promptInputContext";
import type { PromptInputAttachmentKind } from "./promptInputTypes";

/**
 * Renders attachment-menu rows for the **`+` button** entry point.
 *
 * The caret-driven `/` flow no longer goes through this component — it's
 * rendered by `<TriggerMenu>` directly inside `<PromptInput>`. This file
 * is button-only post-Phase-3.
 *
 * Must be mounted under `<PromptInput>` (uses `usePromptInput()` for the
 * focus/highlight state and the `pickAttachmentKind` dispatcher).
 */
export function PromptInputAttachmentMenuItems({
  items,
}: {
  items: readonly MenuNode[];
}) {
  const {
    pickAttachmentKind,
    buttonAttachmentActiveIndex,
    setButtonAttachmentActiveIndex,
  } = usePromptInput();

  return items.map((item, index) => (
    <Fragment key={item.id}>
      {item.dividerBefore && index > 0 ? <OptionSeparator type="divider" /> : null}
      <GenericSelectOption
        itemRole="menuitem"
        isActive={index === buttonAttachmentActiveIndex}
        labelText={item.label}
        description={false}
        leading={item.icon ? <Icon name={item.icon} size={20} /> : undefined}
        disabled={item.disabled}
        onClick={() => {
          if (item.kind) {
            pickAttachmentKind(item.kind as PromptInputAttachmentKind);
          }
        }}
        onFocus={() => setButtonAttachmentActiveIndex(index)}
        onMouseEnter={() => setButtonAttachmentActiveIndex(index)}
      />
    </Fragment>
  ));
}
