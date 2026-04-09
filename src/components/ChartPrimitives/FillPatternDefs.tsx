export function FillPatternDefs({ prefix }: { prefix: string }) {
  return (
    <>
      <pattern
        id={`${prefix}-pat-dotted`}
        x={0}
        y={0}
        width={4}
        height={4}
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
      >
        <circle cx={2} cy={2} r={0.9} fill="var(--util-subtle-inverse-strongest)" />
      </pattern>
      <pattern
        id={`${prefix}-pat-hatch-right`}
        patternUnits="userSpaceOnUse"
        width={2}
        height={6}
        patternTransform="rotate(-45 2 2)"
      >
        <path d="M -1,2 l 6,0" stroke="var(--util-subtle-inverse-strongest)" strokeWidth={1} />
      </pattern>
      <pattern
        id={`${prefix}-pat-hatch-left`}
        patternUnits="userSpaceOnUse"
        width={2}
        height={6}
        patternTransform="rotate(45 2 2)"
      >
        <path d="M -1,2 l 6,0" stroke="var(--util-subtle-inverse-strongest)" strokeWidth={1} />
      </pattern>
    </>
  );
}
