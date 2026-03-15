---
name: sds-conventions
description: Enforces Smartly Design System (SDS) conventions when building components, styling, using tokens, and writing playground demos. Use when creating new components, editing existing ones, writing CSS, using design tokens, building playgrounds, or implementing any UI feature in this project.
---

# SDS Implementation Conventions

## Token System — Zero Hardcoded Values

Every visual value must come from a design token CSS custom property. Never use raw px, hex, rgb, or numeric values for:

| Category | Token pattern | Example |
|----------|--------------|---------|
| Spacing | `--spacing-*` | `var(--spacing-md)`, `var(--spacing-px)` for 1px |
| Color | `--element-*`, `--text-*` | `var(--element-fill-neutral-tertiary-default)` |
| Opacity | `--opacity-*` | `var(--opacity-0)`, `var(--opacity-100)` |
| Radius | `--radius-*` | `var(--radius-lg)`, `var(--radius-full)` |
| Animation | `--animation-*` | `var(--animation-state-expand-duration)` |
| Shadow | `--shadow-*` | `var(--shadow-cast-high)` |
| Typography | `--type-*` | `var(--type-title-md-size)` |

If a token doesn't exist for a needed value, ask before using a raw value.

## Component Structure

### File organization

```
src/components/ComponentName/
├── ComponentName.tsx          # Component + types
├── ComponentName.module.css   # Styles (CSS Modules)
└── index.ts                   # Barrel exports
```

### Barrel export pattern

```typescript
export { MyComponent } from "./MyComponent";
export type { MyComponentProps } from "./MyComponent";
```

### Component code patterns

- **CSS Modules** with local `cx()` helper for conditional classes:
  ```typescript
  function cx(...classes: (string | false | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
  }
  ```
- **Controlled + uncontrolled**: support both `value`/`onChange` and `defaultValue` patterns
- **JSDoc** on non-obvious props
- **`className` passthrough** on the root element for external composition
- **Forward refs** with `forwardRef` where external ref access is needed; set `displayName`

### Accessibility and Keyboard Navigation

Every component must be accessible by default. When building or modifying a component, **proactively research** how these design systems handle the same pattern and apply relevant best practices:
- **MUI** (Material UI), **Radix UI**, **Ant Design**, **Carbon Design System** (IBM), **Atlassian Design System**

Cross-reference the WAI-ARIA Authoring Practices (APG) for the relevant widget pattern.

#### Semantic HTML — ALWAYS the right tag

**Before writing any JSX, choose the correct semantic element.** Never default to `<div>` or `<span>` — always ask "what IS this element?" and pick the tag that communicates its purpose to the browser and assistive technology.

| Purpose | Use | NOT |
|---------|-----|-----|
| Clickable action | `<button>` | `<div onClick>` |
| Navigation link | `<a href>` | `<span onClick>` |
| Text input | `<input>` | `<div contentEditable>` (unless rich text) |
| Selection from options | `<select>` / `<input role="combobox">` | `<div>` with click handlers |
| Visual separator | `<hr>` via `Divider` | `<span>` with border |
| Grouped form fields | `<fieldset>` + `<legend>` | `<div>` with heading |
| Navigation region | `<nav>` | `<div>` |
| Main content | `<main>` | `<div>` |
| Section with heading | `<section>` | `<div>` |
| Modal/popup | `<dialog>` | `<div>` with z-index |
| Disclosure/toggle | `<details>` + `<summary>` | `<div>` with state (unless custom animation needed) |
| List of items | `<ul>`/`<ol>` + `<li>` | `<div>` repeated |
| Data display | `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` | `<div>` grid |
| Label for input | `<label>` with `htmlFor` | `<span>` next to input |
| Heading hierarchy | `<h1>`–`<h6>` | `<div>` with font-size |
| Quotation | `<blockquote>`, `<q>` | `<div>` with styling |
| Time value | `<time datetime>` | `<span>` |

If a native element can do the job, use it. Custom ARIA roles are a last resort when no native element fits.

#### ARIA attributes

Apply the correct ARIA for each pattern. Common ones:

