import { OptionItemTrailing } from "@sds/components/OptionItemTrailing";
import { Toggle } from "@sds/components/Toggle";
import { Icon } from "@sds/components/Icon";
import { IconButton } from "@sds/components/IconButton";
import { Button } from "@sds/components/Button";
import { RowContainer } from "@sds/components/RowContainer";
import { KeyboardShortcut } from "@sds/components/KeyboardShortcut";

export default function OptionItemTrailingPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>OptionItemTrailing</h2>

      {([false, true] as const).map((disabled) => (
        <section key={String(disabled)}>
          <h3 style={{ marginBottom: 16 }}>
            {disabled ? "Disabled" : "Enabled"}
          </h3>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            {/* helper-text */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="helper-text" disabled={disabled} />
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>helper-text</p>
            </div>

            {/* helper-text without icon */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="helper-text" helperIcon={false} disabled={disabled} />
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>helper (no icon)</p>
            </div>

            {/* toggle */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="toggle" disabled={disabled}>
                <Toggle size="sm" disabled={disabled} />
              </OptionItemTrailing>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>toggle</p>
            </div>

            {/* 1-action */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="1-action" disabled={disabled}>
                <IconButton
                  size="sm"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="favorite_fill" size={16} />}
                  aria-label="Favorite"
                  disabled={disabled}
                />
              </OptionItemTrailing>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>1-action</p>
            </div>

            {/* 2-action */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="2-action" disabled={disabled}>
                <RowContainer density="none">
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                </RowContainer>
              </OptionItemTrailing>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>2-action</p>
            </div>

            {/* 3-action */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="3-action" disabled={disabled}>
                <RowContainer density="none">
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                </RowContainer>
              </OptionItemTrailing>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>3-action</p>
            </div>

            {/* button */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="button" disabled={disabled}>
                <Button size="sm" variant="neutral" emphasis="medium" disabled={disabled}>
                  Label
                </Button>
              </OptionItemTrailing>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>button</p>
            </div>

            {/* shortcut */}
            <div style={{ textAlign: "center" }}>
              <OptionItemTrailing type="shortcut" disabled={disabled}>
                <RowContainer density="xs">
                  <KeyboardShortcut keyText="⌘" size="lg" />
                </RowContainer>
              </OptionItemTrailing>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>shortcut</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
