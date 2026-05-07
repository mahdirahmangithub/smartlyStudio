import { useState, useRef } from "react";
import { SelectButton } from "@sds/components/SelectButton";
import { Dropdown } from "@sds/components/Dropdown";
import { MultiSelectOption } from "@sds/components/MultiSelectOption";
import { Icon } from "@sds/components/Icon";

const sizes = ["sm", "md", "lg"] as const;
const emphases = ["medium", "low"] as const;

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

function InteractiveExample() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setOpen((v) => !v);

  return (
    <div>
      <h4>Interactive (with Dropdown)</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SelectButton
          ref={anchorRef}
          leadingIcon={<Icon name="favorite_fill" />}
          selectedCount={selected.length}
          expanded={open}
          onClick={toggle}
        >
          Fruits
        </SelectButton>
      </div>

      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
      >
        {FRUITS.map((fruit) => (
          <MultiSelectOption
            key={fruit}
            labelText={fruit}
            checked={selected.includes(fruit)}
            onChange={(checked) =>
              setSelected((prev) =>
                checked ? [...prev, fruit] : prev.filter((f) => f !== fruit)
              )
            }
          />
        ))}
      </Dropdown>
    </div>
  );
}

export default function SelectButtonPlayground() {
  return (
    <>
      <h2>SelectButton</h2>

      <section>
        <h3>Interactive demo</h3>
        <InteractiveExample />
      </section>

      {emphases.map((emphasis) => (
        <section key={emphasis}>
          <h3 style={{ textTransform: "capitalize" }}>{emphasis} emphasis</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Normal */}
            <div>
              <h4>Normal</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    leadingIcon={<Icon name="favorite_fill" />}
                    selectedCount={2}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Expanded / Active */}
            <div>
              <h4>Expanded (active)</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    expanded
                    leadingIcon={<Icon name="favorite_fill" />}
                    selectedCount={2}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Disabled */}
            <div>
              <h4>Disabled</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    disabled
                    leadingIcon={<Icon name="favorite_fill" />}
                    selectedCount={2}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Error */}
            <div>
              <h4>Error</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    error
                    leadingIcon={<Icon name="favorite_fill" />}
                    selectedCount={2}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Error + Expanded */}
            <div>
              <h4>Error + Expanded</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    error
                    expanded
                    leadingIcon={<Icon name="favorite_fill" />}
                    selectedCount={2}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Error + Disabled */}
            <div>
              <h4>Error + Disabled</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    error
                    disabled
                    leadingIcon={<Icon name="favorite_fill" />}
                    selectedCount={2}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Without badge */}
            <div>
              <h4>No badge (no selection)</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    leadingIcon={<Icon name="favorite_fill" />}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Without leading icon */}
            <div>
              <h4>No leading icon</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {sizes.map((size) => (
                  <SelectButton
                    key={size}
                    size={size}
                    emphasis={emphasis}
                    selectedCount={5}
                  >
                    Label
                  </SelectButton>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