| Widget | Key attributes |
|--------|---------------|
| Accordion | `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby` on panel |
| Dialog/Modal | `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Menu/Dropdown | `role="menu"`, `role="menuitem"`, `aria-haspopup`, `aria-expanded` |
| Combobox | `role="combobox"`, `aria-autocomplete`, `aria-activedescendant`, `aria-expanded` |
| Toggle | `aria-pressed` or `aria-checked`, `role="switch"` |
| Tree | `role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-level` |
| Table | `role="grid"` for interactive tables, `aria-sort`, `aria-colindex`, `aria-rowindex` |
| Tooltip | `role="tooltip"`, trigger via `aria-describedby` |
| Live regions | `aria-live="polite"` or `"assertive"`, `aria-atomic` |

Always pair `aria-expanded` with `aria-controls` pointing to the controlled panel's `id`.

#### Keyboard navigation

Every interactive component must be fully keyboard-operable. Apply the standard patterns:

| Widget | Keys |
|--------|------|
| Buttons / toggles | `Enter`, `Space` to activate |
| Accordion | `Enter`/`Space` to toggle; `ArrowUp`/`ArrowDown` between headers; `Home`/`End` for first/last |
| Tabs | `ArrowLeft`/`ArrowRight` (horizontal), `ArrowUp`/`ArrowDown` (vertical); `Home`/`End` |
| Menu / Dropdown | `ArrowUp`/`ArrowDown` to navigate; `Enter`/`Space` to select; `Escape` to close |
| Combobox / Select | `ArrowUp`/`ArrowDown` through options; `Enter` to select; `Escape` to close; type-ahead |
| Dialog / Modal | `Tab`/`Shift+Tab` trapped inside; `Escape` to close; focus restored on close |
| Tree view | `ArrowUp`/`ArrowDown` between items; `ArrowRight` to expand; `ArrowLeft` to collapse/parent |
| Data table (grid) | `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight` cell navigation; `Enter` to activate |
| Slider | `ArrowLeft`/`ArrowRight` (or Up/Down); `Home`/`End` for min/max; `PageUp`/`PageDown` for large steps |

#### Focus management

- `:focus-visible` for keyboard focus styles using design tokens (outline with `--element-outline-brand-active`)
- No visible focus ring on mouse click — only keyboard
- Trap focus inside modals/dialogs
- Restore focus to trigger element when popover/dialog closes
- Use `tabindex="0"` for custom focusable elements; `tabindex="-1"` for programmatically focusable but not in tab order

#### Screen reader considerations

- Provide `aria-label` or `aria-labelledby` for elements without visible text labels
- Use `aria-hidden="true"` on decorative elements (icons next to text, dividers)
- `aria-live` regions for dynamic content updates (toast notifications, loading states)
- `sr-only` class pattern for visually hidden but screen-reader-accessible text

#### Proactive accessibility checklist

When building or reviewing any component, verify:
1. Can it be reached and operated entirely by keyboard?
2. Does it have the correct ARIA role and attributes for its widget pattern?
3. Is focus order logical and visible?
4. Does it work with screen readers (announcements, labels)?
5. Does the disabled state prevent interaction AND convey disabled status (`aria-disabled` or `disabled` attribute)?
6. Are color contrast ratios sufficient (don't rely on color alone)?

#### Screen reader and WCAG review — mandatory after implementation

After completing a component, **perform a dedicated review pass** for screen reader friendliness and WCAG compliance. This is not optional — treat it as a required final step before considering the component done.

**Screen reader review:**
- Navigate the component using only a screen reader (VoiceOver, NVDA, or JAWS mental model). Verify every interactive element is announced with its role, name, and state.
- Ensure `aria-current`, `aria-selected`, `aria-checked`, `aria-expanded` and similar state attributes are present and update dynamically.
- Confirm decorative elements (icons next to text, separators, dividers) are hidden with `aria-hidden="true"`.
- Verify icon-only interactive elements have meaningful `aria-label` (never generic labels like "icon" or "button").
- Check that `aria-live` regions exist for dynamic content changes (toasts, loading states, inline validation errors).
- Ensure `role="list"` is added to `<ol>`/`<ul>` elements styled with `list-style: none` (Safari/VoiceOver strips list semantics otherwise).

**WCAG 2.1 AA compliance checks:**
- **1.3.1 Info and Relationships**: Structure and relationships conveyed visually are also available programmatically (headings, lists, tables, form labels).
- **1.4.3 Contrast (Minimum)**: Text has at least 4.5:1 contrast ratio; large text at least 3:1. Non-text UI components and graphical objects at least 3:1 (WCAG 1.4.11).
- **2.1.1 Keyboard**: All functionality is operable via keyboard with no keyboard traps.
- **2.4.3 Focus Order**: Focus moves in a logical, meaningful sequence.
- **2.4.7 Focus Visible**: Keyboard focus indicator is always visible (use `:focus-visible`, never suppress without replacement).
- **4.1.2 Name, Role, Value**: All UI components expose their name, role, and state to assistive technology.

**Common pitfalls to catch:**
- Missing `aria-current="page"` on breadcrumb / navigation current items
- Popover/dropdown trigger missing `aria-expanded` and `aria-haspopup`
- Interactive elements inside non-interactive wrappers (e.g., `<a>` inside `<span>` that also has click handlers)
- Color-only state indicators (e.g., red for error) without text or icon supplement
- Focus ring visible on mouse click (use `:focus-visible`, not `:focus`)
- Disabled elements still reachable via Tab (use `tabIndex={-1}` or native `disabled`)

### Always use existing DS components internally

When building new components, **always compose with existing Design System components** rather than raw HTML or ad-hoc markup. If the DS already provides a sub-component (badge, icon button, tooltip, divider, etc.), use it directly inside the new component rather than accepting a raw `ReactNode` slot that forces the consumer to assemble sub-components. Bake DS primitives in; expose simple props (e.g. `badgeCount` instead of `badge?: ReactNode`, `locked: boolean` instead of `lockContent?: ReactNode`).

### Icon names — always verify before using

The `<Icon>` component accepts a `name` prop typed as `IconName`, derived from the keys of `iconMeta` in `src/components/Icon/iconData.ts`. **Never guess icon names.** Before using any icon name:

1. **Search `iconData.ts`** for the exact name: `grep "icon_name" src/components/Icon/iconData.ts`
2. If the name doesn't exist, **ask the user** which icon to use or search for similar names
3. Never use `as any` to bypass the `IconName` type — if TypeScript rejects it, the icon doesn't exist
4. Common naming pitfalls:
   - Names use **underscores**, not camelCase (e.g., `chevron_right` not `chevronRight`)
   - Some icons have `_fill` or `_outline` suffixes
   - Material/Google icon names don't always match — always verify against the actual data file

### Composition over ad-hoc markup

Reuse existing components instead of raw HTML:

| Need | Use | NOT |
|------|-----|-----|
| Divider line | `<Divider />` component | `<span>` with border/height |
| Title + description | `<TitleText />` | Custom heading markup |
| Expand/collapse icon | `<Expander />` | Custom rotating chevron |
| Icon rendering | `<Icon name="..." />` | Inline SVG |
| Scroll fade | `<ScrollFade />` | Custom gradient overlay |

This table is not exhaustive. **Before writing any sub-element, always check `src/components/` for an existing DS component that already solves that need** (e.g. Badge, IconBadge, IconButton, Tooltip, NotificationBadge, etc.). Never recreate functionality that the DS already provides.

### ScrollFade usage

When adding a `<ScrollFade>` to any component, **always ask the user for the `fadeSize`** if they haven't specified it. The default (40px) is often too large for the context. Prompt before proceeding:
> "What `fadeSize` would you like for the ScrollFade?"

### Reusable behavior via hooks

**Before building any new behavior, ALWAYS check existing hooks first.** Search `src/hooks/` and `src/components/**/use*.ts` for existing solutions. Do NOT reimplement logic that a hook already provides.

#### Existing hooks registry

| Hook | Location | Purpose |
|------|----------|---------|
| `useCollapsible` | `src/hooks/useCollapsible.ts` | Height + opacity expand/collapse animation using design tokens. Returns `{ ref }` |
| `useIsTruncated` | `src/hooks/useIsTruncated.ts` | Detects text truncation (`scrollWidth > clientWidth`) via ref + ResizeObserver |
| `useTypewriter` | `src/hooks/useTypewriter.tsx` | Text reveal animation with speed, autoStart, fade. Returns `displayed`, `isTyping`, `isDone`, `start`, `skip`, `reset` |
| `useScrollFade` | `src/components/ScrollFade/ScrollFade.tsx` | Scroll position detection for fade visibility. Returns `showStart`, `showEnd`, `onScroll`, `refresh` |
| `useShimmer` | `src/components/Shimmer/useShimmer.ts` | Returns CSS class name for shimmer loading effect. Params: `enabled`, `inverse` |
| `useFieldContext` | `src/components/Fieldset/FieldContext.ts` | Accesses shared field context (disabled, error, size) from `Fieldset` |
| `useTooltipConfig` | `src/components/Tooltip/TooltipProvider.tsx` | Accesses tooltip configuration from provider |
| `useTooltipGroup` | `src/components/Tooltip/TooltipProvider.tsx` | Accesses tooltip group context for coordinated show/hide |
| `useBreakpoint` | `src/hooks/useBreakpoint.ts` | Returns current breakpoint name + `gte`/`gt`/`lte`/`lt` comparators. Uses `useSyncExternalStore` with `matchMedia` listeners |

When a needed behavior doesn't exist as a hook yet, extract it into `src/hooks/` so it can be reused. Hooks should:
- Use design tokens for durations, easings, opacities
- Return refs and state, not DOM manipulation side effects

## CSS Module Conventions

### Token usage

```css
/* CORRECT */
.header {
  background: var(--element-fill-neutral-tertiary-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  transition: opacity var(--animation-state-change-duration) var(--animation-state-change-easing);
}

/* WRONG — never do this */
.header {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 16px;
  transition: opacity 200ms ease;
}
```

### State styling

- Hover: `:hover:not(.disabled)`
- Press: `:active:not(.disabled)`
- Focus: `:focus-visible` with `outline` using brand tokens
- Disabled: `color: var(--text-neutral-disable)` — apply to children with `* { color: inherit !important; }` if needed

### Pseudo-elements for indicators

Use `::before` / `::after` for visual indicators (drag lines, decorative elements) — keep them separate from content opacity so they stay visible during state changes.

### Section comments in CSS

```css
/* ── Section Name ── */
```

## Playground Demos

### Structure

- One file per component group: `src/pages/ComponentPlayground.tsx`
- Default export function
- Register in `App.tsx` — keep the `pages` array **alphabetically sorted**

### Demo pattern

```typescript
const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 12 };

