/**
 * Caret position in viewport for a textarea, for anchoring floating UI (e.g. Dropdown).
 * Uses a clipped mirror aligned to the textarea box and `scrollTop` so wrapped / scrolled
 * content matches the visible field.
 */

const COPY_PROPS = [
  "direction",
  "boxSizing",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "fontFamily",
  "lineHeight",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "whiteSpace",
  "wordWrap",
  "wordBreak",
] as const;

export interface CaretViewportRect {
  left: number;
  top: number;
  height: number;
}

/**
 * Returns the caret box in **viewport** coordinates (suitable for `position: fixed`).
 */
export function getTextareaCaretViewportRect(
  textarea: HTMLTextAreaElement,
  position: number,
): CaretViewportRect | null {
  if (typeof document === "undefined") return null;
  const pos = Math.max(0, Math.min(position, textarea.value.length));
  const computed = window.getComputedStyle(textarea);
  const taRect = textarea.getBoundingClientRect();
  const contentLeft = taRect.left + textarea.clientLeft;
  const contentTop = taRect.top + textarea.clientTop;

  const outer = document.createElement("div");
  const os = outer.style;
  os.position = "fixed";
  os.left = `${contentLeft}px`;
  os.top = `${contentTop}px`;
  os.width = `${textarea.clientWidth}px`;
  os.height = `${textarea.clientHeight}px`;
  os.overflow = "hidden";
  os.visibility = "hidden";
  os.pointerEvents = "none";
  os.zIndex = "-1";

  const inner = document.createElement("div");
  const ins = inner.style;
  ins.marginTop = `${-textarea.scrollTop}px`;
  ins.marginLeft = `${-textarea.scrollLeft}px`;
  ins.whiteSpace = "pre-wrap";
  ins.wordWrap = "break-word";
  ins.width = "100%";

  for (const key of COPY_PROPS) {
    const v = computed[key as keyof CSSStyleDeclaration];
    if (v != null && v !== "") (ins as unknown as Record<string, string>)[key] = String(v);
  }

  const before = textarea.value.slice(0, pos);
  const after = textarea.value.slice(pos) || "\u200b";

  inner.textContent = "";
  inner.append(document.createTextNode(before));
  const span = document.createElement("span");
  span.textContent = after;
  inner.append(span);

  outer.append(inner);
  document.body.appendChild(outer);

  const spanRect = span.getBoundingClientRect();
  document.body.removeChild(outer);

  const lineHeightPx = parseFloat(computed.lineHeight || "0") || spanRect.height || 16;

  return {
    left: spanRect.left,
    top: spanRect.top,
    height: lineHeightPx,
  };
}
