import { useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Fieldset, FieldGroup } from "@sds/components/Fieldset";
import { SelectInput } from "@sds/components/SelectInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { RadioField } from "@sds/components/Radio";
import { Button } from "@sds/components/Button";
import { AiGeneration } from "@sds/components/AiGeneration";
import { AD_ACCOUNTS, type AdAccount } from "../../shared/data/adAccounts";
import { OBJECTIVES, type Objective } from "./constants";

interface SelectFieldProps<T extends { id: string; label: string }> {
  label: string;
  options: T[];
  value: T | null;
  onChange: (item: T) => void;
  placeholder?: string;
}

function SelectField<T extends { id: string; label: string }>({
  label,
  options,
  value,
  onChange,
  placeholder,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      query
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  );

  const displayValue = open ? query : value?.label ?? "";

  return (
    <Fieldset label={label} labelSize="sm">
      <SelectInput
        ref={inputRef}
        size="lg"
        value={displayValue}
        placeholder={placeholder ?? "Select…"}
        expanded={open}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onClick={() => {
          if (!open) setOpen(true);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Escape" && open) {
            setOpen(false);
            setQuery("");
          }
        }}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
      >
        {filtered.map((o) => (
          <SingleSelectOption
            key={o.id}
            labelText={o.label}
            description={false}
            checked={value?.id === o.id}
            onChange={() => {
              onChange(o);
              setQuery("");
              setOpen(false);
            }}
          />
        ))}
      </SelectInput>
    </Fieldset>
  );
}

type CampaignStatus = "active" | "paused";

interface CampaignCreationFormProps {
  onSubmit?: (data: {
    adAccount: AdAccount;
    objective: Objective;
    status: CampaignStatus;
  }) => void;
}

export function CampaignCreationForm({ onSubmit }: CampaignCreationFormProps) {
  const [adAccount, setAdAccount] = useState<AdAccount | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [status, setStatus] = useState<CampaignStatus>("active");
  const canSubmit = adAccount !== null && objective !== null;

  return (
    <AiGeneration
      title="Create a Campaign"
      aria-label="Create a Campaign"
      style={{ maxWidth: 520 }}
    >
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--spacing-xl)" }}>
        <SelectField<AdAccount>
          label="Select Ad account"
          options={AD_ACCOUNTS}
          value={adAccount}
          onChange={setAdAccount}
          placeholder="Search ad accounts…"
        />
        <SelectField<Objective>
          label="Select Objective"
          options={OBJECTIVES}
          value={objective}
          onChange={setObjective}
          placeholder="Search objectives…"
        />
        <FieldGroup label="Campaign status" labelSize="sm" role="radiogroup">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <RadioField
              name="campaign-status"
              value="active"
              label="Active"
              checked={status === "active"}
              onChange={() => setStatus("active")}
            />
            <RadioField
              name="campaign-status"
              value="paused"
              label="Paused"
              checked={status === "paused"}
              onChange={() => setStatus("paused")}
            />
          </div>
        </FieldGroup>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="md"
            variant="neutral"
            emphasis="high"
            disabled={!canSubmit}
            onClick={() => {
              if (canSubmit) onSubmit?.({ adAccount: adAccount!, objective: objective!, status });
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </AiGeneration>
  );
}
