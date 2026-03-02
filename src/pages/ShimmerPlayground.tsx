import { useState } from "react";
import { Fieldset } from "../components/Fieldset";
import { Input } from "../components/Input";
import { Toggle } from "../components/Toggle";
import { useShimmer } from "../components/Shimmer";
import { BodyText } from "../components/BodyText";

const sectionStyle = { marginBottom: 40 } as const;
const cardStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

export default function ShimmerPlayground() {
  const [loading, setLoading] = useState(true);
  const [inverse, setInverse] = useState(false);
  const shimmer = useShimmer(loading, inverse);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      <h2 style={{ margin: 0 }}>AI Loading Shimmer</h2>

      {/* ── Toggle ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Toggle
            checked={loading}
            onChange={setLoading}
            size="sm"
          />
          <span style={{ fontSize: 14 }}>
            Shimmer {loading ? "enabled" : "disabled"}
          </span>

          <Toggle
            checked={inverse}
            onChange={setInverse}
            size="sm"
          />
          <span style={{ fontSize: 14 }}>
            {inverse ? "Inverse" : "Normal"}
          </span>
        </div>

        {/* ── BodyText demo ─────────────────────────────── */}
        <div style={cardStyle}>
          <div className={shimmer} style={{ width: "fit-content" }}>
            <BodyText size="md">AI Loading content</BodyText>
          </div>
        </div>

        {/* ── Fieldset + Input demo ──────────────────────── */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Fieldset + filled Input</h3>
          <div className={shimmer}>
            <Fieldset
              label="Prompt"
              message="AI is processing your request…"
              messageType="neutral"
            >
              <Input
                size="lg"
                value="Summarize the last meeting notes…"
                readOnly
              />
            </Fieldset>
          </div>
        </div>
      </section>

      {/* ── More examples ──────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Individual elements</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 13,
                  margin: "0 0 8px",
                  opacity: 0.6,
                }}
              >
                Shimmer on a text block
              </p>
              <div className={shimmer}>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  The quarterly revenue report shows a 12% increase compared
                  to the previous period, driven primarily by expansion in the
                  enterprise segment.
                </p>
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: 13,
                  margin: "0 0 8px",
                  opacity: 0.6,
                }}
              >
                Shimmer on a standalone Input
              </p>
              <div className={shimmer}>
                <Input
                  size="md"
                  value="Generating summary…"
                  readOnly
                />
              </div>
            </div>

            <div>
              <p
                style={{
                  fontSize: 13,
                  margin: "0 0 8px",
                  opacity: 0.6,
                }}
              >
                Shimmer on an inline span
              </p>
              <p style={{ margin: 0 }}>
                Status:{" "}
                <span
                  className={shimmer}
                  style={{ display: "inline-block" }}
                >
                  thinking…
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
