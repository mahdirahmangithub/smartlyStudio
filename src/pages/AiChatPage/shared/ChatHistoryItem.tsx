import { useRef, useState } from "react";
import { NavigationSubItem } from "../../../components/NavigationSubItem";
import { Dropdown } from "../../../components/Dropdown";
import { GenericSelectOption } from "../../../components/GenericSelectOption";
import { OptionSeparator } from "../../../components/OptionSeparator";
import { Icon } from "../../../components/Icon";

export function ChatHistoryItem({
  label,
  pinned,
  checked,
  onSelect,
  onPinToTop,
  onUnpin,
}: {
  label: string;
  pinned?: boolean;
  checked?: boolean;
  onSelect?: () => void;
  onPinToTop?: () => void;
  onUnpin?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={anchorRef}>
        <NavigationSubItem
          label={label}
          pinned={pinned}
          checked={checked}
          onClick={onSelect}
          actionIcon="more_horiz"
          actionLabel="More options"
          onAction={() => setOpen((v) => !v)}
        />
      </div>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="bottom-start"
        width={200}
      >
        <GenericSelectOption
          labelText="Share"
          description={false}
          leading={<Icon name="link" size={16} />}
          onClick={() => setOpen(false)}
        />
        <GenericSelectOption
          labelText="Rename"
          description={false}
          leading={<Icon name="edit" size={16} />}
          onClick={() => setOpen(false)}
        />
        {pinned ? (
          <GenericSelectOption
            labelText="Unpin"
            description={false}
            leading={<Icon name="keep_off" size={16} />}
            onClick={() => { onUnpin?.(); setOpen(false); }}
          />
        ) : (
          <GenericSelectOption
            labelText="Pin to top"
            description={false}
            leading={<Icon name="keep" size={16} />}
            onClick={() => { onPinToTop?.(); setOpen(false); }}
          />
        )}
        <OptionSeparator />
        <GenericSelectOption
          labelText="Delete"
          description={false}
          leading={<Icon name="delete" size={16} />}
          alert
          onClick={() => setOpen(false)}
        />
      </Dropdown>
    </>
  );
}
