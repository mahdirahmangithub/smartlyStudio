# Chart Accessibility — Audit & Implementation Plan

## 1. Current State Audit

### ChartContainer (shared infrastructure)

| Area | Status | Details |
|------|--------|---------|
| SVG role | `role="img"` | Generic image role; no `graphics-document` or structured content |
| aria-label | `"Chart"` (default) | Configurable via `ariaLabel` prop |
| `<title>` / `<desc>` | Missing | No SVG-native text alternatives |
| Keyboard nav | None | `HoverOverlay` is pointer-only (`onMouseMove`, `onTouchMove`); no `tabIndex`, no `onKeyDown` |
| Tooltip | Pointer-driven only | Uses `Tooltip` with `role="tooltip"` and `anchor="cursor"`, but `tooltipData` only updates from pointer events — keyboard users get nothing |
| Decorative elements | Not hidden | Grid lines, axes, crosshair all exposed to AT without `aria-hidden` |
| Data table | None | No visually-hidden or toggleable table alternative |
| Reduced motion | Not respected | Animations play regardless of `prefers-reduced-motion` |

### LineChart

- Uses `ChartContainer` with **hardcoded** `ariaLabel="Line chart"`.
- `LineChartProps` **omits** `ariaLabel` — consumers cannot override the accessible name.
- `AnimatedLine` / `ConfidenceBand` — SVG paths with no ARIA.

### BarChart

- Own `<svg>` with **hardcoded** `role="img"` and `aria-label="Bar chart"`. No `ariaLabel` prop.
- Hover overlay: mouse only — **no touch handlers** (unlike `ChartContainer`).
- Bar `<path>` elements have no labels or roles.

### ComboChart

- Same as BarChart: `role="img"`, `aria-label="Combo chart"`, no customizable label.
- Overlay rect: mouse only (no touch).
- Crosshair dots: decorative HTML `div`s, no ARIA.

### ChartLegend (positive)

- `role="list"` wrapper with `aria-label="Chart legend"`.
- Each item is a `<button>` with `aria-pressed` for series toggle.
- Keyboard-accessible (native buttons).
- Note: `role="toolbar"` may be a better fit than `role="list"`.

### ChartZoom (positive)

- Buttons have `aria-label` ("Zoom in", "Zoom out", "Reset zoom").
- Native `<button>` elements — accessible.

### ChartBrush

- Mouse-only range selection. No ARIA, no keyboard.

---

## 2. Industry Best Practices

### Recharts

- **`accessibilityLayer` prop** (default `true` in v3) adds ARIA roles + keyboard controls.
- **`role="application"`** on the SVG container — tells JAWS/NVDA to enter "Forms Mode" automatically so arrow keys pass through to the chart's `keydown` listeners.
- **Single tab stop** — users `Tab` to the chart, then **arrow keys** move between data points. Avoids forcing users to tab through every data point.
- **Tooltip follows keyboard focus** — pressing Left/Right updates the tooltip and VoiceOver reads it aloud.
- **VoiceOver caveat** — users must manually disable QuickNav (Left+Right arrow simultaneously). No programmatic workaround exists.

### MUI X Charts

- **`enableKeyboardNavigation` prop** — adds `tabIndex` to the SVG, renders dedicated focus highlight components (`FocusedBar`, `FocusedLineMark`, etc.).
- **Arrow keys**: Left/Right move within a series, Up/Down move between series.
- **`aria-activedescendant`** — SVG keeps DOM focus but points AT at a child element with an `id` and `aria-label`.
- **Focus highlight synced with axis highlight** — visual crosshair/highlight updates on keyboard nav too.
- **`prefers-reduced-motion`** — animations disabled by default when this media query matches.
- **Targets WCAG 2.1 Level AA** conformance.

### Ant Design Charts

- No documented accessibility features. Limited AT support.
- Not a reference for this work.

### W3C / WAI-ARIA Best Practices

- **Hidden data table** — pair the SVG chart with a visually-hidden HTML `<table>` containing the same data. Gold standard for screen reader access.
- **Disclosure pattern** — optional "View as table" toggle that shows/hides the table (benefits all users).
- **`<title>` + `<desc>` inside SVG** — brief title + longer trend description.
- **`aria-hidden="true"`** on decorative elements (grid, axes, crosshair).
- **`aria-live="polite"` region** — a hidden `<div>` that updates with the focused data point's values. Screen readers auto-announce changes.
- **`role="graphics-document"`** — richer than `role="img"` when the SVG has structured content.

---

## 3. Implementation Plan

### Phase 1 — Foundation (quick wins, biggest screen reader impact)

