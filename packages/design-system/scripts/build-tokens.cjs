const fs = require("fs");
const path = require("path");

const TOKENS_DIR = path.resolve(__dirname, "../tokens");
const PRIMITIVES_PATH = path.join(TOKENS_DIR, "primitives/Default.tokens.json");
const COLORS_DIR = path.join(TOKENS_DIR, "colors");
const OUT_DIR = path.resolve(__dirname, "../src/tokens");

const primitives = JSON.parse(fs.readFileSync(PRIMITIVES_PATH, "utf-8"));

function formatColor(val) {
  const { hex, alpha } = val;
  if (alpha >= 0.999) return hex.toLowerCase();
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.round(alpha * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function roundUnitless(v) {
  for (let d = 1; d <= 8; d++) {
    const r = parseFloat(v.toFixed(d));
    if (Math.abs(r - v) < 1e-6) return r;
  }
  return parseFloat(v.toFixed(8));
}

function cssVarName(...segments) {
  return (
    "--" +
    segments
      .filter(Boolean)
      .join("-")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/:/g, "-")
  );
}

const lines = [];

function processColorGroup(groupName, group, prefix) {
  for (const [key, val] of Object.entries(group)) {
    if (val.$type === "color") {
      lines.push(`  ${cssVarName(prefix, groupName, key)}: ${formatColor(val.$value)};`);
    } else if (typeof val === "object" && !val.$type) {
      processColorGroup(key, val, `${prefix}-${groupName}`);
    }
  }
}

function processColors(colors) {
  lines.push("  /* ─── Colors ─── */");
  for (const [groupName, group] of Object.entries(colors)) {
    lines.push("");
    lines.push(`  /* ${groupName} */`);
    processColorGroup(groupName, group, "color");
  }
}

function processNumberTokens(category, obj, unit, prefix) {
  for (const [key, val] of Object.entries(obj)) {
    if (val.$type === "number" || val.$type === "string") {
      const v = val.$value;
      const rounded = typeof v === "number" ? parseFloat(v.toPrecision(10)) : v;
      const formatted = typeof v === "number" ? `${rounded}${unit}` : v;
      lines.push(`  ${cssVarName(prefix, key)}: ${formatted};`);
    } else if (typeof val === "object" && !val.$type) {
      processNumberTokens(category, val, unit, `${prefix}-${key}`);
    }
  }
}

function processFontFamily(families) {
  lines.push("");
  lines.push("  /* font-family */");
  for (const [platform, fonts] of Object.entries(families)) {
    for (const [role, val] of Object.entries(fonts)) {
      if (val.$type === "string") {
        lines.push(`  ${cssVarName("font-family", platform, role)}: "${val.$value}";`);
      }
    }
  }
}

function processMotionEasing(easings) {
  for (const [key, val] of Object.entries(easings)) {
    if (val.$type === "string") {
      lines.push(`  ${cssVarName("motion-easing", key)}: ${val.$value};`);
    }
  }
}

function processZIndex(obj, prefix) {
  for (const [key, val] of Object.entries(obj)) {
    if (val.$type === "number") {
      lines.push(`  ${cssVarName(prefix, key)}: ${val.$value};`);
    } else if (val.$type === "string") {
      lines.push(`  /* ${cssVarName(prefix, key)}: ${val.$value}; (computed) */`);
    } else if (typeof val === "object" && !val.$type) {
      processZIndex(val, `${prefix}-${key}`);
    }
  }
}

// --- Build primitives.css ---

lines.push(":root {");

// Colors
processColors(primitives.color);

// Font
lines.push("");
lines.push("  /* ─── Font ─── */");
processFontFamily(primitives.font.family);

lines.push("");
lines.push("  /* font-size */");
for (const [key, val] of Object.entries(primitives.font.size)) {
  if (val.$type === "number") {
    const rem = parseFloat((val.$value / 16).toFixed(6));
    lines.push(`  ${cssVarName("font-size", key)}: ${rem}rem;`);
  }
}

lines.push("");
lines.push("  /* font-weight */");
processNumberTokens("font", primitives.font.weight, "", "font-weight");

lines.push("");
lines.push("  /* line-height */");
for (const [key, val] of Object.entries(primitives.font["line-height"])) {
  if (val.$type === "number") {
    const isUnitless = key.startsWith("unitless");
    const unit = isUnitless ? "" : "px";
    const desc = val.$description || val.$extensions?.["com.figma.description"];
    const v = isUnitless
      ? (desc || roundUnitless(val.$value))
      : parseFloat(val.$value.toPrecision(10));
    lines.push(`  ${cssVarName("line-height", key)}: ${v}${unit};`);
  }
}

lines.push("");
lines.push("  /* letter-spacing */");
for (const [key, val] of Object.entries(primitives.font["letter-spacing"])) {
  if (val.$type === "number") {
    const desc = val.$description;
    const v = desc ? desc.replace(/[{}]/g, "").replace(/em$/, "rem") : `${parseFloat(val.$value.toPrecision(10))}px`;
    lines.push(`  ${cssVarName("letter-spacing", key)}: ${v};`);
  }
}

// Space
lines.push("");
lines.push("  /* ─── Space ─── */");
processNumberTokens("space", primitives.space, "px", "space");

// Radius
lines.push("");
lines.push("  /* ─── Radius ─── */");
processNumberTokens("radius", primitives.radius, "px", "radius");

// Opacity
lines.push("");
lines.push("  /* ─── Opacity ─── */");
for (const [key, val] of Object.entries(primitives.opacity)) {
  if (val.$type === "number") {
    lines.push(`  ${cssVarName("opacity", key)}: ${val.$value / 100};`);
  }
}

// Blur
lines.push("");
lines.push("  /* ─── Blur ─── */");
processNumberTokens("blur", primitives.blur, "px", "blur");

// Aspect ratio
lines.push("");
lines.push("  /* ─── Aspect Ratio ─── */");
processNumberTokens("aspect-ratio", primitives["aspect-ratio"], "", "aspect-ratio");

// Z-index
lines.push("");
lines.push("  /* ─── Z-Index ─── */");
processZIndex(primitives["z-index"], "z-index");

// Motion
lines.push("");
lines.push("  /* ─── Motion ─── */");
lines.push("");
lines.push("  /* duration */");
processNumberTokens("motion", primitives.motion.duration, "ms", "motion-duration");

lines.push("");
lines.push("  /* easing */");
processMotionEasing(primitives.motion.easing);

// Grid
lines.push("");
lines.push("  /* ─── Grid ─── */");
for (const [section, obj] of Object.entries(primitives.grid)) {
  lines.push("");
  lines.push(`  /* grid-${section} */`);
  processNumberTokens("grid", obj, "px", `grid-${section}`);
}

lines.push("}");
lines.push("");

const css = lines.join("\n");
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "primitives.css"), css);

