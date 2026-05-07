/**
 * Centralized data-visualization color system.
 *
 * All colors are resolved from CSS custom properties at runtime,
 * making them theme-aware (light / dark / dusk) automatically.
 *
 * Three palette families:
 *   - Categorical  — distinct hues for unrelated series
 *   - Sequential   — single-hue ramps (light→dark) for ordered data
 *   - Divergent    — two-hue ramps meeting at a neutral midpoint
 *
 * Plus semantic accessors for individual default/hover colors.
 */

/* ── Types ── */

export type SemanticHue =
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "alert"
  | "neutral"
  | "info-alt"
  | "warning-alt"
  | "alert-alt";

/** Hues that carry divergent (cold + warm) ramps. */
export type DivergentHue =
  | "brand"
  | "info"
  | "success"
  | "info-alt";

export type ColorScheme =
  | { type: "categorical" }
  | { type: "sequential"; hue: SemanticHue }
  | { type: "divergent"; hue: DivergentHue }
  | { type: "custom"; colors: string[] };

/* ── Token maps ── */

const CATEGORICAL_COUNT = 8;

function categoricalToken(index: number): string {
  return `--data-viz-categorical-${index + 1}-default`;
}

const SEQUENTIAL_STEPS = 10;
const SEQUENTIAL_BASE_STEPS = 6;

function sequentialToken(hue: SemanticHue, step: number): string {
  if (step <= SEQUENTIAL_BASE_STEPS) {
    return `--data-viz-${hue}-sequential-${step}`;
  }
  return `--data-viz-${hue}-sequential-extended-${step}`;
}

function divergentToken(hue: DivergentHue, side: "cold" | "warm", step: number): string {
  return `--data-viz-${hue}-divergent-${side}-${step}`;
}

const DIVERGENT_STEPS_PER_SIDE = 6;

/** Hues that have only 6 sequential steps (no extended). */
const SHORT_SEQUENTIAL: Set<SemanticHue> = new Set(["neutral"]);

function maxSequentialSteps(hue: SemanticHue): number {
  return SHORT_SEQUENTIAL.has(hue) ? SEQUENTIAL_BASE_STEPS : SEQUENTIAL_STEPS;
}

/* ── Resolution cache ── */

let _computed: CSSStyleDeclaration | null = null;
let _themeAttr: string | null = null;

function getComputed(): CSSStyleDeclaration {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");
  if (!_computed || currentTheme !== _themeAttr) {
    _computed = getComputedStyle(root);
    _themeAttr = currentTheme;
    _categoricalCache = null;
    _sequentialCaches.clear();
    _divergentCaches.clear();
  }
  return _computed;
}

function resolve(token: string): string {
  return getComputed().getPropertyValue(token).trim() || "#888";
}

/**
 * Force-clear all resolved color caches.
 * Called automatically when `data-theme` changes.
 */
export function invalidateDataVizCache(): void {
  _computed = null;
  _themeAttr = null;
  _categoricalCache = null;
  _sequentialCaches.clear();
  _divergentCaches.clear();
}

/* ── Theme change observer ── */

let _observer: MutationObserver | null = null;

function ensureThemeObserver(): void {
  if (_observer || typeof MutationObserver === "undefined") return;
  _observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === "data-theme") {
        invalidateDataVizCache();
        break;
      }
    }
  });
  _observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

/* ── Categorical ── */

let _categoricalCache: string[] | null = null;

/**
 * Returns the full 8-color categorical palette, resolved for the current theme.
 */
export function getCategoricalPalette(): string[] {
  ensureThemeObserver();
  if (_categoricalCache) return _categoricalCache;
  const raw = Array.from({ length: CATEGORICAL_COUNT }, (_, i) =>
    resolve(categoricalToken(i))
  );
  _categoricalCache = correctCategoricalPalette(raw);
  return _categoricalCache;
}

/**
 * Pick a categorical color by index. Cycles when index >= 8.
 * If `override` is provided, returns it directly.
 */
export function getCategoricalColor(index: number, override?: string): string {
  if (override) return override;
  const palette = getCategoricalPalette();
  return palette[index % palette.length];
}

/* ── Sequential ── */

const _sequentialCaches = new Map<SemanticHue, string[]>();

/**
 * Returns a sequential ramp for the given hue (light→dark).
 * Up to 10 steps for most hues, 6 for neutral.
 * Pass `steps` to get a subset evenly sampled from the full ramp.
 */
export function getSequentialPalette(
  hue: SemanticHue,
  steps?: number
): string[] {
  ensureThemeObserver();
  let full = _sequentialCaches.get(hue);
  if (!full) {
    const max = maxSequentialSteps(hue);
    const raw = Array.from({ length: max }, (_, i) =>
      resolve(sequentialToken(hue, i + 1))
    );
    full = correctSequentialRamp(raw);
    _sequentialCaches.set(hue, full);
  }
  if (!steps || steps >= full.length) return full;
  return sampleEvenly(full, steps);
}

