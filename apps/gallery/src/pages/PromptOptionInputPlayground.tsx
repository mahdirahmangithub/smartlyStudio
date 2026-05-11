import { useState, type CSSProperties } from "react";
import {
  PromptOptionInput,
  usePromptOptionInput,
} from "@sds/components/PromptOptionInput";
import {
  PromptInputInfo,
  type PromptInputInfoType,
} from "@sds/components/PromptInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { MultiSelectOption } from "@sds/components/MultiSelectOption";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const promptWrapper: CSSProperties = {
  maxWidth: 444,
  width: "100%",
  margin: "80px auto",
};

// ── Context-aware option wrappers ─────────────────────────────────────────────

// Wrappers must spread `...rest` so the combobox props PromptOptionInput
// injects via cloneElement (`unmanagedFocus`, `isActive`, `optionId`) reach
// the underlying select option. Without this, arrow keys in the search input
// don't visibly highlight matching rows.
function ContextSingleOption({
  label,
  checked,
  onChange,
  ...rest
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
} & Partial<React.ComponentProps<typeof SingleSelectOption>>) {
  const { optionsDisabled } = usePromptOptionInput();
  return (
    <SingleSelectOption
      {...rest}
      labelText={label}
      checked={checked}
      disabled={optionsDisabled}
      description={false}
      onChange={onChange}
    />
  );
}

function ContextMultiOption({
  label,
  checked,
  onChange,
  ...rest
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
} & Partial<React.ComponentProps<typeof MultiSelectOption>>) {
  const { optionsDisabled } = usePromptOptionInput();
  return (
    <MultiSelectOption
      {...rest}
      labelText={label}
      checked={checked}
      disabled={optionsDisabled}
      description={false}
      onChange={onChange}
    />
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TONES = [
  "Professional",
  "Friendly",
  "Casual",
  "Formal",
  "Empathetic",
  "Direct",
  "Humorous",
  "Inspirational",
];

const FORMATS = [
  "Bullet points",
  "Numbered list",
  "Short paragraph",
  "Long paragraph",
  "Table",
  "Outline",
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Portuguese"];

// ── Demo 1: Single step, single-select, search + custom input ─────────────────

function SingleStepDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const reset = () => {
    setDismissed(false);
    setSelected(null);
    setSearch("");
    setCustomValue("");
  };

  if (dismissed) {
    return (
      <button onClick={reset} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Reset
      </button>
    );
  }

  const filtered = TONES.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PromptOptionInput
      label="Choose a tone"
      onClose={() => setDismissed(true)}
      search={{ value: search, onChange: setSearch }}
      input={{ value: customValue, onChange: setCustomValue, placeholder: "Or describe your own tone..." }}
      hasValue={selected !== null}
      isLastStep
      onSkip={() => setDismissed(true)}
      onSubmit={() => alert(`Submitted: ${customValue || selected}`)}
    >
      {filtered.map((tone) => (
        <ContextSingleOption
          key={tone}
          label={tone}
          checked={selected === tone}
          onChange={() => setSelected(selected === tone ? null : tone)}
        />
      ))}
    </PromptOptionInput>
  );
}

// ── Demo 2: Multi-step, multi-select ─────────────────────────────────────────

function MultiStepDemo() {
  const [step, setStep] = useState(1);
  const [selectedTones, setSelectedTones] = useState<Set<string>>(new Set());
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [customValue, setCustomValue] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setDone(false);
    setStep(1);
    setSelectedTones(new Set());
    setSelectedFormats(new Set());
    setCustomValue("");
  };

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13 }}>
          <strong>Tones:</strong> {[...selectedTones].join(", ") || "—"}
        </p>
        <p style={{ margin: 0, fontSize: 13 }}>
          <strong>Format:</strong> {[...selectedFormats].join(", ") || "—"}
          {customValue ? ` / Custom: ${customValue}` : ""}
        </p>
        <button onClick={reset} style={{ marginTop: 8, padding: "8px 16px", cursor: "pointer", alignSelf: "flex-start" }}>
          Reset
        </button>
      </div>
    );
  }

  const isLastStep = step === 2;
  const hasValue = step === 1 ? selectedTones.size > 0 : selectedFormats.size > 0;

  const toggleTone = (t: string) =>
    setSelectedTones((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const toggleFormat = (f: string) =>
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });

  return (
    <PromptOptionInput
      label={step === 1 ? "Select tone(s)" : "Select format"}
      steps={{
        current: step,
        total: 2,
        onPrev: () => setStep((s) => Math.max(1, s - 1)),
        onNext: () => setStep((s) => Math.min(2, s + 1)),
      }}
      input={isLastStep ? { value: customValue, onChange: setCustomValue, placeholder: "Or describe a custom format..." } : undefined}
      hasValue={hasValue}
      isLastStep={isLastStep}
      onSkip={() => (isLastStep ? setDone(true) : setStep(2))}
      onSubmit={() => (isLastStep ? setDone(true) : setStep(2))}
    >
      {step === 1
        ? TONES.map((tone) => (
            <ContextMultiOption
              key={tone}
              label={tone}
              checked={selectedTones.has(tone)}
              onChange={() => toggleTone(tone)}
            />
          ))
        : FORMATS.map((fmt) => (
            <ContextMultiOption
              key={fmt}
              label={fmt}
              checked={selectedFormats.has(fmt)}
              onChange={() => toggleFormat(fmt)}
            />
          ))}
    </PromptOptionInput>
  );
}