const varCount = (css.match(/^\s+--/gm) || []).length;
console.log(`Generated primitives.css with ${varCount} CSS custom properties.`);

// --- Build functional spacing tokens (density modes) ---

const SPACING_DIR = path.join(TOKENS_DIR, "spacing");
const DENSITIES = [
  { file: "normal.tokens.json", selector: ":root, [data-density='normal']", name: "normal" },
  { file: "dense.tokens.json", selector: "[data-density='dense']", name: "dense" },
];

function collectSpacingVars(obj, prefix, out) {
  for (const [key, val] of Object.entries(obj)) {
    if (key === "$extensions") continue;
    if (val.$type === "number") {
      const alias = val.$extensions?.["com.figma.aliasData"]?.targetVariableName;
      const value = alias ? aliasToVar(alias) : `${val.$value}px`;
      out.push(`  ${cssVarName(prefix, key)}: ${value};`);
    } else if (typeof val === "object" && !val.$type) {
      collectSpacingVars(val, `${prefix}-${key}`, out);
    }
  }
}

const spacingBlocks = [];

for (const density of DENSITIES) {
  const data = JSON.parse(fs.readFileSync(path.join(SPACING_DIR, density.file), "utf-8"));
  const vars = [];

  for (const [category, obj] of Object.entries(data)) {
    if (category === "$extensions") continue;
    collectSpacingVars(obj, category, vars);
  }

  spacingBlocks.push(`${density.selector} {\n${vars.join("\n")}\n}`);

  const count = vars.filter((l) => l.trimStart().startsWith("--")).length;
  console.log(`  ${density.name}: ${count} spacing tokens`);
}