/* ── Divergent ── */

const _divergentCaches = new Map<DivergentHue, string[]>();

/**
 * Returns a divergent ramp: cold(dark→light) + warm(light→dark).
 * Lightest values meet in the center; intensity increases outward.
 * Total 12 stops by default.
 * Pass `steps` to get an evenly sampled subset.
 */
export function getDivergentPalette(
  hue: DivergentHue,
  steps?: number
): string[] {
  ensureThemeObserver();
  let full = _divergentCaches.get(hue);
  if (!full) {
    const coldRaw = Array.from({ length: DIVERGENT_STEPS_PER_SIDE }, (_, i) =>
      resolve(divergentToken(hue, "cold", DIVERGENT_STEPS_PER_SIDE - i))
    );
    const warmRaw = Array.from({ length: DIVERGENT_STEPS_PER_SIDE }, (_, i) =>
      resolve(divergentToken(hue, "warm", i + 1))
    );
    const cold = correctSequentialRamp(coldRaw);
    const warm = correctSequentialRamp(warmRaw);
    full = [...cold, ...warm];
    _divergentCaches.set(hue, full);
  }
  if (!steps || steps >= full.length) return full;
  return sampleEvenly(full, steps);
}

/* ── Semantic single colors ── */

/**
 * Get a single semantic data-viz color (default or hover variant).
 * Neutral only has a `normal` token — it returns the same value for both variants.
 */
export function getSemanticColor(
  hue: SemanticHue,
  variant: "default" | "hover" = "default"
): string {
  ensureThemeObserver();
  if (hue === "neutral") return correctColor(resolve("--data-viz-neutral-normal"));
  return correctColor(resolve(`--data-viz-${hue}-${variant}`));
}

/* ── Interpolator ── */

/**
 * Returns a continuous interpolation function `(t: number) => string`
 * where t ∈ [0, 1], built from sequential or divergent token stops.
 * Compatible with d3 color scales.
 */
export function getColorInterpolator(
  hue: SemanticHue,
  type: "sequential" | "divergent" = "sequential"
): (t: number) => string {
  const stops =
    type === "divergent" && isDivergentHue(hue)
      ? getDivergentPalette(hue as DivergentHue)
      : getSequentialPalette(hue);

  return (t: number): string => {
    const clamped = Math.max(0, Math.min(1, t));
    const pos = clamped * (stops.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, stops.length - 1);
    if (lo === hi) return stops[lo];
    const frac = pos - lo;
    return interpolateColor(stops[lo], stops[hi], frac);
  };
}

/* ── Resolve a ColorScheme to a palette ── */

/**
 * Resolve a ColorScheme descriptor to an array of colors.
 * Convenience for chart components that accept a `colorScheme` prop.
 */
export function resolveColorScheme(
  scheme: ColorScheme,
  count?: number
): string[] {
  switch (scheme.type) {
    case "categorical":
      return getCategoricalPalette();
    case "sequential":
      return getSequentialPalette(scheme.hue, count);
    case "divergent":
      return getDivergentPalette(scheme.hue, count);
    case "custom":
      return scheme.colors;
  }
}

/* ── OKLCH Enhancement toggle ── */

let _oklchEnabled = true;

/**
 * Enable or disable OKLCH perceptual enhancement.
 * When enabled, resolved token colors are converted to OKLCH,
 * corrected for perceptual uniformity (lightness equalization,
 * chroma boost for muddy hues like yellow/orange), and
 * interpolation happens in OKLCH space.
 */
export function setOklchEnhancement(enabled: boolean): void {
  if (_oklchEnabled === enabled) return;
  _oklchEnabled = enabled;
  invalidateDataVizCache();
}

export function isOklchEnhanced(): boolean {
  return _oklchEnabled;
}

/* ── OKLCH Color Math ── */

type Vec3 = [number, number, number];

function parseColor(color: string): Vec3 {
  let hex = color.trim();
  if (hex.startsWith("rgb")) {
    const m = hex.match(/[\d.]+/g);
    if (m && m.length >= 3) return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
  }
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function srgbToLinear(rgb: Vec3): Vec3 {
  return [linearize(rgb[0]), linearize(rgb[1]), linearize(rgb[2])];
}

function linearToSrgb(lin: Vec3): Vec3 {
  return [delinearize(lin[0]), delinearize(lin[1]), delinearize(lin[2])];
}

function linearToOklab(lin: Vec3): Vec3 {
  const l_ = 0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2];
  const m_ = 0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2];
  const s_ = 0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2];
  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

