import { useState } from "react";
import { Select } from "../components/Select";
import { Icon } from "../components/Icon";

export default function SelectPlayground() {
  const [dino, setDino] = useState<string | null>(null);
  const [fruit, setFruit] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  return (
    <>
      <h2>Select (Compound)</h2>

      {/* ── Basic with optgroups (mirrors the native <select> + <optgroup>) ── */}
      <section>
        <h3>With optgroups</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          Equivalent to native &lt;select&gt; + &lt;optgroup&gt;
        </p>

        <Select value={dino} onValueChange={setDino} name="dino">
          <Select.Trigger leadingIcon={<Icon name="pet" />}>
            <Select.Value placeholder="Pick a dinosaur" />
          </Select.Trigger>

          <Select.Content>
            <Select.Group>
              <Select.Label>Theropods</Select.Label>
              <Select.Item value="tyrannosaurus">Tyrannosaurus</Select.Item>
              <Select.Item value="velociraptor">Velociraptor</Select.Item>
              <Select.Item value="deinonychus">Deinonychus</Select.Item>
            </Select.Group>

            <Select.Separator />

            <Select.Group>
              <Select.Label>Sauropods</Select.Label>
              <Select.Item value="diplodocus">Diplodocus</Select.Item>
              <Select.Item value="saltasaurus">Saltasaurus</Select.Item>
              <Select.Item value="apatosaurus">Apatosaurus</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select>

        <p style={{ fontSize: 13, marginTop: 8 }}>
          Selected: <strong>{dino ?? "none"}</strong>
        </p>
      </section>

      {/* ── Simple (no groups) ── */}
      <section>
        <h3>Simple (no groups)</h3>

        <Select value={fruit} onValueChange={setFruit}>
          <Select.Trigger>
            <Select.Value placeholder="Pick a fruit" />
          </Select.Trigger>

          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
            <Select.Item value="cherry">Cherry</Select.Item>
            <Select.Item value="date">Date</Select.Item>
            <Select.Item value="elderberry">Elderberry</Select.Item>
          </Select.Content>
        </Select>

        <p style={{ fontSize: 13, marginTop: 8 }}>
          Selected: <strong>{fruit ?? "none"}</strong>
        </p>
      </section>

      {/* ── With disabled items ── */}
      <section>
        <h3>With disabled items</h3>

        <Select value={country} onValueChange={setCountry}>
          <Select.Trigger emphasis="low">
            <Select.Value placeholder="Country" />
          </Select.Trigger>

          <Select.Content>
            <Select.Item value="us">United States</Select.Item>
            <Select.Item value="uk">United Kingdom</Select.Item>
            <Select.Item value="de" disabled>
              Germany (unavailable)
            </Select.Item>
            <Select.Item value="fr">France</Select.Item>
            <Select.Item value="jp">Japan</Select.Item>
          </Select.Content>
        </Select>

        <p style={{ fontSize: 13, marginTop: 8 }}>
          Selected: <strong>{country ?? "none"}</strong>
        </p>
      </section>

      {/* ── Disabled entire select ── */}
      <section>
        <h3>Disabled</h3>

        <Select value="apple" disabled>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>

          <Select.Content>
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Content>
        </Select>
      </section>

      {/* ── Error state ── */}
      <section>
        <h3>Error state</h3>

        <Select>
          <Select.Trigger error>
            <Select.Value placeholder="Required field" />
          </Select.Trigger>

          <Select.Content>
            <Select.Item value="a">Option A</Select.Item>
            <Select.Item value="b">Option B</Select.Item>
            <Select.Item value="c">Option C</Select.Item>
          </Select.Content>
        </Select>
      </section>

      {/* ── Size variants ── */}
      <section>
        <h3>Size variants</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {(["sm", "md", "lg"] as const).map((size) => (
            <Select key={size}>
              <Select.Trigger size={size}>
                <Select.Value placeholder={size.toUpperCase()} />
              </Select.Trigger>

              <Select.Content>
                <Select.Item value="a">Option A</Select.Item>
                <Select.Item value="b">Option B</Select.Item>
              </Select.Content>
            </Select>
          ))}
        </div>
      </section>
    </>
  );
}
