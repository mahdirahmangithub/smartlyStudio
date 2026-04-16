import { useState, useRef, type ChangeEvent } from "react";
import {
  Dropdown,
  HoverSubmenu,
} from "../components/Dropdown";
import { SelectOptionHeader } from "../components/SelectOptionHeader";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { SingleSelectOption } from "../components/SingleSelectOption";
import { GenericSelectOption } from "../components/GenericSelectOption";
import { NavigationSelectOption } from "../components/NavigationSelectOption";
import { TagMultiSelectOption } from "../components/TagMultiSelectOption";
import { AddItemOption } from "../components/AddItemOption";
import { OptionSeparator } from "../components/OptionSeparator";
import { Icon, type IconName } from "../components/Icon";

const FRUITS = [
  "Apple", "Banana", "Cherry", "Date", "Elderberry",
  "Fig", "Grape", "Honeydew", "Kiwi", "Lemon",
  "Mango", "Nectarine", "Orange", "Papaya",
];

const PAGES = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Analytics", icon: "stacked_bar_chart" },
  { label: "Settings", icon: "settings" },
  { label: "Profile", icon: "person" },
  { label: "Notifications", icon: "notifications" },
  { label: "Help Center", icon: "help" },
];

/** Set to `false` to hide the gap bridge overlay in the nested-menu demo. */
const NESTED_MENU_BRIDGE_DEBUG = true;


