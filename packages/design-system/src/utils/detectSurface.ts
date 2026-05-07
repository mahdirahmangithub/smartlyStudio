export type SurfaceType = "auto" | "default" | "over" | "under";

export const SURFACE_TOKENS: Record<string, string> = {
  default: "--element-surface-default",
  over: "--element-surface-over",
  under: "--element-surface-under",
};

/**
 * Walks up the DOM from `element` to find the nearest ancestor whose
 * background matches a known surface token, and returns the surface key.
 *
 * Two-pass strategy:
 * 1. Check inline `style.background` / `style.backgroundColor` for a literal `var(--token)` reference.
 * 2. Resolve each token's computed colour, then compare against ancestor computed backgrounds.
 */
export function detectSurface(element: HTMLElement): string {
  let el: HTMLElement | null = element.parentElement;
  while (el) {
    const rawBg = el.style.background || el.style.backgroundColor;
    if (rawBg) {
      for (const [key, token] of Object.entries(SURFACE_TOKENS)) {
        if (rawBg.includes(`var(${token})`)) return key;
      }
    }
    el = el.parentElement;
  }

  const tokenColors: [string, string][] = [];
  for (const [key, token] of Object.entries(SURFACE_TOKENS)) {
    const temp = document.createElement("div");
    temp.style.backgroundColor = `var(${token})`;
    element.appendChild(temp);
    const resolved = getComputedStyle(temp).backgroundColor;
    element.removeChild(temp);
    if (
      resolved &&
      resolved !== "rgba(0, 0, 0, 0)" &&
      resolved !== "transparent"
    ) {
      tokenColors.push([key, resolved]);
    }
  }

  el = element.parentElement;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      for (let i = tokenColors.length - 1; i >= 0; i--) {
        if (bg === tokenColors[i][1]) return tokenColors[i][0];
      }
      break;
    }
    el = el.parentElement;
  }
  return "default";
}

/** Resolves a surface prop to the matching CSS variable string: `var(--element-surface-*)` */
export function surfaceTokenVar(surface: string): string {
  return `var(${SURFACE_TOKENS[surface] ?? SURFACE_TOKENS.default})`;
}

/**
 * Reads the CSS variable name used as the background on `element` by checking
 * inline styles first, then walking all loaded stylesheets for a matching rule.
 * Returns the raw variable name (e.g. `--element-surface-default`) or null.
 */
export function extractBgToken(element: HTMLElement): string | null {
  const raw = element.style.background || element.style.backgroundColor;
  if (raw) {
    const m = raw.match(/var\((--[^),]+)/);
    if (m) return m[1];
  }

  let token: string | null = null;
  const walk = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        try { if (!element.matches(rule.selectorText)) continue; } catch { continue; }
        for (const prop of ["background", "background-color"]) {
          const val = rule.style.getPropertyValue(prop);
          if (val) {
            const m = val.match(/var\((--[^),]+)/);
            if (m) token = m[1];
          }
        }
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* cross-origin */ }
  }
  return token;
}

/**
 * Walks up the DOM from `element` to find the nearest ancestor with a
 * non-transparent background, then returns its CSS variable reference
 * (e.g. `var(--element-surface-default)`) or the raw computed color as fallback.
 */
export function detectFadeColor(element: HTMLElement): string {
  let el: HTMLElement | null = element.parentElement;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const token = extractBgToken(el);
      return token ? `var(${token})` : bg;
    }
    el = el.parentElement;
  }
  return "var(--element-surface-default)";
}
