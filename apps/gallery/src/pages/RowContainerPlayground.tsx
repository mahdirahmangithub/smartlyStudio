import { RowContainer, type RowContainerAlignment, type RowContainerDensity } from "@sds/components/RowContainer";
import { Tag } from "@sds/components/Tag";
import { Chip } from "@sds/components/Chip";
import { Icon } from "@sds/components/Icon";

const DENSITIES: RowContainerDensity[] = ["none", "xs", "sm", "md", "lg"];
const ALIGNMENTS: RowContainerAlignment[] = ["left", "right", "grow"];

function SlotBox({ label }: { label?: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 24,
        borderRadius: 4,
        border: "1px dashed var(--element-outline-alert-active)",
        background: "var(--element-fill-alert-tertiary-active-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        color: "var(--text-neutral-secondary-default)",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

export default function RowContainerPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>RowContainer</h2>

      {/* ── density × alignment (non-wrap, scrollable) ────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Density × Alignment (scrollable, non-wrap)</h3>
        {ALIGNMENTS.map((align) => (
          <div key={align} style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-neutral-secondary-default)",
                marginBottom: 8,
                textTransform: "capitalize",
              }}
            >
              alignment: {align}
            </p>
            {DENSITIES.map((density) => (
              <div
                key={density}
                style={{
                  marginBottom: 12,
                  maxWidth: 320,
                  border: "1px solid var(--element-outline-neutral-subtle-default)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-neutral-tertiary-default)",
                    padding: "4px 8px",
                  }}
                >
                  density: {density}
                </p>
                <RowContainer alignment={align} density={density}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SlotBox key={i} label={`${i + 1}`} />
                  ))}
                </RowContainer>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* ── wrap mode ─────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Wrap Mode</h3>
        {ALIGNMENTS.map((align) => (
          <div key={align} style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-neutral-secondary-default)",
                marginBottom: 8,
                textTransform: "capitalize",
              }}
            >
              alignment: {align}
            </p>
            {(["sm", "md"] as RowContainerDensity[]).map((density) => (
              <div
                key={density}
                style={{
                  marginBottom: 12,
                  maxWidth: 320,
                  border: "1px solid var(--element-outline-neutral-subtle-default)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-neutral-tertiary-default)",
                    padding: "4px 8px",
                  }}
                >
                  density: {density}, wrap
                </p>
                <RowContainer alignment={align} density={density} wrap>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SlotBox key={i} label={`${i + 1}`} />
                  ))}
                </RowContainer>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* ── insets & padding ──────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Insets & Padding (configurable spacing tokens)</h3>
        {(["sm", "md", "lg", "xl"] as const).map((size) => (
          <div
            key={size}
            style={{
              marginBottom: 12,
              maxWidth: 320,
              border: "1px solid var(--element-outline-neutral-subtle-default)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "var(--text-neutral-tertiary-default)",
                padding: "4px 8px",
              }}
            >
              inset/padding: {size}
            </p>
            <RowContainer
              density="sm"
              insetLeft={size}
              insetRight={size}
              paddingTop={size}
              paddingBottom={size}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <SlotBox key={i} label={`${i + 1}`} />
              ))}
            </RowContainer>
          </div>
        ))}
      </section>

      {/* ── real-world: tags in a row ─────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Real-World: Tags (scrollable)</h3>
        <div
          style={{
            maxWidth: 300,
            border: "1px solid var(--element-outline-neutral-subtle-default)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <RowContainer density="xs" insetLeft="md" insetRight="md" paddingTop="sm" paddingBottom="sm">
            {["Design", "Engineering", "Product", "Marketing", "Sales", "Support", "Finance"].map(
              (label) => (
                <Tag key={label} size="md" variant="neutral" emphasis="low" label={label} />
              )
            )}
          </RowContainer>
        </div>
      </section>

      {/* ── real-world: chips wrapped ─────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Real-World: Chips (wrap)</h3>
        <div
          style={{
            maxWidth: 360,
            border: "1px solid var(--element-outline-neutral-subtle-default)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <RowContainer density="sm" wrap insetLeft="md" insetRight="md" paddingTop="sm" paddingBottom="sm">
            {["React", "TypeScript", "CSS Modules", "Figma", "Storybook", "Vite", "ESLint", "Prettier"].map(
              (label) => (
                <Chip
                  key={label}
                  size="md"
                  leadingIcon={<Icon name="favorite" size={14} />}
                >
                  {label}
                </Chip>
              )
            )}
          </RowContainer>
        </div>
      </section>
    </div>
  );
}