| Task | Component(s) | Effort |
|------|-------------|--------|
| Expose `ariaLabel` prop on all charts | `BarChart`, `ComboChart`, `LineChart` | Small |
| Add `<title>` + `<desc>` inside each chart SVG | `ChartContainer`, `BarChart`, `ComboChart` | Small |
| Add `aria-hidden="true"` to decorative elements | `ChartGrid`, `ChartAxes` ticks, `Crosshair` | Small |
| Respect `prefers-reduced-motion` | `AnimatedLine`, `BarChart` transitions | Small |
| Add touch handlers to BarChart/ComboChart overlays | `BarChart`, `ComboChart` | Small |

### Phase 2 — Keyboard Navigation (biggest interaction win)

| Task | Component(s) | Effort |
|------|-------------|--------|
| Single tab stop: `tabIndex={0}` + `role="application"` on SVG | `ChartContainer`, `BarChart`, `ComboChart` | Medium |
| Track `focusedIndex` + `focusedSeriesIndex` state | New shared state in `ChartContainer` or context | Medium |
| Arrow key handler (Left/Right = within series, Up/Down = between series, Home/End = first/last, Escape = blur) | `ChartContainer` / shared hook | Medium |
| Focus highlight element — visible ring/dot/bar that follows focused data point | New `FocusedMark` / `FocusedBar` components | Medium |
| `aria-activedescendant` — point AT at the focused element's `id` | SVG + data point elements | Medium |
| Show tooltip on keyboard focus (same content as hover tooltip) | `ChartContainer` tooltip integration | Medium |

### Phase 3 — Screen Reader Data Access

| Task | Component(s) | Effort |
|------|-------------|--------|
| `aria-live="polite"` hidden region — announces focused data point values as text | New `ChartAnnouncer` component | Small |
| Hidden `sr-only` data table rendered alongside each chart | New `ChartDataTable` component | Medium |
| Optional "View as table" disclosure toggle | `ChartDataTable` + button | Small |

### Phase 4 — Polish & Parity

| Task | Component(s) | Effort |
|------|-------------|--------|
| Brush keyboard support (arrow keys to adjust range) | `ChartBrush` | Medium |
| Legend: switch from `role="list"` to `role="toolbar"` pattern | `ChartLegend` | Small |
| Consistent focus-visible styles across zoom buttons, legend, chart | CSS | Small |
| VoiceOver documentation / guidance for QuickNav | Docs / README | Small |

---

## 4. Priority & Sequencing

```
Phase 1 ──────── can start immediately, no dependencies
Phase 2 ──────── start after Phase 1; core keyboard model
Phase 3 ──────── can run in parallel with Phase 2 (independent)
Phase 4 ──────── after Phase 2 (brush depends on keyboard model)
```

**Phase 1 + Phase 3 (hidden data table)** together give the fastest path to screen reader usability — even without keyboard navigation, AT users can read all chart data via the table.

**Phase 2** is the biggest single effort but transforms charts from pointer-only to fully keyboard-operable.

---

## 5. Key Architecture Decisions (to resolve before implementation)

1. **`role="application"` vs `role="img"`** — `role="application"` enables Forms Mode in JAWS/NVDA (arrow keys work), but tells AT "I handle everything" which suppresses normal browse-mode navigation. Recharts uses it; MUI uses `tabIndex` + `aria-activedescendant` without `role="application"`. Need to decide which model to follow.

2. **Focus state ownership** — should `focusedIndex` / `focusedSeriesIndex` live in `ChartContainer` (shared) or in each chart type? Shared is cleaner but requires a generic data model. Each chart type having its own is more flexible but duplicates logic.

3. **Hidden table data source** — charts currently receive data as props in varying shapes (`series[]`, `categories[]`, etc.). The `ChartDataTable` component needs a normalized data interface. Options:
   - Each chart type maps its props to a common `{ headers, rows }` shape
   - A shared `useChartTableData` hook that each chart feeds into

4. **Announcement text format** — what should the `aria-live` region say? Example candidates:
   - `"January: Revenue $45,000, Cost $32,000"`
   - `"Point 3 of 12. January. Series 1, Revenue: $45,000. Series 2, Cost: $32,000."`
   - Configurable via a `formatAnnouncement` callback prop?

---

## 6. References

- [Recharts Accessibility Wiki](https://github.com/recharts/recharts/wiki/Recharts-and-accessibility)
- [MUI X Charts Accessibility Docs](https://mui.com/x/react-charts/accessibility/)
- [WAI-ARIA Authoring Practices — Disclosure for Image Description](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-image-description/)
- [Accessible SVG Line Graphs — Léonie Watson (Tink)](https://tink.uk/accessible-svg-line-graphs/)
- [Accessible Charts Done Right — Sergei Kriger](https://sergeikriger.com/slides/accessible-charts-done-right/)
- [Creating Accessible SVG Charts — accessibility-test.org](https://accessibility-test.org/blog/compliance/creating-accessible-svg-charts-and-infographics/)
