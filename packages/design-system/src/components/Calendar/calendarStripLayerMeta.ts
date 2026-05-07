/** Mirrors CalendarDateCell bridge/tint math so Calendar can detect strip seams vs neighbors. */
export type StripLayerCellFlags = {
  selected?: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange0?: boolean;
  range0Start?: boolean;
  range0End?: boolean;
  inRange1?: boolean;
  range1Start?: boolean;
  range1End?: boolean;
  bothRanges?: boolean;
  inPreview?: boolean;
  previewStart?: boolean;
  previewEnd?: boolean;
};

export type StripLayerMetaOptions = {
  mode: "single" | "range" | "dual-range";
  previewEndpointsNeutral?: boolean;
};

export type StripLayerMeta = {
  brandEndpoint: boolean;
  neutralEndpoint: boolean;
  isStripInterior: boolean;
  startBridge: boolean;
  endBridge: boolean;
  showRangeLayer: boolean;
  tintNeutral: boolean;
  tintBrand: boolean;
};

export function getStripLayerMeta(
  flags: StripLayerCellFlags,
  { mode, previewEndpointsNeutral = false }: StripLayerMetaOptions,
): StripLayerMeta {
  if (mode === "single") {
    return {
      brandEndpoint: !!flags.selected,
      neutralEndpoint: false,
      isStripInterior: false,
      startBridge: false,
      endBridge: false,
      showRangeLayer: false,
      tintNeutral: false,
      tintBrand: false,
    };
  }

  const {
    selected = false,
    inRange = false,
    rangeStart = false,
    rangeEnd = false,
    inRange0 = false,
    range0Start = false,
    range0End = false,
    inRange1 = false,
    range1Start = false,
    range1End = false,
    bothRanges = false,
    inPreview = false,
    previewStart = false,
    previewEnd = false,
  } = flags;

  const committedBrandEndpoint =
    !!selected || !!rangeStart || !!rangeEnd || !!range0Start || !!range0End;
  const committedNeutralEndpoint =
    !committedBrandEndpoint && !!(range1Start || range1End);

  const previewSolidBrandEndpoint =
    !committedBrandEndpoint &&
    !committedNeutralEndpoint &&
    !!inPreview &&
    (previewStart || previewEnd) &&
    !previewEndpointsNeutral;
  const previewSolidNeutralEndpoint =
    !committedBrandEndpoint &&
    !committedNeutralEndpoint &&
    !!inPreview &&
    (previewStart || previewEnd) &&
    previewEndpointsNeutral;

  const brandEndpoint = committedBrandEndpoint || previewSolidBrandEndpoint;
  const neutralEndpoint = committedNeutralEndpoint || previewSolidNeutralEndpoint;

  const startBridge =
    (!!rangeStart && !rangeEnd) ||
    (!!range0Start && !range0End) ||
    (!!range1Start && !range1End) ||
    (!!inPreview && !!previewStart && !previewEnd);

  const endBridge =
    (!!rangeEnd && !rangeStart) ||
    (!!range0End && !range0Start) ||
    (!!range1End && !range1Start) ||
    (!!inPreview && !!previewEnd && !previewStart);

  const isStripInterior =
    !brandEndpoint &&
    !neutralEndpoint &&
    !startBridge &&
    !endBridge &&
    !!(inRange || inRange0 || inRange1 || bothRanges || (inPreview && !(previewStart || previewEnd)));

  const showRangeLayer = startBridge || endBridge || isStripInterior;

  const tintNeutral =
    (!!inRange1 && !inRange0 && !inRange && (isStripInterior || startBridge || endBridge)) ||
    (!!range1Start && !range1End && startBridge && !rangeStart && !range0Start) ||
    (!!range1End && !range1Start && endBridge && !rangeEnd && !range0End) ||
    (previewEndpointsNeutral && !!inPreview && (isStripInterior || startBridge || endBridge));

  const tintBrand = showRangeLayer && !tintNeutral;

  return {
    brandEndpoint,
    neutralEndpoint,
    isStripInterior,
    startBridge,
    endBridge,
    showRangeLayer,
    tintNeutral,
    tintBrand,
  };
}