function oklabToLinear(lab: Vec3): Vec3 {
  const l_ = lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2];
  const m_ = lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2];
  const s_ = lab[0] - 0.0894841775 * lab[1] - 1.2914855480 * lab[2];
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function oklabToOklch(lab: Vec3): Vec3 {
  const C = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  let H = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [lab[0], C, H];
}

function oklchToOklab(lch: Vec3): Vec3 {
  const hRad = (lch[2] * Math.PI) / 180;
  return [lch[0], lch[1] * Math.cos(hRad), lch[1] * Math.sin(hRad)];
}

function srgbToOklch(rgb: Vec3): Vec3 {
  return oklabToOklch(linearToOklab(srgbToLinear(rgb)));
}

function oklchToSrgb(lch: Vec3): Vec3 {
  return linearToSrgb(oklabToLinear(oklchToOklab(lch)));
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function gamutClip(lch: Vec3): Vec3 {
  let [L, C, H] = lch;
  L = clamp01(L);
  let lo = 0, hi = C;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const rgb = oklchToSrgb([L, mid, H]);
    if (rgb[0] < -0.001 || rgb[0] > 1.001 || rgb[1] < -0.001 || rgb[1] > 1.001 || rgb[2] < -0.001 || rgb[2] > 1.001) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return [L, lo, H];
}

function oklchToHex(lch: Vec3): string {
  const clipped = gamutClip(lch);
  const rgb = oklchToSrgb(clipped);
  const r = Math.round(clamp01(rgb[0]) * 255);
  const g = Math.round(clamp01(rgb[1]) * 255);
  const b = Math.round(clamp01(rgb[2]) * 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToOklch(color: string): Vec3 {
  return srgbToOklch(parseColor(color));
}

/* ── Perceptual corrections ── */

/**
 * Find the maximum in-gamut chroma for a given lightness and hue.
 */
function maxChroma(L: number, H: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const rgb = oklchToSrgb([L, mid, H]);
    if (rgb[0] < -0.002 || rgb[0] > 1.002 ||
        rgb[1] < -0.002 || rgb[1] > 1.002 ||
        rgb[2] < -0.002 || rgb[2] > 1.002) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return lo;
}

/** Below this chroma, a color is achromatic (gray) — don't touch it. */
const ACHROMATIC_THRESHOLD = 0.035;

/* ── Categorical: vivid, rich, well-separated ── */

const CAT_L_MIN = 0.50;
const CAT_L_MAX = 0.80;
const CAT_L_SCAN_STEPS = 30;
const CAT_CHROMA_FILL = 0.96;
const MIN_HUE_GAP = 25;

/**
 * Hue-pinned overrides: specific hue ranges are forced to hand-tuned OKLCH
 * targets for categorical colors, and receive brightening for semantic colors.
 * Each entry: [hueLo, hueHi, targetL, targetC, targetH]
 */
const HUE_PINS: [number, number, ...Vec3][] = [
  [55,  95,  0.82, 0.19, 72.3  ],  // yellow → bright gold
  [96,  135, 0.79, 0.22, 125.85],  // lime   → vivid chartreuse
  [136, 160, 0.73, 0.28, 148.22],  // green  → rich emerald
];
const SEMANTIC_BLEND = 0.6;

function findHuePin(H: number): Vec3 | null {
  for (const [lo, hi, L, C, Ht] of HUE_PINS) {
    if (H >= lo && H <= hi) return [L, C, Ht];
  }
  return null;
}

function peakVibrancyL(H: number): number {
  let bestL = (CAT_L_MIN + CAT_L_MAX) / 2;
  let bestC = 0;
  for (let i = 0; i <= CAT_L_SCAN_STEPS; i++) {
    const L = CAT_L_MIN + (CAT_L_MAX - CAT_L_MIN) * (i / CAT_L_SCAN_STEPS);
    const mc = maxChroma(L, H);
    if (mc > bestC) {
      bestC = mc;
      bestL = L;
    }
  }
  return bestL;
}

function correctCategoricalPalette(hexColors: string[]): string[] {
  if (!_oklchEnabled) return hexColors;

  const lchColors = hexColors.map(hexToOklch);
  const pinned: boolean[] = [];

  const corrected: Vec3[] = lchColors.map(([, C, H]) => {
    if (C < ACHROMATIC_THRESHOLD) {
      pinned.push(false);
      return [0.65, C, H] as Vec3;
    }
    const pin = findHuePin(H);
    if (pin) {
      pinned.push(true);
      return [pin[0], pin[1], pin[2]] as Vec3;
    }
    pinned.push(false);
    const L = peakVibrancyL(H);
    const mc = maxChroma(L, H);
    return [L, mc * CAT_CHROMA_FILL, H] as Vec3;
  });

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < corrected.length; i++) {
      if (pinned[i]) continue;
      for (let j = i + 1; j < corrected.length; j++) {
        if (pinned[j]) continue;
        if (corrected[i][1] < ACHROMATIC_THRESHOLD || corrected[j][1] < ACHROMATIC_THRESHOLD) continue;
        let dH = corrected[j][2] - corrected[i][2];
        if (dH > 180) dH -= 360;
        if (dH < -180) dH += 360;
        if (Math.abs(dH) < MIN_HUE_GAP) {
          const push = (MIN_HUE_GAP - Math.abs(dH)) / 2 + 1;
          corrected[i][2] = (corrected[i][2] - push + 360) % 360;
          corrected[j][2] = (corrected[j][2] + push + 360) % 360;
          const Li = peakVibrancyL(corrected[i][2]);
          const Lj = peakVibrancyL(corrected[j][2]);
          corrected[i][0] = Li;
          corrected[j][0] = Lj;
          corrected[i][1] = maxChroma(Li, corrected[i][2]) * CAT_CHROMA_FILL;
          corrected[j][1] = maxChroma(Lj, corrected[j][2]) * CAT_CHROMA_FILL;
        }
      }
    }
  }

  return corrected.map(oklchToHex);
}

/* ── Sequential / divergent / semantic: preserve character, amplify quality ── */

/**
 * Boost factor: how much to push chroma toward the gamut boundary.
 * 0 = keep original, 1 = go to gamut max. 0.35 is a moderate vivid polish.
 */
const SEQ_CHROMA_BOOST = 0.45;

function boostChroma(L: number, H: number, originalC: number): number {
  if (originalC < ACHROMATIC_THRESHOLD) return originalC;
  const mc = maxChroma(L, H);
  return originalC + (mc - originalC) * SEQ_CHROMA_BOOST;
}

function correctColor(hex: string): string {
  if (!_oklchEnabled) return hex;
  const [L, C, H] = hexToOklch(hex);

  const pin = C >= ACHROMATIC_THRESHOLD ? findHuePin(H) : null;
  if (pin) {
    const brightL = L + (pin[0] - L) * SEMANTIC_BLEND;
    const mc = maxChroma(brightL, H);
    return oklchToHex([brightL, mc * CAT_CHROMA_FILL, H]);
  }

  return oklchToHex([L, boostChroma(L, H, C), H]);
}

/**
 * Correct a sequential ramp:
 * - Equalize lightness linearly (smooth perceptual progression)
 * - Boost chroma moderately toward gamut boundary (vibrant but natural)
 * - Achromatic ramps stay gray
 */
function correctSequentialRamp(hexColors: string[]): string[] {
  if (!_oklchEnabled) return hexColors;
  const lchColors = hexColors.map(hexToOklch);
  const n = lchColors.length;
  if (n < 2) return lchColors.map(([L, C, H]) =>
    oklchToHex([L, boostChroma(L, H, C), H])
  );

  const startL = lchColors[0][0];
  const endL = lchColors[n - 1][0];

  return lchColors.map((lch, i) => {
    const [, C, H] = lch;
    const t = i / (n - 1);
    const L = startL + (endL - startL) * t;
    return oklchToHex([L, boostChroma(L, H, C), H]);
  });
}

/* ── OKLCH interpolation ── */

function interpolateOklch(a: string, b: string, t: number): string {
  const lchA = hexToOklch(a);
  const lchB = hexToOklch(b);

  const L = lchA[0] + (lchB[0] - lchA[0]) * t;
  const C = lchA[1] + (lchB[1] - lchA[1]) * t;

  let hA = lchA[2], hB = lchB[2];
  let dH = hB - hA;
  if (dH > 180) dH -= 360;
  if (dH < -180) dH += 360;
  let H = hA + dH * t;
  if (H < 0) H += 360;
  if (H >= 360) H -= 360;

  return oklchToHex([L, C, H]);
}

/* ── Helpers ── */

function isDivergentHue(hue: SemanticHue): hue is DivergentHue {
  return ["brand", "info", "success", "info-alt"].includes(hue);
}

function sampleEvenly(arr: string[], count: number): string[] {
  if (count <= 1) return [arr[0]];
  if (count >= arr.length) return arr;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i / (count - 1)) * (arr.length - 1));
    result.push(arr[idx]);
  }
  return result;
}

function interpolateColor(a: string, b: string, t: number): string {
  if (_oklchEnabled) return interpolateOklch(a, b, t);
  const [r1, g1, b1] = parseColor(a);
  const [r2, g2, b2] = parseColor(b);
  const r = Math.round((r1 + (r2 - r1) * t) * 255);
  const g = Math.round((g1 + (g2 - g1) * t) * 255);
  const bl = Math.round((b1 + (b2 - b1) * t) * 255);
  return `rgb(${r}, ${g}, ${bl})`;
}
