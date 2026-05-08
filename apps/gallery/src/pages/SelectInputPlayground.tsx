import { useState, useRef, useMemo, useId } from "react";
import { SelectInput, type SelectInputSize } from "@sds/components/SelectInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Icon } from "@sds/components/Icon";
import { useDropdownCombobox } from "@sds/components/Dropdown";

const SIZES: SelectInputSize[] = ["md", "lg", "xl"];

const ICON_SIZE: Record<SelectInputSize, number> = {
  md: 16,
  lg: 16,
  xl: 20,
};

const COUNTRIES = [
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Canada",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Ireland",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "Norway",
  "Portugal",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
  "The Democratic People's Republic of Somethingistan-upon-Avon with a Really Long Official Name",
];

const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

export default function SelectInputPlayground() {
  const [size, setSize] = useState<SelectInputSize>("lg");
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [clearable, setClearable] = useState(true);
  const [showLeading, setShowLeading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownId = useId();

  const filtered = useMemo(
    () =>
      query
        ? COUNTRIES.filter((c) =>
            c.toLowerCase().includes(query.toLowerCase())
          )
        : COUNTRIES,
    [query]
  );

  const handleSelect = (country: string) => {
    setSelected(country);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  // Combobox-mode wiring: input keeps DOM focus, ArrowUp/Down highlight via
  // aria-activedescendant, Enter / Tab commit. Single source of truth for the
  // canonical pattern (see useDropdownCombobox).
  const cbx = useDropdownCombobox({
    open,
    setOpen,
    panelId: dropdownId,
    inputRef,
    onCommit: (country) => handleSelect(country),
    revalidateKey: query,
  });

  const displayValue = open ? query : selected ?? "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!open) setOpen(true);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  const handleClick = () => {
    if (!open && !disabled) setOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Configurable interactive playground ─────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>SelectInput</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as SelectInputSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
              <span style={captionStyle}>Error</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
              <span style={captionStyle}>Read-only</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={clearable} onChange={(e) => setClearable(e.target.checked)} />
              <span style={captionStyle}>Clearable</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showLeading} onChange={(e) => setShowLeading(e.target.checked)} />
              <span style={captionStyle}>Leading Icon</span>
            </label>
          </div>

          <div style={{ maxWidth: 420 }}>
            <SelectInput
              ref={inputRef}
              size={size}
              error={error}
              disabled={disabled}
              readOnly={readOnly}
              clearable={clearable}
              dropdownId={dropdownId}
              placeholder={selected ?? "Search a country..."}
              value={displayValue}
              onChange={handleInputChange}
              onClick={handleClick}
              onKeyDown={cbx.handleInputKeyDown}
              expanded={open && !disabled && !readOnly}
              onClose={handleClose}
              onClear={handleClear}
              leadingIcon={showLeading ? <Icon name="search" size={ICON_SIZE[size]} /> : undefined}
              {...cbx.inputProps}
            >
              {filtered.length > 0 ? (
                filtered.map((country) => (
                  <SingleSelectOption
                    key={country}
                    labelText={country}
                    checked={selected === country}
                    description={false}
                    {...cbx.getOptionProps(country, country)}
                    onChange={() => cbx.commit(country, country)}
                  />
                ))
              ) : (
                <div
                  style={{
                    padding: "12px 16px",
                    color: "var(--text-neutral-placeholder)",
                    fontSize: 14,
                  }}
                >
                  No results
                </div>
              )}
            </SelectInput>
          </div>

          <p style={{ fontSize: 13, margin: 0 }}>
            Selected: <strong>{selected ?? "none"}</strong>
          </p>
        </div>
      </section>

      {/* ── Sizes ───────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Sizes</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{s}</span>
              <div style={{ maxWidth: 420 }}>
                <SelectInput
                  size={s}
                  placeholder="Choose option..."
                  leadingIcon={<Icon name="favorite" size={ICON_SIZE[s]} />}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── States ──────────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>States</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Empty</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput placeholder="Choose option..." leadingIcon={<Icon name="favorite" size={16} />} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Filled + Clearable</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput
                placeholder="Choose option..."
                defaultValue="Australia"
                clearable
                leadingIcon={<Icon name="favorite" size={16} />}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Error</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput placeholder="Choose option..." error leadingIcon={<Icon name="favorite" size={16} />} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Error + Filled</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput
                placeholder="Choose option..."
                defaultValue="Australia"
                error
                clearable
                leadingIcon={<Icon name="favorite" size={16} />}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Disabled (Empty)</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput placeholder="Choose option..." disabled leadingIcon={<Icon name="favorite" size={16} />} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Disabled (Filled)</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput
                placeholder="Choose option..."
                defaultValue="Australia"
                disabled
                leadingIcon={<Icon name="favorite" size={16} />}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Read-only (Filled)</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput
                placeholder="Choose option..."
                defaultValue="Australia"
                readOnly
                leadingIcon={<Icon name="favorite" size={16} />}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>No leading icon</span>
            <div style={{ maxWidth: 420 }}>
              <SelectInput placeholder="Choose option..." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