const spacingCss = spacingBlocks.join("\n\n") + "\n";
fs.writeFileSync(path.join(OUT_DIR, "spacing.css"), spacingCss);
console.log(`Generated spacing.css with ${DENSITIES.length} density modes.`);

// --- Build functional color tokens (themes) ---

const THEMES = [
  { file: "light.tokens.json", selector: ":root, [data-theme='light']", name: "light" },
  { file: "dark.tokens.json", selector: "[data-theme='dark']", name: "dark" },
  { file: "dusk.tokens.json", selector: "[data-theme='dusk']", name: "dusk" },
];

function aliasToVar(aliasName) {
  return "var(" + cssVarName(...aliasName.split("/")) + ")";
}

function collectColorVars(obj, prefix, out) {
  for (const [key, val] of Object.entries(obj)) {
    if (key === "$extensions") continue;
    if (val.$type === "color") {
      const alias = val.$extensions?.["com.figma.aliasData"]?.targetVariableName;
      const value = alias ? aliasToVar(alias) : formatColor(val.$value);
      out.push(`  ${cssVarName(prefix, key)}: ${value};`);
    } else if (typeof val === "object" && !val.$type) {
      collectColorVars(val, `${prefix}-${key}`, out);
    }
  }
}

const themeBlocks = [];

for (const theme of THEMES) {
  const data = JSON.parse(fs.readFileSync(path.join(COLORS_DIR, theme.file), "utf-8"));
  const vars = [];

  for (const [category, obj] of Object.entries(data)) {
    if (category === "$extensions") continue;
    vars.push("");
    vars.push(`  /* ─── ${category} ─── */`);
    collectColorVars(obj, category, vars);
  }

  themeBlocks.push(`${theme.selector} {\n${vars.join("\n")}\n}`);

  const count = vars.filter((l) => l.trimStart().startsWith("--")).length;
  console.log(`  ${theme.name}: ${count} color tokens`);
}

const colorsCss = themeBlocks.join("\n\n") + "\n";
fs.writeFileSync(path.join(OUT_DIR, "colors.css"), colorsCss);
console.log(`Generated colors.css with ${THEMES.length} themes.`);

// --- Build functional animation tokens ---

const ANIMATION_PATH = path.join(TOKENS_DIR, "animation/Default.tokens.json");
const animation = JSON.parse(fs.readFileSync(ANIMATION_PATH, "utf-8"));

const animVars = [];
animVars.push(":root {");

function collectAnimationVars(obj, prefix) {
  for (const [key, val] of Object.entries(obj)) {
    if (key === "$extensions") continue;
    if (val.$type) {
      const alias = val.$extensions?.["com.figma.aliasData"]?.targetVariableName;
      const value = alias ? aliasToVar(alias) : val.$value;
      animVars.push(`  ${cssVarName(prefix, key)}: ${value};`);
    } else if (typeof val === "object") {
      collectAnimationVars(val, `${prefix}-${key}`);
    }
  }
}

for (const [category, obj] of Object.entries(animation)) {
  if (category === "$extensions") continue;
  animVars.push("");
  animVars.push(`  /* ${category} */`);
  collectAnimationVars(obj, `animation-${category}`);
}

animVars.push("}");
animVars.push("");

