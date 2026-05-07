import { useRef, useState, type ReactNode } from "react";
import { NavigationItem } from "@sds/components/NavigationItem";
import { Dropdown } from "@sds/components/Dropdown";
import { GenericSelectOption } from "@sds/components/GenericSelectOption";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Icon } from "@sds/components/Icon";

type DrillLevel = null | "theme" | "typeface";
export type Theme = "light" | "dark" | "dusk";
export type Typeface = "mac" | "windows" | "marketing" | "inter";

export function SettingsMenu({
  sidebarExpanded,
  theme,
  setTheme,
  typeface,
  setTypeface,
}: {
  sidebarExpanded: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  typeface: Typeface;
  setTypeface: (f: Typeface) => void;
}) {
  const [open, setOpen] = useState(false);
  const [drill, setDrill] = useState<DrillLevel>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setDrill(null); };

  const THEMES: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark",  label: "Dark" },
    { value: "dusk",  label: "Dusk" },
  ];

  const TYPEFACES: { value: Typeface; label: string }[] = [
    { value: "mac",       label: "Mac" },
    { value: "windows",   label: "Windows" },
    { value: "marketing", label: "Marketing" },
    { value: "inter",     label: "Inter" },
  ];

  const renderBack = (label: string) => (
    <GenericSelectOption
      labelText={label}
      description={false}
      leading={<Icon name="chevron_left" size={16} />}
      onClick={() => setDrill(null)}
    />
  );

  let dropdownContent: ReactNode;

  if (drill === "theme") {
    dropdownContent = (
      <>
        {renderBack("Theme")}
        {THEMES.map((t) => (
          <SingleSelectOption
            key={t.value}
            labelText={t.label}
            description={false}
            checked={theme === t.value}
            onChange={() => { setTheme(t.value); close(); }}
          />
        ))}
      </>
    );
  } else if (drill === "typeface") {
    dropdownContent = (
      <>
        {renderBack("Font Face")}
        {TYPEFACES.map((f) => (
          <SingleSelectOption
            key={f.value}
            labelText={f.label}
            description={false}
            checked={typeface === f.value}
            onChange={() => { setTypeface(f.value); close(); }}
          />
        ))}
      </>
    );
  } else {
    dropdownContent = (
      <>
        <GenericSelectOption
          labelText="Theme"
          description={false}
          leading={<Icon name={theme === "light" ? "sunny" : "dark_mode"} size={16} />}
          subMenu
          onClick={() => setDrill("theme")}
        />
        <GenericSelectOption
          labelText="Font Face"
          description={false}
          leading={<Icon name="text_layer" size={16} />}
          subMenu
          onClick={() => setDrill("typeface")}
        />
      </>
    );
  }

  return (
    <div ref={anchorRef}>
      <NavigationItem
        label="Settings"
        leadingIcon={<Icon name="settings" size={20} />}
        iconOnly={!sidebarExpanded}
        onClick={() => { setOpen((v) => !v); setDrill(null); }}
      />
      <Dropdown
        open={open}
        onClose={close}
        anchorRef={anchorRef}
        placement="right-start"
        width={200}
      >
        {dropdownContent}
      </Dropdown>
    </div>
  );
}
