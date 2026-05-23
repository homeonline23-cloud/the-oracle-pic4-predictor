'use client';

import AnchorConnectorLines from '@/components/AnchorConnectorLines';
import {
  formatAnchorLegend,
  RED_ANCHOR_DAY_ZERO,
  BLUE_ANCHOR_DAY_ZERO,
  type SubtractCircleAnchors,
} from '@/lib/subtractCircles';

type Props = {
  anchors: SubtractCircleAnchors;
  mounted: boolean;
  showLegend?: boolean;
  className?: string;
};

/**
 * RED (left): top digit over bottom — e.g. 7 over 2
 * BLUE (right): top digit over bottom — e.g. 8 over 3
 */
export default function AnchorSubtractionCircles({
  anchors,
  mounted,
  showLegend = false,
  className = '',
}: Props) {
  const redTop = mounted ? anchors.anchorRedTop : RED_ANCHOR_DAY_ZERO.top;
  const redBottom = mounted ? anchors.anchorRedBottom : RED_ANCHOR_DAY_ZERO.bottom;
  const blueTop = mounted ? anchors.anchorBlueTop : BLUE_ANCHOR_DAY_ZERO.top;
  const blueBottom = mounted ? anchors.anchorBlueBottom : BLUE_ANCHOR_DAY_ZERO.bottom;

  const legend = formatAnchorLegend(
    mounted
      ? anchors
      : {
          anchorRedTop: RED_ANCHOR_DAY_ZERO.top,
          anchorRedBottom: RED_ANCHOR_DAY_ZERO.bottom,
          anchorBlueTop: BLUE_ANCHOR_DAY_ZERO.top,
          anchorBlueBottom: BLUE_ANCHOR_DAY_ZERO.bottom,
        }
  );

  return (
    <>
      <div
        dir="ltr"
        className={`relative flex h-24 w-[11.5rem] scale-90 items-center justify-between sm:w-[13rem] sm:scale-100 ${className}`}
      >
        <AnchorConnectorLines />

        {/* RED circle — 7 over 2 */}
        <div
          className="relative z-10 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-red-600 bg-transparent text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          title={`RED: ${redTop} (top) and ${redBottom} (bottom)`}
        >
          <span className="text-lg font-bold leading-none">{redTop}</span>
          <span className="text-lg font-bold leading-none">-</span>
          <span className="text-lg font-bold leading-none">{redBottom}</span>
        </div>

        {/* BLUE circle — 8 over 3 */}
        <div
          className="relative z-10 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-blue-600 bg-transparent text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.35)]"
          title={`BLUE: ${blueTop} (top) and ${blueBottom} (bottom)`}
        >
          <span className="text-lg font-bold leading-none">{blueTop}</span>
          <span className="text-lg font-bold leading-none">-</span>
          <span className="text-lg font-bold leading-none">{blueBottom}</span>
        </div>
      </div>

      {showLegend && (
        <p className="mb-3 text-center text-[9px] font-bold tracking-wide text-slate-800 sm:text-[10px]">
          <span className="text-red-700">{legend.red}</span>
          <span className="mx-1.5 text-slate-500 sm:mx-2">|</span>
          <span className="text-blue-700">{legend.blue}</span>
        </p>
      )}
    </>
  );
}
