export type GradientEasing = "ease-in" | "ease-out" | "ease-in-out";

/**
 * Pre-computed [stopPosition%, mixPercentage%] pairs for each easing curve.
 * Mix% represents how much of the `from` color is present at that stop
 * (100 = fully `from`, 0 = fully `to`).
 */
const STOPS: Record<GradientEasing, [position: number, mix: number][]> = {
  "ease-out": [
    [0, 100],
    [19, 73.8],
    [34, 54.1],
    [47, 38.2],
    [56.5, 27.8],
    [65, 19.4],
    [73, 12.6],
    [80.2, 7.5],
    [86.1, 4.2],
    [91, 2.1],
    [95.2, 0.8],
    [98.2, 0.2],
    [100, 0],
  ],
  "ease-in": [
    [0, 0],
    [1.8, 0.2],
    [4.8, 0.8],
    [9, 2.1],
    [13.9, 4.2],
    [19.8, 7.5],
    [27, 12.6],
    [35, 19.4],
    [43.5, 27.8],
    [53, 38.2],
    [66, 54.1],
    [81, 73.8],
    [100, 100],
  ],
  "ease-in-out": [
    [0, 100],
    [7.7, 95.8],
    [14.8, 83.7],
    [21, 68.2],
    [26.5, 53.9],
    [31.4, 41.4],
    [35.9, 30.7],
    [40.1, 22],
    [44.2, 15.3],
    [48.1, 10.2],
    [52, 10.2],
    [56, 15.3],
    [60.1, 22],
    [64.3, 30.7],
    [68.8, 41.4],
    [73.7, 53.9],
    [79.2, 68.2],
    [85.4, 83.7],
    [92.5, 95.8],
    [100, 0],
  ],
};

/**
 * Builds a `linear-gradient()` string with eased color stops using `color-mix()`.
 * Fully theme-safe: accepts CSS custom properties as `from`/`to` and the browser
 * resolves them at paint time.
 */
export function easedGradient(
  direction: string,
  from: string,
  to: string,
  easing: GradientEasing = "ease-out",
): string {
  const stops = STOPS[easing].map(([pos, mix]) => {
    if (mix === 100) return `${from} ${pos}%`;
    if (mix === 0) return `${to} ${pos}%`;
    return `color-mix(in srgb, ${from} ${mix}%, ${to}) ${pos}%`;
  });
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}
