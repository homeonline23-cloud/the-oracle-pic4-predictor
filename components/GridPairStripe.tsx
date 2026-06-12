'use client';

interface GridPairStripeProps {
  pairNumber: number;
}

export default function GridPairStripe({ pairNumber }: GridPairStripeProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
      <div className="relative flex items-center justify-between">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-[10px] font-bold text-blue-700 shadow-sm sm:h-6 sm:w-6 sm:text-xs"
          aria-label={`Pair ${pairNumber} blue line`}
        >
          {pairNumber}
        </span>
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-red-600 bg-white text-[10px] font-bold text-red-700 shadow-sm sm:h-6 sm:w-6 sm:text-xs"
          aria-label={`Pair ${pairNumber} red line`}
        >
          {pairNumber}
        </span>
      </div>
    </div>
  );
}
