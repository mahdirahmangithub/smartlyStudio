import { Fragment } from "react";
import { Icon } from "../Icon";
import { GenericSelectOption } from "../GenericSelectOption";
import { OptionSeparator } from "../OptionSeparator";
import type { AttachmentMenuItemDef } from "./promptInputAttachmentMenuData";
import { usePromptInput } from "./promptInputContext";

/** Renders attachment menu rows; must be used under `<PromptInput>`. */
export function PromptInputAttachmentMenuItems({
  items,
}: {
  items: readonly AttachmentMenuItemDef[];
}) {
  const {
    pickAttachmentKind,
    attachmentMenuSource,
    attachmentMenuId,
    attachmentMenuCombobox,
    caretAttachmentActiveIndex,
    setCaretAttachmentActiveIndex,
    buttonAttachmentActiveIndex,
    setButtonAttachmentActiveIndex,
  } = usePromptInput();

  const combobox = attachmentMenuCombobox && attachmentMenuSource === "caret";
  const fromButton = attachmentMenuSource === "button";

  return items.map((item, index) => (
    <Fragment key={item.kind}>
      {item.dividerBefore && index > 0 ? <OptionSeparator type="divider" /> : null}
      <GenericSelectOption
        itemRole={combobox ? "option" : "menuitem"}
        unmanagedFocus={combobox}
        optionId={combobox ? `${attachmentMenuId}-opt-${index}` : undefined}
        isActive={
          (combobox && index === caretAttachmentActiveIndex) ||
          (fromButton && index === buttonAttachmentActiveIndex)
        }
        labelText={item.label}
        description={false}
        leading={<Icon name={item.icon} size={20} />}
        onClick={() => pickAttachmentKind(item.kind)}
        onFocus={fromButton ? () => setButtonAttachmentActiveIndex(index) : undefined}
        onMouseEnter={
          combobox
            ? () => setCaretAttachmentActiveIndex(index)
            : fromButton
              ? () => setButtonAttachmentActiveIndex(index)
              : undefined
        }
      />
    </Fragment>
  ));
}

export type { AttachmentMenuItemDef } from "./promptInputAttachmentMenuData";