// ── Demo 3: No search, no input ───────────────────────────────────────────────

function MinimalDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PromptOptionInput
      label="Pick a language"
      hasValue={selected !== null}
      isLastStep
      onSkip={() => setSelected(null)}
      onSubmit={() => alert(`Selected: ${selected}`)}
    >
      {LANGUAGES.map((lang) => (
        <ContextSingleOption
          key={lang}
          label={lang}
          checked={selected === lang}
          onChange={() => setSelected(selected === lang ? null : lang)}
        />
      ))}
    </PromptOptionInput>
  );
}

// ── Demo 4: Info banner above the picker ─────────────────────────────────────

const INFO_TYPES: PromptInputInfoType[] = ["edit", "error", "warning", "length-limit", "cook-book"];

const INFO_DEFAULTS: Record<PromptInputInfoType, { title?: string }> = {
  edit: { title: "Editing message" },
  error: { title: "Something went wrong" },
  warning: { title: "Approaching limit" },
  "length-limit": {},
  "cook-book": { title: "Use a template" },
};

function InfoBannerDemo() {
  const [type, setType] = useState<PromptInputInfoType>("edit");
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Show banner
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ opacity: 0.6 }}>Type:</span>
          {INFO_TYPES.map((t) => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" }}>
              <input
                type="radio"
                name="poi-info-type"
                value={t}
                checked={type === t}
                onChange={() => { setType(t); setVisible(true); }}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div style={promptWrapper}>
        <PromptOptionInput
          label="Pick a tone"
          info={visible ? (
            <PromptInputInfo
              type={type}
              title={INFO_DEFAULTS[type].title}
              onClose={() => setVisible(false)}
              onAction={() => setVisible(false)}
            />
          ) : undefined}
          hasValue={selected !== null}
          isLastStep
          onSkip={() => setSelected(null)}
          onSubmit={() => alert(`Selected: ${selected}`)}
        >
          {TONES.slice(0, 5).map((tone) => (
            <ContextSingleOption
              key={tone}
              label={tone}
              checked={selected === tone}
              onChange={() => setSelected(selected === tone ? null : tone)}
            />
          ))}
        </PromptOptionInput>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PromptOptionInputPlayground() {
  return (
    <div>
      <section style={sectionStyle}>
        <div style={promptWrapper}>
          <SingleStepDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={promptWrapper}>
          <MultiStepDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={promptWrapper}>
          <MinimalDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Info banner</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Same <code>{"<PromptInputInfo>"}</code> used above <code>{"<PromptInput>"}</code> —
          same five types (<code>edit</code> / <code>error</code> /{" "}
          <code>warning</code> / <code>length-limit</code> / <code>cook-book</code>),
          same placement. Pass via the new <code>info</code> prop.
        </p>
        <InfoBannerDemo />
      </section>
    </div>
  );
}
