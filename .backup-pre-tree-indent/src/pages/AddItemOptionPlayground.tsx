import { useState } from "react";
import { AddItemOption } from "../components/AddItemOption";
import { Icon } from "../components/Icon";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { SingleSelectOption } from "../components/SingleSelectOption";

export default function AddItemOptionPlayground() {
  const [clicked, setClicked] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>AddItemOption</h2>

      {/* ── Default (no multiSelect) ──────────────────────────────── */}
      <section>
        <h3>Default</h3>
        <div style={{ maxWidth: 304 }}>
          <AddItemOption
            labelText="Add"
            itemText="New Tag"
            onClick={() => setClicked("Default clicked")}
          />
        </div>
        {clicked && <p style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>{clicked}</p>}
      </section>

      {/* ── Disabled ──────────────────────────────────────────────── */}
      <section>
        <h3>Disabled</h3>
        <div style={{ maxWidth: 304 }}>
          <AddItemOption
            labelText="Add"
            itemText="Something"
            disabled
          />
        </div>
      </section>

      {/* ── multiSelect = true (aligned with MultiSelectOption) ──── */}
      <section>
        <h3>multiSelect alignment</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          The AddItemOption with <code>multiSelect</code> shifts its padding to align with
          MultiSelectOption rows that have a leading checkbox.
        </p>
        <div style={{ maxWidth: 304 }}>
          <MultiSelectOption
            labelText="Apple"
            description={false}
            checked
            leading={<Icon name="favorite" size={24} />}
          />
          <MultiSelectOption
            labelText="Banana"
            description={false}
            leading={<Icon name="info" size={24} />}
          />
          <AddItemOption
            multiSelect
            labelText="Add"
            itemText="Cherry"
          />
        </div>
      </section>

      {/* ── Beside SingleSelectOption items ─────────────────────── */}
      <section>
        <h3>Beside SingleSelectOption</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          Without <code>multiSelect</code>, padding aligns naturally with single-select rows.
        </p>
        <div style={{ maxWidth: 304 }}>
          <SingleSelectOption
            labelText="Red"
            description={false}
            checked
            leading={<Icon name="favorite" size={24} />}
          />
          <SingleSelectOption
            labelText="Blue"
            description={false}
            leading={<Icon name="info" size={24} />}
          />
          <AddItemOption
            labelText="Add"
            itemText="Green"
          />
        </div>
      </section>

      {/* ── multiSelect disabled ──────────────────────────────────── */}
      <section>
        <h3>multiSelect disabled</h3>
        <div style={{ maxWidth: 304 }}>
          <AddItemOption
            multiSelect
            labelText="Add"
            itemText="Item"
            disabled
          />
        </div>
      </section>

      {/* ── Without multiSelect (standalone) ─────────────────────── */}
      <section>
        <h3>Standalone (no multiSelect)</h3>
        <div style={{ maxWidth: 304 }}>
          <AddItemOption
            labelText="Create"
            itemText="My custom option"
          />
        </div>
      </section>
    </div>
  );
}
