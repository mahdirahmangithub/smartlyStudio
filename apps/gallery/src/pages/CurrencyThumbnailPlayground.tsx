import {
  CurrencyThumbnail,
  type CurrencyThumbnailSize,
  type CurrencyType,
} from "@sds/components/CurrencyThumbnail";

const SIZES: CurrencyThumbnailSize[] = ["sm", "md", "lg"];
const CURRENCIES: CurrencyType[] = ["eur", "usd", "gbp", "yen"];

const captionStyle = {
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
} as const;

const sectionStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

export default function CurrencyThumbnailPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>CurrencyThumbnail</h2>

      <section>
        <h3 style={{ margin: "0 0 12px" }}>Sizes &times; Currencies</h3>
        <div style={sectionStyle}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th />
                {CURRENCIES.map((c) => (
                  <th
                    key={c}
                    style={{
                      ...captionStyle,
                      padding: "0 16px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s}>
                  <td
                    style={{
                      ...captionStyle,
                      paddingRight: 16,
                      textAlign: "right",
                    }}
                  >
                    {s}
                  </td>
                  {CURRENCIES.map((c) => (
                    <td key={c} style={{ padding: 8, textAlign: "center" }}>
                      <CurrencyThumbnail size={s} currency={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