const animCss = animVars.join("\n");
fs.writeFileSync(path.join(OUT_DIR, "animation.css"), animCss);

const animCount = (animCss.match(/^\s+--/gm) || []).length;
console.log(`Generated animation.css with ${animCount} tokens.`);

// --- Build functional typography tokens (typeface modes) ---

const TYPO_DIR = path.join(TOKENS_DIR, "typography");
const TYPEFACES = [
  { file: "mac.tokens.json", selector: ":root, [data-typeface='mac']", name: "mac" },
  { file: "windows.tokens.json", selector: "[data-typeface='windows']", name: "windows" },
  { file: "marketing.tokens.json", selector: "[data-typeface='marketing']", name: "marketing" },
  { file: "inter.tokens.json", selector: "[data-typeface='inter']", name: "inter" },
];

const PROP_TO_PREFIX = {
  family: "font-family",
  weight: "font-weight",
  size: "font-size",
  "line-height": "line-height",
  "letter-spacing": "letter-spacing",
};

function typoAliasToVar(key, val) {
  const alias = val.$extensions?.["com.figma.aliasData"]?.targetVariableName;
  const desc = val.$description;

  if (key === "line-height" && desc) {
    return "var(" + cssVarName(...desc.split("/").slice(1)) + ")";
  }

  if (!alias) return null;

  const segments = alias.split("/");
  if (segments[0] === "font" && (segments[1] === "letter-spacing" || segments[1] === "line-height")) {
    return "var(" + cssVarName(...segments.slice(1)) + ")";
  }

  return "var(" + cssVarName(...segments) + ")";
}

function collectTypoVars(obj, prefix, out) {
  for (const [key, val] of Object.entries(obj)) {
    if (key === "$extensions") continue;
    if (val.$type) {
      const value = typoAliasToVar(key, val);
      if (value) {
        out.push(`  ${cssVarName(prefix, key)}: ${value};`);
      }
    } else if (typeof val === "object") {
      collectTypoVars(val, `${prefix}-${key}`, out);
    }
  }
}

const typoBlocks = [];

for (const tf of TYPEFACES) {
  const data = JSON.parse(fs.readFileSync(path.join(TYPO_DIR, tf.file), "utf-8"));
  const vars = [];

  for (const [category, obj] of Object.entries(data)) {
    if (category === "$extensions") continue;
    vars.push("");
    vars.push(`  /* ${category} */`);
    collectTypoVars(obj, `type-${category}`, vars);
  }

  typoBlocks.push(`${tf.selector} {\n${vars.join("\n")}\n}`);

  const count = vars.filter((l) => l.trimStart().startsWith("--")).length;
  console.log(`  ${tf.name}: ${count} typography tokens`);
}

const typoCss = typoBlocks.join("\n\n") + "\n";
fs.writeFileSync(path.join(OUT_DIR, "typography.css"), typoCss);
console.log(`Generated typography.css with ${TYPEFACES.length} typeface modes.`);

// --- Build functional shadow tokens ---

const SHADOW_PATH = path.join(TOKENS_DIR, "shadow/shadow.tokens.json");
const shadowData = JSON.parse(fs.readFileSync(SHADOW_PATH, "utf-8"));

function shadowLayerValue(layer) {
  const cAlias = layer.color.$extensions?.["com.figma.aliasData"]?.targetVariableName;
  const xAlias = layer.x.$extensions?.["com.figma.aliasData"]?.targetVariableName;
  const yAlias = layer.y.$extensions?.["com.figma.aliasData"]?.targetVariableName;
  const bAlias = layer.blur.$extensions?.["com.figma.aliasData"]?.targetVariableName;
  const sAlias = layer.spread.$extensions?.["com.figma.aliasData"]?.targetVariableName;

  const color = cAlias ? aliasToVar(cAlias) : formatColor(layer.color.$value);
  const x = xAlias ? aliasToVar(xAlias) : `${layer.x.$value}px`;
  const y = yAlias ? aliasToVar(yAlias) : `${layer.y.$value}px`;
  const blur = bAlias ? aliasToVar(bAlias) : `${layer.blur.$value}px`;
  const spread = sAlias ? aliasToVar(sAlias) : `${layer.spread.$value}px`;

  return `${x} ${y} ${blur} ${spread} ${color}`;
}