function FeatureDemo() {
  // Small focused demo for one feature
}

export default function ComponentPlayground() {
  return (
    <>
      <h1>Component Name</h1>
      <section style={sectionStyle}>
        <h2>Feature</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Description.</p>
        <div style={cardStyle}><FeatureDemo /></div>
      </section>
    </>
  );
}
```

### Demo content

- Use enough data to demonstrate scrolling, overflow, and edge cases
- Enable `stickyHeader` and `maxHeight`/`style={{ maxHeight }}` for scrollable table demos
- Add `description` props to `DataCellContent` for taller row content when needed

## Theming and Density

- Themes: `data-theme="light" | "dark" | "dusk"` — colors and shadows change
- Density: `data-density="normal" | "dense"` — spacing scales down
- Typeface: `data-typeface="mac" | "windows" | "marketing" | "inter"`
- Components must work across all modes without hardcoded values

## Auto-Detection Over Manual Configuration

When a component needs context from its environment (e.g., background color, surface), it should **detect automatically** by inspecting the DOM/CSSOM — not require a manual prop. Example: `ScrollFade` inspects ancestor stylesheets to find the exact CSS token used for the background, then uses that same `var()` in its gradient.

Hardcoded lists of known tokens are not scalable. Prefer generic detection mechanisms.

## Workflow

1. **Figma first**: New components start from a Figma link — extract structure, spacing, states, and variants from the design
2. **Incremental**: Build header → item → group, validating at each step
3. **Consistent**: Apply the same fix across all similar cases (e.g., row drag fix → column drag fix)
4. **Playground validation**: Create demos that exercise the feature including edge cases
5. **Push and merge**: Commit with descriptive messages after each completed feature

## Git Commit Style

```
Short summary of the change (imperative mood)

- Bullet points explaining what and why
- Reference specific behavior changes
```

Examples:
- `Dynamic full-column resize handle indicator and minor cleanup`
- `Extract useCollapsible hook from AccordionItem`
- `ScrollFade auto-detects background token from stylesheets`
