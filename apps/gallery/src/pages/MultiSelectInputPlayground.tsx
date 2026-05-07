import { useState, useRef, useMemo } from "react";
import { MultiSelectInput, type MultiSelectInputSize } from "@sds/components/MultiSelectInput";
import { GenericSelectOption } from "@sds/components/GenericSelectOption";
import { MultiSelectOption } from "@sds/components/MultiSelectOption";
import { Tag, type TagType } from "@sds/components/Tag";
import { MoreTag } from "@sds/components/MoreTag";
import { SelectOptionHeader } from "@sds/components/SelectOptionHeader";

const SIZES: MultiSelectInputSize[] = ["md", "lg", "xl"];

const FRUITS = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Kiwi",
  "Lemon",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Raspberry",
];

const CATEGORIES: { label: string; variant: TagType }[] = [
  { label: "Design", variant: "brand" },
  { label: "Engineering", variant: "info" },
  { label: "Marketing", variant: "success" },
  { label: "Sales", variant: "warning" },
  { label: "Support", variant: "alert" },
  { label: "Product", variant: "cat-1" },
  { label: "Finance", variant: "cat-2" },
  { label: "Legal", variant: "cat-3" },
  { label: "HR", variant: "cat-4" },
];

const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

function GenericDemo() {
  const [size, setSize] = useState<MultiSelectInputSize>("lg");
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [clearable, setClearable] = useState(true);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () =>
      FRUITS.filter((f) => !selected.includes(f)).filter((f) =>
        query ? f.toLowerCase().includes(query.toLowerCase()) : true
      ),
    [selected, query]
  );

  const handleSelect = (fruit: string) => {
    setSelected((prev) => [...prev, fruit]);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleRemove = (fruit: string) => {
    setSelected((prev) => prev.filter((f) => f !== fruit));
  };

  const handleClick = () => {
    if (!open && !disabled && !readOnly) setOpen(true);
  };

  const [moreSearch, setMoreSearch] = useState("");

  const maxVisible = 3;
  const visibleTags = selected.slice(0, maxVisible);
  const overflowItems = selected.slice(maxVisible);
  const overflowCount = overflowItems.length;

  const filteredOverflow = useMemo(
    () =>
      moreSearch
        ? overflowItems.filter((f) =>
            f.toLowerCase().includes(moreSearch.toLowerCase())
          )
        : overflowItems,
    [overflowItems, moreSearch]
  );

  const tagElements = (
    <>
      {visibleTags.map((fruit) => (
        <Tag
          key={fruit}
          size="md"
          variant="neutral"
          label={fruit}
          onRemove={disabled || readOnly ? undefined : () => handleRemove(fruit)}
        />
      ))}
      {overflowCount > 0 && (
        <MoreTag
          count={overflowCount}
          size="md"
          disabled={disabled}
          onOpen={() => {
            setOpen(false);
            setQuery("");
            setMoreSearch("");
          }}
          header={
            <SelectOptionHeader
              type="search"
              searchValue={moreSearch}
              searchPlaceholder="Search..."
              onSearchChange={(e) => setMoreSearch(e.target.value)}
              onSearchClear={() => setMoreSearch("")}
            />
          }
        >
          {filteredOverflow.length > 0 ? (
            filteredOverflow.map((fruit) => (
              <GenericSelectOption
                key={fruit}
                labelText={fruit}
                onClick={() => handleRemove(fruit)}
              />
            ))
          ) : (
            <div style={{ padding: "12px 16px", color: "var(--text-neutral-placeholder)", fontSize: 14 }}>
              No results
            </div>
          )}
        </MoreTag>
      )}
    </>
  );

  return (
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
          <select value={size} onChange={(e) => setSize(e.target.value as MultiSelectInputSize)} style={selectStyle}>
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
      </div>

      <div style={{ maxWidth: 420 }}>
        <MultiSelectInput
          ref={inputRef}
          size={size}
          error={error}
          disabled={disabled}
          readOnly={readOnly}
          clearable={clearable}
          placeholder={selected.length > 0 ? "" : "Pick fruits..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              setOpen(false);
              setQuery("");
            }
            if (e.key === "Backspace" && query === "" && selected.length > 0) {
              handleRemove(selected[selected.length - 1]);
            }
          }}
          expanded={open && !disabled && !readOnly}
          onClose={() => {
            setOpen(false);
            setQuery("");
          }}
          onClear={() => {
            setSelected([]);
            setQuery("");
          }}
          tags={selected.length > 0 ? tagElements : undefined}
        >
          {available.length > 0 ? (
            available.map((fruit) => (
              <GenericSelectOption
                key={fruit}
                labelText={fruit}
                onClick={() => handleSelect(fruit)}
              />
            ))
          ) : (
            <div style={{ padding: "12px 16px", color: "var(--text-neutral-placeholder)", fontSize: 14 }}>
              No results
            </div>
          )}
        </MultiSelectInput>
      </div>

      <p style={{ fontSize: 13, margin: 0 }}>
        Selected: <strong>{selected.length > 0 ? selected.join(", ") : "none"}</strong>
      </p>
    </div>
  );
}

function MultiSelectOptionDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["Apple", "Cherry"]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      query
        ? FRUITS.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
        : FRUITS,
    [query]
  );

  const handleToggle = (fruit: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, fruit] : prev.filter((f) => f !== fruit)
    );
  };

  const handleClick = () => {
    if (!open) setOpen(true);
  };

  return (
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
      <div style={{ maxWidth: 420 }}>
        <MultiSelectInput
          ref={inputRef}
          placeholder={selected.length > 0 ? "" : "Select fruits..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              setOpen(false);
              setQuery("");
            }
            if (e.key === "Backspace" && query === "" && selected.length > 0) {
              setSelected((prev) => prev.slice(0, -1));
            }
          }}
          expanded={open}
          onClose={() => {
            setOpen(false);
            setQuery("");
          }}
          clearable
          onClear={() => {
            setSelected([]);
            setQuery("");
          }}
          tags={
            selected.length > 0
              ? selected.map((fruit) => (
                  <Tag
                    key={fruit}
                    size="md"
                    variant="neutral"
                    label={fruit}
                    onRemove={() => handleToggle(fruit, false)}
                  />
                ))
              : undefined
          }
        >
          {filtered.length > 0 ? (
            filtered.map((fruit) => (
              <MultiSelectOption
                key={fruit}
                labelText={fruit}
                checked={selected.includes(fruit)}
                onChange={(checked) => handleToggle(fruit, checked)}
              />
            ))
          ) : (
            <div style={{ padding: "12px 16px", color: "var(--text-neutral-placeholder)", fontSize: 14 }}>
              No results
            </div>
          )}
        </MultiSelectInput>
      </div>

      <p style={{ fontSize: 13, margin: 0 }}>
        Selected: <strong>{selected.length > 0 ? selected.join(", ") : "none"}</strong>
      </p>
    </div>
  );
}

function StyledTagDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof CATEGORIES[number][]>([
    CATEGORIES[0],
    CATEGORIES[1],
  ]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      query
        ? CATEGORIES.filter((c) =>
            c.label.toLowerCase().includes(query.toLowerCase())
          )
        : CATEGORIES,
    [query]
  );

  const handleToggle = (cat: typeof CATEGORIES[number], checked: boolean) => {
    setSelected((prev) =>
      checked
        ? [...prev, cat]
        : prev.filter((c) => c.label !== cat.label)
    );
  };

  const handleClick = () => {
    if (!open) setOpen(true);
  };

  return (
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
      <div style={{ maxWidth: 420 }}>
        <MultiSelectInput
          ref={inputRef}
          placeholder={selected.length > 0 ? "" : "Select categories..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              setOpen(false);
              setQuery("");
            }
            if (e.key === "Backspace" && query === "" && selected.length > 0) {
              setSelected((prev) => prev.slice(0, -1));
            }
          }}
          expanded={open}
          onClose={() => {
            setOpen(false);
            setQuery("");
          }}
          clearable
          onClear={() => {
            setSelected([]);
            setQuery("");
          }}
          tags={
            selected.length > 0
              ? selected.map((cat) => (
                  <Tag
                    key={cat.label}
                    size="md"
                    variant={cat.variant}
                    label={cat.label}
                    onRemove={() => handleToggle(cat, false)}
                  />
                ))
              : undefined
          }
        >
          {filtered.length > 0 ? (
            filtered.map((cat) => (
              <MultiSelectOption
                key={cat.label}
                labelText={cat.label}
                checked={selected.some((s) => s.label === cat.label)}
                onChange={(checked) => handleToggle(cat, checked)}
              />
            ))
          ) : (
            <div style={{ padding: "12px 16px", color: "var(--text-neutral-placeholder)", fontSize: 14 }}>
              No results
            </div>
          )}
        </MultiSelectInput>
      </div>

      <p style={{ fontSize: 13, margin: 0 }}>
        Selected: <strong>{selected.length > 0 ? selected.map((c) => c.label).join(", ") : "none"}</strong>
      </p>
    </div>
  );
}