function composeShadow(obj) {
  const layerKeys = Object.keys(obj).filter((k) => k !== "$extensions").sort((a, b) => Number(a) - Number(b));
  return layerKeys.map((k) => shadowLayerValue(obj[k])).join(",\n    ");
}

const SHADOW_THEMES = [
  { selector: ":root, [data-theme='light']", name: "light" },
  { selector: "[data-theme='dark']", name: "dark" },
  { selector: "[data-theme='dusk']", name: "dusk" },
];

const shadowVars = [];
let shadowCount = 0;

for (const sTheme of SHADOW_THEMES) {
  shadowVars.push(`${sTheme.selector} {`);

  for (const [size, obj] of Object.entries(shadowData)) {
    if (size === "$extensions") continue;

    if (size === "reverse") {
      shadowVars.push("");
      shadowVars.push("  /* reverse */");
      for (const [rSize, rObj] of Object.entries(obj)) {
        if (rSize === "$extensions") continue;
        shadowVars.push(`  ${cssVarName("shadow", "reverse", rSize)}: ${composeShadow(rObj)};`);
        if (sTheme.name === "light") shadowCount++;
      }
    } else {
      shadowVars.push("");
      shadowVars.push(`  /* ${size} */`);
      shadowVars.push(`  ${cssVarName("shadow", size)}: ${composeShadow(obj)};`);
      if (sTheme.name === "light") shadowCount++;
    }
  }

  shadowVars.push("}");
  shadowVars.push("");
}

const shadowCss = shadowVars.join("\n");
fs.writeFileSync(path.join(OUT_DIR, "shadow.css"), shadowCss);
console.log(`Generated shadow.css with ${shadowCount} shadow tokens.`);

// --- Build breakpoints.css and breakpoints.ts ---

const deviceSizes = primitives.grid["device-size"];
const sizeMap = {};
for (const [name, token] of Object.entries(deviceSizes)) {
  sizeMap[name] = token.$value;
}

function resolveBreakpointValue(symbolic) {
  if (symbolic == null) return undefined;
  const parts = symbolic.split("+");
  let value = sizeMap[parts[0]];
  if (value == null) return undefined;
  if (parts.length > 1 && parts[1] === "shift") {
    value += sizeMap.shift;
  }
  return value;
}

const mediaQueryTokens = primitives.grid["media-query"];
const BP_ORDER = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];
const breakpoints = [];

for (const name of BP_ORDER) {
  const def = mediaQueryTokens[name];
  if (!def) continue;
  const min = resolveBreakpointValue(def.min?.$value);
  const max = def.max ? resolveBreakpointValue(def.max.$value) : null;
  const device = def.min?.$description || `${min}px`;
  breakpoints.push({ name, min, max, device });
}

// Device label lookup for the reference table
const deviceLabels = {
  "2xs": "Small mobile",
  xs: "Mobile",
  sm: "Large mobile \u2013 Tablet",
  md: "Tablet \u2013 Small laptop",
  lg: "Small laptop \u2013 Laptop",
  xl: "Laptop \u2013 Desktop",
  "2xl": "Large desktop +",
};

// ── breakpoints.css ──

const bpCss = [];

bpCss.push("/*");
bpCss.push(" * \u2500\u2500 SDS Breakpoints \u2500\u2500");
bpCss.push(" * Auto-generated from design tokens \u2014 do not edit manually.");
bpCss.push(" * Run `npm run tokens` to regenerate.");
bpCss.push(" *");
bpCss.push(" * Name  | Min      | Max      | Range");
bpCss.push(" * \u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");

