import { useState } from "react";
import { SelectOptionHeader } from "../components/SelectOptionHeader";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { SingleSelectOption } from "../components/SingleSelectOption";
import { OptionSeparator } from "../components/OptionSeparator";

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"];

export default function SelectOptionHeaderPlayground() {
  const [searchVal, setSearchVal] = useState("");
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredFruits = FRUITS.filter((f) =>
    f.toLowerCase().includes(searchVal.toLowerCase())
  );

  const toggleFruit = (f: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>SelectOptionHeader</h2>

      {/* ── Search type (static) ──────────────────────────────────────── */}
      <section>
        <h3>Search type</h3>
        <div
          style={{
            width: 304,
            border: "1px solid var(--element-outline-neutral-default)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <SelectOptionHeader type="search" searchPlaceholder="Search..." />
        </div>
      </section>

      {/* ── From-to type (static) ─────────────────────────────────────── */}
      <section>
        <h3>From-to type</h3>
        <div
          style={{
            width: 304,
            border: "1px solid var(--element-outline-neutral-default)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <SelectOptionHeader
            type="from-to"
            fromPlaceholder="Min value"
            toPlaceholder="Max value"
          />
        </div>
      </section>

      {/* ── Search with options list ──────────────────────────────────── */}
      <section>
        <h3>Search + option list</h3>
        <div
          style={{
            width: 304,
            border: "1px solid var(--element-outline-neutral-default)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <SelectOptionHeader
            type="search"
            searchValue={searchVal}
            searchPlaceholder="Search fruits..."
            onSearchChange={(e) => setSearchVal(e.target.value)}
            onSearchClear={() => setSearchVal("")}
          />
          <OptionSeparator type="divider" />
          {filteredFruits.map((f) => (
            <MultiSelectOption
              key={f}
              labelText={f}
              selected={selected.has(f)}
              onClick={() => toggleFruit(f)}
            />
          ))}
          {filteredFruits.length === 0 && (
            <div
              style={{
                padding: "12px 16px",
                fontSize: 13,
                color: "var(--text-neutral-placeholder)",
              }}
            >
              No results
            </div>
          )}
        </div>
      </section>

      {/* ── From-to with options list ─────────────────────────────────── */}
      <section>
        <h3>From-to + option list</h3>
        <div
          style={{
            width: 304,
            border: "1px solid var(--element-outline-neutral-default)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <SelectOptionHeader
            type="from-to"
            fromValue={fromVal}
            fromPlaceholder="From"
            onFromChange={(e) => setFromVal(e.target.value)}
            toValue={toVal}
            toPlaceholder="To"
            onToChange={(e) => setToVal(e.target.value)}
          />
          <OptionSeparator type="divider" />
          <SingleSelectOption labelText="Last 7 days" />
          <SingleSelectOption labelText="Last 30 days" />
          <SingleSelectOption labelText="Last 90 days" />
          <SingleSelectOption labelText="Custom range" />
        </div>
      </section>
    </div>
  );
}
