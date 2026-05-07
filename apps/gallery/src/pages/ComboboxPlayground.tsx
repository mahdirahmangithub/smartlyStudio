import { useState } from "react";
import { Combobox } from "@sds/components/Combobox";
import { Icon } from "@sds/components/Icon";

export default function ComboboxPlayground() {
  const [country, setCountry] = useState<string | null>(null);
  const [fruit, setFruit] = useState<string | null>(null);
  const [dino, setDino] = useState<string | null>(null);

  return (
    <>
      <h2>Combobox (Compound)</h2>

      {/* ── Basic with leading icon + clearable ── */}
      <section>
        <h3>Basic (searchable, clearable)</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          Type to filter. Items that don&apos;t match the query are hidden
          automatically.
        </p>

        <div style={{ maxWidth: 360 }}>
          <Combobox value={country} onValueChange={setCountry} name="country">
            <Combobox.Input
              placeholder="Search a country..."
              leadingIcon={<Icon name="search" size={16} />}
              clearable
            />
            <Combobox.Content>
              <Combobox.Item value="au">Australia</Combobox.Item>
              <Combobox.Item value="at">Austria</Combobox.Item>
              <Combobox.Item value="be">Belgium</Combobox.Item>
              <Combobox.Item value="br">Brazil</Combobox.Item>
              <Combobox.Item value="ca">Canada</Combobox.Item>
              <Combobox.Item value="dk">Denmark</Combobox.Item>
              <Combobox.Item value="fi">Finland</Combobox.Item>
              <Combobox.Item value="fr">France</Combobox.Item>
              <Combobox.Item value="de">Germany</Combobox.Item>
              <Combobox.Item value="ie">Ireland</Combobox.Item>
              <Combobox.Item value="it">Italy</Combobox.Item>
              <Combobox.Item value="jp">Japan</Combobox.Item>
              <Combobox.Item value="mx">Mexico</Combobox.Item>
              <Combobox.Item value="nl">Netherlands</Combobox.Item>
              <Combobox.Item value="no">Norway</Combobox.Item>
              <Combobox.Item value="pt">Portugal</Combobox.Item>
              <Combobox.Item value="es">Spain</Combobox.Item>
              <Combobox.Item value="se">Sweden</Combobox.Item>
              <Combobox.Item value="ch">Switzerland</Combobox.Item>
              <Combobox.Item value="gb">United Kingdom</Combobox.Item>
              <Combobox.Item value="us">United States</Combobox.Item>
              <Combobox.Empty>No countries found</Combobox.Empty>
            </Combobox.Content>
          </Combobox>
        </div>

        <p style={{ fontSize: 13, marginTop: 8 }}>
          Selected: <strong>{country ?? "none"}</strong>
        </p>
      </section>

      {/* ── Simple (no icon) ── */}
      <section>
        <h3>Simple (no icon)</h3>

        <div style={{ maxWidth: 360 }}>
          <Combobox value={fruit} onValueChange={setFruit}>
            <Combobox.Input placeholder="Pick a fruit" clearable />
            <Combobox.Content>
              <Combobox.Item value="apple">Apple</Combobox.Item>
              <Combobox.Item value="banana">Banana</Combobox.Item>
              <Combobox.Item value="cherry">Cherry</Combobox.Item>
              <Combobox.Item value="date">Date</Combobox.Item>
              <Combobox.Item value="elderberry">Elderberry</Combobox.Item>
              <Combobox.Item value="fig">Fig</Combobox.Item>
              <Combobox.Item value="grape">Grape</Combobox.Item>
              <Combobox.Empty />
            </Combobox.Content>
          </Combobox>
        </div>

        <p style={{ fontSize: 13, marginTop: 8 }}>
          Selected: <strong>{fruit ?? "none"}</strong>
        </p>
      </section>

      {/* ── With groups + disabled items ── */}
      <section>
        <h3>With groups &amp; disabled items</h3>

        <div style={{ maxWidth: 360 }}>
          <Combobox value={dino} onValueChange={setDino}>
            <Combobox.Input
              placeholder="Search dinosaurs..."
              leadingIcon={<Icon name="pets" size={16} />}
              clearable
            />
            <Combobox.Content>
              <Combobox.Group>
                <Combobox.Label>Theropods</Combobox.Label>
                <Combobox.Item value="tyrannosaurus">
                  Tyrannosaurus
                </Combobox.Item>
                <Combobox.Item value="velociraptor">
                  Velociraptor
                </Combobox.Item>
                <Combobox.Item value="deinonychus" disabled>
                  Deinonychus (unavailable)
                </Combobox.Item>
              </Combobox.Group>

              <Combobox.Separator />

              <Combobox.Group>
                <Combobox.Label>Sauropods</Combobox.Label>
                <Combobox.Item value="diplodocus">Diplodocus</Combobox.Item>
                <Combobox.Item value="saltasaurus">
                  Saltasaurus
                </Combobox.Item>
                <Combobox.Item value="apatosaurus">
                  Apatosaurus
                </Combobox.Item>
              </Combobox.Group>

              <Combobox.Empty>No dinosaurs found</Combobox.Empty>
            </Combobox.Content>
          </Combobox>
        </div>

        <p style={{ fontSize: 13, marginTop: 8 }}>
          Selected: <strong>{dino ?? "none"}</strong>
        </p>
      </section>

      {/* ── Disabled ── */}
      <section>
        <h3>Disabled</h3>

        <div style={{ maxWidth: 360 }}>
          <Combobox value="fr" disabled>
            <Combobox.Input placeholder="Search..." />
            <Combobox.Content>
              <Combobox.Item value="fr">France</Combobox.Item>
              <Combobox.Item value="de">Germany</Combobox.Item>
            </Combobox.Content>
          </Combobox>
        </div>
      </section>

      {/* ── Read-only ── */}
      <section>
        <h3>Read-only</h3>

        <div style={{ maxWidth: 360 }}>
          <Combobox value="de" readOnly>
            <Combobox.Input placeholder="Search..." />
            <Combobox.Content>
              <Combobox.Item value="fr">France</Combobox.Item>
              <Combobox.Item value="de">Germany</Combobox.Item>
            </Combobox.Content>
          </Combobox>
        </div>
      </section>

      {/* ── Error state ── */}
      <section>
        <h3>Error state</h3>

        <div style={{ maxWidth: 360 }}>
          <Combobox>
            <Combobox.Input placeholder="Required field" error clearable />
            <Combobox.Content>
              <Combobox.Item value="a">Option A</Combobox.Item>
              <Combobox.Item value="b">Option B</Combobox.Item>
              <Combobox.Item value="c">Option C</Combobox.Item>
              <Combobox.Empty />
            </Combobox.Content>
          </Combobox>
        </div>
      </section>

      {/* ── Size variants ── */}
      <section>
        <h3>Size variants</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
          {(["md", "lg", "xl"] as const).map((s) => (
            <div key={s}>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-neutral-secondary-default)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {s}
              </span>
              <Combobox>
                <Combobox.Input
                  size={s}
                  placeholder="Search..."
                  leadingIcon={<Icon name="search" size={s === "xl" ? 20 : 16} />}
                />
                <Combobox.Content>
                  <Combobox.Item value="a">Option A</Combobox.Item>
                  <Combobox.Item value="b">Option B</Combobox.Item>
                  <Combobox.Empty />
                </Combobox.Content>
              </Combobox>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
