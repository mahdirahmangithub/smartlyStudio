import {
  OptionItemLeading,
  ThumbnailBox,
} from "../components/OptionItemLeading";
import { CurrencyThumbnail } from "../components/CurrencyThumbnail";
import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { IconButton } from "../components/IconButton";
import { Button } from "../components/Button";
import { RowContainer } from "../components/RowContainer";


const SAMPLE_IMG = "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=80&h=80&fit=crop";

export default function OptionItemLeadingPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>OptionItemLeading</h2>

      {/* ── enabled vs disabled ────────────────────────────────────────── */}
      {([false, true] as const).map((disabled) => (
        <section key={String(disabled)}>
          <h3 style={{ marginBottom: 16 }}>
            {disabled ? "Disabled" : "Enabled"}
          </h3>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {/* icon */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="icon" disabled={disabled}>
                <Icon name="favorite" size={20} />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>icon</p>
            </div>

            {/* counter (flag) */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="counter" disabled={disabled}>
                <Icon name="canada" size={24} />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>counter</p>
            </div>

            {/* social */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="social" disabled={disabled}>
                <Icon name="favorite" size={20} />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>social</p>
            </div>

            {/* currency */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="currency" disabled={disabled}>
                <CurrencyThumbnail size="md" currency="eur" />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>currency</p>
            </div>

            {/* thumbnail */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="thumbnail" disabled={disabled}>
                <ThumbnailBox src={SAMPLE_IMG} alt="sample" />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>thumbnail</p>
            </div>

            {/* avatar */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="avatar" disabled={disabled}>
                <Avatar size="xs" src={SAMPLE_IMG} alt="User" status />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>avatar</p>
            </div>

            {/* 1-action */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="1-action" disabled={disabled}>
                <IconButton
                  size="sm"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="favorite_fill" size={16} />}
                  aria-label="Favorite"
                  disabled={disabled}
                />
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>1-action</p>
            </div>

            {/* button */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="button" disabled={disabled}>
                <Button size="sm" variant="neutral" emphasis="medium" disabled={disabled}>
                  Label
                </Button>
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>button</p>
            </div>

            {/* 2-action */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="2-action" disabled={disabled}>
                <RowContainer density="none">
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                </RowContainer>
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>2-action</p>
            </div>

            {/* 3-action */}
            <div style={{ textAlign: "center" }}>
              <OptionItemLeading type="3-action" disabled={disabled}>
                <RowContainer density="none">
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                  <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" disabled={disabled} />
                </RowContainer>
              </OptionItemLeading>
              <p style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", marginTop: 4 }}>3-action</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