export default function DropdownPlayground() {
  /* ── multi-select with search + add ─────────── */
  const multiRef = useRef<HTMLButtonElement>(null);
  const [multiOpen, setMultiOpen] = useState(false);
  const [multiSearch, setMultiSearch] = useState("");
  const [selectedFruits, setSelectedFruits] = useState<Set<string>>(new Set(["Apple", "Cherry"]));
  const filteredFruits = FRUITS.filter((f) =>
    f.toLowerCase().includes(multiSearch.toLowerCase())
  );
  const toggleFruit = (f: string) => {
    setSelectedFruits((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  };

  /* ── scrollable multi-select (constrained height) */
  const scrollRef = useRef<HTMLButtonElement>(null);
  const [scrollOpen, setScrollOpen] = useState(false);
  const [scrollSearch, setScrollSearch] = useState("");
  const [scrollSelected, setScrollSelected] = useState<Set<string>>(new Set());
  const COUNTRIES = [
    "Argentina", "Australia", "Brazil", "Canada", "Chile",
    "China", "Colombia", "Denmark", "Egypt", "Finland",
    "France", "Germany", "Greece", "India", "Indonesia",
    "Ireland", "Italy", "Japan", "Kenya", "Mexico",
    "Netherlands", "New Zealand", "Nigeria", "Norway", "Peru",
    "Poland", "Portugal", "South Korea", "Spain", "Sweden",
    "Switzerland", "Thailand", "Turkey", "United Kingdom", "United States",
  ];
  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(scrollSearch.toLowerCase())
  );
  const toggleCountry = (c: string) => {
    setScrollSelected((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  /* ── single-select ──────────────────────────── */
  const singleRef = useRef<HTMLButtonElement>(null);
  const [singleOpen, setSingleOpen] = useState(false);
  const [singleValue, setSingleValue] = useState<string | null>(null);

  /* ── navigation ─────────────────────────────── */
  const navRef = useRef<HTMLButtonElement>(null);
  const [navOpen, setNavOpen] = useState(false);

  /* ── tag multi-select with search ───────────── */
  const tagRef = useRef<HTMLButtonElement>(null);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const TAGS = ["Design", "Engineering", "Marketing", "Sales", "Support", "Product", "Finance", "Legal", "HR"];
  const filteredTags = TAGS.filter((t) =>
    t.toLowerCase().includes(tagSearch.toLowerCase())
  );
  const toggleTag = (t: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  /* ── generic with groups ────────────────────── */
  const genericRef = useRef<HTMLButtonElement>(null);
  const [genericOpen, setGenericOpen] = useState(false);

  /* ── minimal (no header/footer) ─────────────── */
  const minRef = useRef<HTMLButtonElement>(null);
  const [minOpen, setMinOpen] = useState(false);

  /* ── placement top ──────────────────────────── */
  const topRef = useRef<HTMLButtonElement>(null);
  const [topOpen, setTopOpen] = useState(false);

  /* ── nested hover submenus (3 levels) ─────── */
  const submenuRef = useRef<HTMLButtonElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const btnStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid var(--element-outline-neutral-default)",
    background: "var(--element-surface-default)",
    cursor: "pointer",
    fontFamily: "var(--type-label-sm-family)",
    fontSize: "var(--type-label-sm-size)",
    color: "var(--text-neutral-primary)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>Dropdown</h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* ── Multi-select with search + add item ──── */}
        <section>
          <h3>Multi-select + search + add</h3>
          <button ref={multiRef} style={btnStyle} onClick={() => setMultiOpen(!multiOpen)}>
            {selectedFruits.size ? `${selectedFruits.size} fruits selected` : "Select fruits..."}
          </button>
          <Dropdown
            open={multiOpen}
            onClose={() => setMultiOpen(false)}
            anchorRef={multiRef}
            header={
              <SelectOptionHeader
                type="search"
                searchValue={multiSearch}
                searchPlaceholder="Search fruits..."
                onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setMultiSearch(e.target.value)}
                onSearchClear={() => setMultiSearch("")}
              />
            }
            footer={
              <AddItemOption
                multiSelect
                itemText={multiSearch || "New fruit"}
                onClick={() => {
                  if (multiSearch) {
                    toggleFruit(multiSearch);
                    setMultiSearch("");
                  }
                }}
              />
            }
          >
            {filteredFruits.map((f) => (
              <MultiSelectOption
                key={f}
                labelText={f}
                description={false}
                checked={selectedFruits.has(f)}
                onChange={() => toggleFruit(f)}
              />
            ))}
            {filteredFruits.length === 0 && (
              <div style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-neutral-placeholder)" }}>
                No matching fruits
              </div>
            )}
          </Dropdown>
        </section>

        {/* ── Scrollable multi-select (35 items, capped height) */}
        <section>
          <h3>Scrollable (35 countries)</h3>
          <button ref={scrollRef} style={btnStyle} onClick={() => setScrollOpen(!scrollOpen)}>
            {scrollSelected.size ? `${scrollSelected.size} countries selected` : "Select countries..."}
          </button>
          <Dropdown
            open={scrollOpen}
            onClose={() => setScrollOpen(false)}
            anchorRef={scrollRef}
            maxHeight={400}
            header={
              <SelectOptionHeader
                type="search"
                searchValue={scrollSearch}
                searchPlaceholder="Search countries..."
                onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setScrollSearch(e.target.value)}
                onSearchClear={() => setScrollSearch("")}
              />
            }
            footer={
              <AddItemOption
                multiSelect
                itemText={scrollSearch || "New country"}
                onClick={() => {
                  if (scrollSearch) {
                    toggleCountry(scrollSearch);
                    setScrollSearch("");
                  }
                }}
              />
            }
          >
            {filteredCountries.map((c) => (
              <MultiSelectOption
                key={c}
                labelText={c}
                description={false}
                checked={scrollSelected.has(c)}
                onChange={() => toggleCountry(c)}
              />
            ))}
            {filteredCountries.length === 0 && (
              <div style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-neutral-placeholder)" }}>
                No matching countries
              </div>
            )}
          </Dropdown>
        </section>

        {/* ── Single-select ────────────────────────── */}
        <section>
          <h3>Single-select</h3>
          <button ref={singleRef} style={btnStyle} onClick={() => setSingleOpen(!singleOpen)}>
            {singleValue ?? "Choose one..."}
          </button>
          <Dropdown
            open={singleOpen}
            onClose={() => setSingleOpen(false)}
            anchorRef={singleRef}
          >
            {FRUITS.slice(0, 7).map((f) => (
              <SingleSelectOption
                key={f}
                labelText={f}
                description={false}
                checked={singleValue === f}
                onChange={() => {
                  setSingleValue(f);
                  setSingleOpen(false);
                }}
              />
            ))}
          </Dropdown>
        </section>

        {/* ── Navigation ───────────────────────────── */}
        <section>
          <h3>Navigation</h3>
          <button ref={navRef} style={btnStyle} onClick={() => setNavOpen(!navOpen)}>
            Navigate...
          </button>
          <Dropdown
            open={navOpen}
            onClose={() => setNavOpen(false)}
            anchorRef={navRef}
          >
            {PAGES.map((p) => (
              <NavigationSelectOption
                key={p.label}
                labelText={p.label}
                leading={<Icon name={p.icon as IconName} size={20} />}
                onClick={() => setNavOpen(false)}
              />
            ))}
          </Dropdown>
        </section>

        {/* ── Tag multi-select with search ─────────── */}
        <section>
          <h3>Tag multi-select + search</h3>
          <button ref={tagRef} style={btnStyle} onClick={() => setTagOpen(!tagOpen)}>
            {selectedTags.size ? `${selectedTags.size} tags` : "Select tags..."}
          </button>
          <Dropdown
            open={tagOpen}
            onClose={() => setTagOpen(false)}
            anchorRef={tagRef}
            header={
              <SelectOptionHeader
                type="search"
                searchValue={tagSearch}
                searchPlaceholder="Search tags..."
                onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setTagSearch(e.target.value)}
                onSearchClear={() => setTagSearch("")}
              />
            }
            footer={
              <AddItemOption
                multiSelect
                itemText={tagSearch || "New tag"}
                onClick={() => {
                  if (tagSearch) {
                    toggleTag(tagSearch);
                    setTagSearch("");
                  }
                }}
              />
            }
          >
            {filteredTags.map((t) => (
              <TagMultiSelectOption
                key={t}
                labelText={t}
                description={false}
                checked={selectedTags.has(t)}
                onChange={() => toggleTag(t)}
              />
            ))}
          </Dropdown>
        </section>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* ── Generic with groups ──────────────────── */}
        <section>
          <h3>Generic with groups</h3>
          <button ref={genericRef} style={btnStyle} onClick={() => setGenericOpen(!genericOpen)}>
            Options...
          </button>
          <Dropdown
            open={genericOpen}
            onClose={() => setGenericOpen(false)}
            anchorRef={genericRef}
          >
            <OptionSeparator type="group-label" labelText="Actions" />
            <GenericSelectOption labelText="Copy" description={false} onClick={() => setGenericOpen(false)} />
            <GenericSelectOption labelText="Paste" description={false} onClick={() => setGenericOpen(false)} />
            <GenericSelectOption labelText="Duplicate" description={false} onClick={() => setGenericOpen(false)} />
            <OptionSeparator type="divider" />
            <OptionSeparator type="group-label" labelText="Danger zone" />
            <GenericSelectOption labelText="Delete" description={false} onClick={() => setGenericOpen(false)} />
          </Dropdown>
        </section>

        {/* ── Minimal (no header/footer) ───────────── */}
        <section>
          <h3>Minimal (no header/footer)</h3>
          <button ref={minRef} style={btnStyle} onClick={() => setMinOpen(!minOpen)}>
            Quick pick
          </button>
          <Dropdown
            open={minOpen}
            onClose={() => setMinOpen(false)}
            anchorRef={minRef}
            width={200}
          >
            <SingleSelectOption labelText="Small" description={false} onChange={() => setMinOpen(false)} />
            <SingleSelectOption labelText="Medium" description={false} onChange={() => setMinOpen(false)} />
            <SingleSelectOption labelText="Large" description={false} onChange={() => setMinOpen(false)} />
          </Dropdown>
        </section>

        {/* ── Placement: top ───────────────────────── */}
        <section>
          <h3>Placement: top-start</h3>
          <div style={{ marginTop: 120 }}>
            <button ref={topRef} style={btnStyle} onClick={() => setTopOpen(!topOpen)}>
              Opens upward
            </button>
          </div>
          <Dropdown
            open={topOpen}
            onClose={() => setTopOpen(false)}
            anchorRef={topRef}
            placement="top-start"
            width={240}
          >
            <SingleSelectOption labelText="Option A" description={false} onChange={() => setTopOpen(false)} />
            <SingleSelectOption labelText="Option B" description={false} onChange={() => setTopOpen(false)} />
            <SingleSelectOption labelText="Option C" description={false} onChange={() => setTopOpen(false)} />
            <SingleSelectOption labelText="Option D" description={false} onChange={() => setTopOpen(false)} />
          </Dropdown>
        </section>
      </div>

      <section style={{ maxWidth: 560 }}>
        <h3>Nested menus (hover submenus + pointer bridge)</h3>
        <p
          style={{
            fontSize: "var(--type-body-sm-size)",
            color: "var(--text-neutral-secondary)",
            marginBottom: "var(--spacing-md)",
          }}
        >
          The gap bridge fills the space between a row and its submenu panel so diagonal mouse
          movement doesn't prematurely close it. The safety triangle (cyan, when debug is on)
          shows the exact safe zone: cursor inside → close timer cancelled; outside → scheduled.
          Use <kbd>ArrowRight</kbd> to open a submenu by keyboard, <kbd>ArrowLeft</kbd> or{" "}
          <kbd>Escape</kbd> to close it.
        </p>
        <button
          ref={submenuRef}
          style={btnStyle}
          type="button"
          onClick={() => setSubmenuOpen(!submenuOpen)}
        >
          Open nested menu
        </button>
        <Dropdown
          open={submenuOpen}
          onClose={() => setSubmenuOpen(false)}
          anchorRef={submenuRef}
          role="menu"
          width={260}
          maxHeight={440}
          zIndex={9999}
          panelKeyboardNav
          keyboardWrap
          debugSubmenuBridge={NESTED_MENU_BRIDGE_DEBUG}
        >
          <GenericSelectOption
            labelText="Root: Cut"
            description={false}
            onClick={() => setSubmenuOpen(false)}
          />
          <GenericSelectOption
            labelText="Root: Copy"
            description={false}
            onClick={() => setSubmenuOpen(false)}
          />
          <GenericSelectOption
            labelText="Root: Paste"
            description={false}
            onClick={() => setSubmenuOpen(false)}
          />
          <HoverSubmenu
            labelText="Level 1 → (mid root)"
            leading={<Icon name="folder" size={20} />}
          >
            <GenericSelectOption
              labelText="L1: Rename"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
            <GenericSelectOption
              labelText="L1: Duplicate"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
            <GenericSelectOption
              labelText="L1: Move…"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
            <HoverSubmenu
              labelText="Level 2 → (mid L1)"
              leading={<Icon name="create_new_folder" size={20} />}
            >
              <GenericSelectOption
                labelText="L2: Export JSON"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
              <GenericSelectOption
                labelText="L2: Export CSV"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
              <GenericSelectOption
                labelText="L2: Print"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
              <HoverSubmenu
                labelText="Level 3 → (mid L2)"
                leading={<Icon name="stacked_bar_chart" size={20} />}
              >
                <GenericSelectOption
                  labelText="L3: Full page"
                  description={false}
                  onClick={() => setSubmenuOpen(false)}
                />
                <GenericSelectOption
                  labelText="L3: Selection only"
                  description={false}
                  onClick={() => setSubmenuOpen(false)}
                />
                <GenericSelectOption
                  labelText="L3: To PDF"
                  description={false}
                  onClick={() => setSubmenuOpen(false)}
                />
                <GenericSelectOption
                  labelText="L3: To PNG"
                  description={false}
                  onClick={() => setSubmenuOpen(false)}
                />
              </HoverSubmenu>
              <GenericSelectOption
                labelText="L2: Share link"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
              <GenericSelectOption
                labelText="L2: Embed code"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
            </HoverSubmenu>
            <GenericSelectOption
              labelText="L1: Archive"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
            <GenericSelectOption
              labelText="L1: Delete"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
          </HoverSubmenu>
          <HoverSubmenu
            labelText="Level 1 → (near bottom)"
            leading={<Icon name="folder" size={20} />}
          >
            <GenericSelectOption
              labelText="L1b: Option A"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
            <GenericSelectOption
              labelText="L1b: Option B"
              description={false}
              onClick={() => setSubmenuOpen(false)}
            />
            <HoverSubmenu
              labelText="L1b: Level 2 →"
              leading={<Icon name="create_new_folder" size={20} />}
            >
              <GenericSelectOption
                labelText="L1b→L2: Deep item 1"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
              <GenericSelectOption
                labelText="L1b→L2: Deep item 2"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
              <GenericSelectOption
                labelText="L1b→L2: Deep item 3"
                description={false}
                onClick={() => setSubmenuOpen(false)}
              />
            </HoverSubmenu>
          </HoverSubmenu>
          <GenericSelectOption
            labelText="Root: Select all"
            description={false}
            onClick={() => setSubmenuOpen(false)}
          />
          <GenericSelectOption
            labelText="Root: Preferences…"
            description={false}
            onClick={() => setSubmenuOpen(false)}
          />
        </Dropdown>
      </section>
    </div>
  );
}
