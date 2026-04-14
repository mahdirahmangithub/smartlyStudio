import { useState, useCallback } from "react";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { Divider } from "../components/Divider";
import { Checkbox } from "../components/Checkbox";
import { ScrollFade } from "../components/ScrollFade";

const ITEMS = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "gamma", label: "Gamma" },
  { id: "delta", label: "Delta" },
];

function MultiSelectOptionTest() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ITEMS.map((i) => i.id))
  );

  const allChecked = selected.size === ITEMS.length;
  const someChecked = selected.size > 0 && selected.size < ITEMS.length;

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ITEMS.map((i) => i.id)));
    }
  }, [allChecked]);

  return (
    <div style={{ width: 280, border: "1px solid #ddd", borderRadius: 8, padding: 4 }}>
      <MultiSelectOption
        labelText="Select all"
        checked={allChecked}
        indeterminate={someChecked}
        description={false}
        onChange={handleSelectAll}
      />
      <Divider />
      {ITEMS.map((item) => (
        <MultiSelectOption
          key={item.id}
          labelText={item.label}
          checked={selected.has(item.id)}
          description={false}
          onChange={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
}

function RawCheckboxTest() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ITEMS.map((i) => i.id))
  );

  const allChecked = selected.size === ITEMS.length;
  const someChecked = selected.size > 0 && selected.size < ITEMS.length;

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ITEMS.map((i) => i.id)));
    }
  }, [allChecked]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={handleSelectAll}
          size="lg"
        />
        <span style={{ fontWeight: 600 }}>Select all</span>
        <span style={{ opacity: 0.5, fontSize: 12 }}>
          ({allChecked ? "all" : someChecked ? "indeterminate" : "none"})
        </span>
      </label>
      <div style={{ borderLeft: "2px solid #ddd", marginLeft: 10, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {ITEMS.map((item) => (
          <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Checkbox
              checked={selected.has(item.id)}
              onChange={() => toggleItem(item.id)}
              size="lg"
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function ScrollFadeTest() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ITEMS.map((i) => i.id))
  );

  const allChecked = selected.size === ITEMS.length;
  const someChecked = selected.size > 0 && selected.size < ITEMS.length;

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ITEMS.map((i) => i.id)));
    }
  }, [allChecked]);

  return (
    <div style={{ width: 280, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ padding: 4 }}>
        <MultiSelectOption
          labelText="Select all"
          checked={allChecked}
          indeterminate={someChecked}
          description={false}
          onChange={handleSelectAll}
        />
      </div>
      <Divider />
      <ScrollFade
        direction="vertical"
        surface="default"
        scrollAreaStyle={{ maxHeight: 120 }}
      >
        {ITEMS.map((item) => (
          <MultiSelectOption
            key={item.id}
            labelText={item.label}
            checked={selected.has(item.id)}
            description={false}
            onChange={() => toggleItem(item.id)}
          />
        ))}
      </ScrollFade>
    </div>
  );
}

export default function CheckboxAnimTestPlayground() {
  return (
    <>
      <h1>Checkbox Animation Test</h1>
      <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 24 }}>
        Test the checked ↔ indeterminate rotation animation outside of a Dropdown.
        Toggle individual items and watch the "Select all" checkbox transition.
      </p>

      <section style={{ marginBottom: 48 }}>
        <h2>Raw Checkbox (large)</h2>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 12px" }}>
          Direct Checkbox component with no wrapper. Should show 180° rotation when transitioning between checked and indeterminate.
        </p>
        <RawCheckboxTest />
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2>MultiSelectOption (no Dropdown)</h2>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 12px" }}>
          Same logic using MultiSelectOption — but rendered flat, not inside a Dropdown.
        </p>
        <MultiSelectOptionTest />
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2>MultiSelectOption + ScrollFade (no Dropdown)</h2>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 12px" }}>
          Select all is outside the ScrollFade. Items are inside a scrollable ScrollFade container (maxHeight: 120px).
          Tests whether ScrollFade's MutationObserver causes the rotation animation to break.
        </p>
        <ScrollFadeTest />
      </section>
    </>
  );
}