export default function MultiSelectInputPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section>
        <h2 style={{ margin: "0 0 16px" }}>MultiSelectInput</h2>
        <h3 style={{ margin: "0 0 8px" }}>Generic options (items removed on select)</h3>
        <GenericDemo />
      </section>

      <section>
        <h3 style={{ margin: "0 0 8px" }}>MultiSelect options (checkbox, items stay)</h3>
        <MultiSelectOptionDemo />
      </section>

      <section>
        <h3 style={{ margin: "0 0 8px" }}>Styled tags (variant follows selection)</h3>
        <StyledTagDemo />
      </section>

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
                <MultiSelectInput
                  size={s}
                  placeholder="placeholder"
                  tags={
                    <>
                      <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                      <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                      <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                      <MoreTag count={7} size="md">
                        <GenericSelectOption labelText="Item 1" onClick={() => {}} />
                        <GenericSelectOption labelText="Item 2" onClick={() => {}} />
                      </MoreTag>
                    </>
                  }
                  clearable
                  onClear={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

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
              <MultiSelectInput placeholder="placeholder" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Filled</span>
            <div style={{ maxWidth: 420 }}>
              <MultiSelectInput
                placeholder="placeholder"
                clearable
                onClear={() => {}}
                tags={
                  <>
                    <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                    <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                  </>
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Error</span>
            <div style={{ maxWidth: 420 }}>
              <MultiSelectInput
                placeholder="placeholder"
                error
                clearable
                onClear={() => {}}
                tags={
                  <>
                    <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                    <Tag size="md" variant="neutral" label="Label" onRemove={() => {}} />
                  </>
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Disabled (filled)</span>
            <div style={{ maxWidth: 420 }}>
              <MultiSelectInput
                placeholder="placeholder"
                disabled
                tags={
                  <>
                    <Tag size="md" variant="neutral" label="Label" />
                    <Tag size="md" variant="neutral" label="Label" />
                    <Tag size="md" variant="neutral" label="Label" />
                    <MoreTag count={7} size="md" disabled>
                      <GenericSelectOption labelText="Item" onClick={() => {}} />
                    </MoreTag>
                  </>
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Read-only (filled)</span>
            <div style={{ maxWidth: 420 }}>
              <MultiSelectInput
                placeholder="placeholder"
                readOnly
                tags={
                  <>
                    <Tag size="md" variant="neutral" label="Label" />
                    <Tag size="md" variant="neutral" label="Label" />
                  </>
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={captionStyle}>Wrapping tags (many selections)</span>
            <div style={{ maxWidth: 420 }}>
              <MultiSelectInput
                placeholder=""
                clearable
                onClear={() => {}}
                tags={
                  <>
                    <Tag size="md" variant="brand" label="Design" onRemove={() => {}} />
                    <Tag size="md" variant="info" label="Engineering" onRemove={() => {}} />
                    <Tag size="md" variant="success" label="Marketing" onRemove={() => {}} />
                    <Tag size="md" variant="warning" label="Sales" onRemove={() => {}} />
                    <Tag size="md" variant="alert" label="Support" onRemove={() => {}} />
                    <Tag size="md" variant="cat-1" label="Product" onRemove={() => {}} />
                    <Tag size="md" variant="cat-2" label="Finance" onRemove={() => {}} />
                  </>
                }
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
