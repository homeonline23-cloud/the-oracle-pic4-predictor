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
 * RED (left): top digit over bottom — e.g. 0 over 5
 * BLUE (right): top digit over bottom — e.g. 1 over 6
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
        className={`relative flex h-[6.75rem] w-[12.75rem] items-center justify-between sm:h-24 sm:w-[13rem] ${className}`}
      >
        <AnchorConnectorLines />

        {/* RED circle — 0 over 5 */}
        <div
          className="relative z-10 flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0 rounded-full border-[5px] border-red-600 bg-transparent text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] sm:h-16 sm:w-16 sm:border-[6px]"
          title={`RED: ${redTop} (top) and ${redBottom} (bottom)`}
        >
          <span className="text-base font-bold leading-none sm:text-lg">{redTop}</span>
          <span className="text-[9px] font-bold leading-none sm:text-sm">-</span>
          <span className="text-base font-bold leading-none sm:text-lg">{redBottom}</span>
        </div>

        {/* BLUE circle — 1 over 6 */}
        <div
          className="relative z-10 flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0 rounded-full border-[5px] border-blue-600 bg-transparent text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.35)] sm:h-16 sm:w-16 sm:border-[6px]"
          title={`BLUE: ${blueTop} (top) and ${blueBottom} (bottom)`}
        >
          <span className="text-base font-bold leading-none sm:text-lg">{blueTop}</span>
          <span className="text-[9px] font-bold leading-none sm:text-sm">-</span>
          <span className="text-base font-bold leading-none sm:text-lg">{blueBottom}</span>
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
