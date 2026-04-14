import { useMemo } from "react";
import { iconMeta, type IconName } from "./iconData";

export type IconCategory = "originals" | "custom" | "logo" | "logo-color" | "flag";

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: number;
  color?: string;
}

const MONOCHROME_CATEGORIES = new Set<string>(["originals", "custom", "logo"]);

function extractSvgInner(svg: string): { inner: string; viewBox: string } {
  const vbMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch?.[1] ?? "0 0 24 24";
  const inner = svg.replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { inner, viewBox };
}

export function Icon({
  name,
  size = 24,
  color,
  className,
  style,
  ...rest
}: IconProps) {
  const entry = iconMeta[name];

  const { html, viewBox } = useMemo(() => {
    if (!entry) return { html: "", viewBox: "0 0 24 24" };

    const { inner, viewBox } = extractSvgInner(entry.svg);
    const isMonochrome = MONOCHROME_CATEGORIES.has(entry.category);

    const html = isMonochrome
      ? inner.replace(/#444546/gi, "currentColor")
      : inner;

    return { html, viewBox };
  }, [entry]);

  if (!entry) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={color ? { color, ...style } : style}
      aria-hidden="true"
      {...rest}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