for (const bp of breakpoints) {
  const n = bp.name.padEnd(5);
  const mn = `${bp.min}px`.padEnd(8);
  const mx = bp.max != null ? `${bp.max}px`.padEnd(8) : "\u2014".padEnd(8);
  bpCss.push(` * ${n} | ${mn} | ${mx} | ${deviceLabels[bp.name] || ""}`);
}

bpCss.push(" *");
bpCss.push(" * Usage in CSS Modules (mobile-first):");
bpCss.push(" *   @media (min-width: 521px)  { .el { ... } }   \u2190 sm and up");
bpCss.push(" *   @media (min-width: 1025px) { .el { ... } }   \u2190 md and up");
bpCss.push(" *   @media (max-width: 1024px) { .el { ... } }   \u2190 below md");
bpCss.push(" */");
bpCss.push("");
bpCss.push("/* \u2500\u2500 Resolved Breakpoint Boundaries \u2500\u2500 */");
bpCss.push(":root {");

for (const bp of breakpoints) {
  bpCss.push(`  --breakpoint-${bp.name}-min: ${bp.min}px;`);
  if (bp.max != null) {
    bpCss.push(`  --breakpoint-${bp.name}-max: ${bp.max}px;`);
  }
}

bpCss.push("}");
bpCss.push("");

fs.writeFileSync(path.join(OUT_DIR, "breakpoints.css"), bpCss.join("\n") + "\n");

const bpVarCount = bpCss.filter((l) => l.trimStart().startsWith("--")).length;
console.log(`Generated breakpoints.css with ${bpVarCount} custom properties (${breakpoints.length} breakpoints).`);

// ── breakpoints.ts ──

const bpTs = [];

bpTs.push("// Auto-generated from design tokens \u2014 do not edit manually.");
bpTs.push("// Run `npm run tokens` to regenerate.");
bpTs.push("");
bpTs.push("export const BREAKPOINT_ORDER = [" + breakpoints.map((b) => `"${b.name}"`).join(", ") + "] as const;");
bpTs.push("");
bpTs.push("export type BreakpointName = (typeof BREAKPOINT_ORDER)[number];");
bpTs.push("");
bpTs.push("export interface Breakpoint {");
bpTs.push("  readonly min: number;");
bpTs.push("  readonly max: number | null;");
bpTs.push("}");
bpTs.push("");
bpTs.push("export const BREAKPOINTS: Record<BreakpointName, Breakpoint> = {");
for (const bp of breakpoints) {
  bpTs.push(`  "${bp.name}": { min: ${bp.min}, max: ${bp.max} },`);
}
bpTs.push("};");
bpTs.push("");

bpTs.push("export interface MediaQueries {");
bpTs.push("  readonly up: string;");
bpTs.push("  readonly down: string | null;");
bpTs.push("  readonly only: string;");
bpTs.push("}");
bpTs.push("");

bpTs.push("/** Pre-built media query strings for window.matchMedia() and CSS reference */");
bpTs.push("export const MEDIA_QUERIES: Record<BreakpointName, MediaQueries> = {");
for (const bp of breakpoints) {
  const up = `(min-width: ${bp.min}px)`;
  const only =
    bp.max != null
      ? `(min-width: ${bp.min}px) and (max-width: ${bp.max}px)`
      : `(min-width: ${bp.min}px)`;
  const down = bp.max != null ? `(max-width: ${bp.max}px)` : null;

  bpTs.push(`  "${bp.name}": {`);
  bpTs.push(`    up: "${up}",`);
  bpTs.push(`    down: ${down ? `"${down}"` : "null"},`);
  bpTs.push(`    only: "${only}",`);
  bpTs.push("  },");
}
bpTs.push("};");
bpTs.push("");

fs.writeFileSync(path.join(OUT_DIR, "breakpoints.ts"), bpTs.join("\n") + "\n");
console.log(`Generated breakpoints.ts with types and ${breakpoints.length} media query definitions.`);
