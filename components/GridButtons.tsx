'use client';

import React from 'react';
import Link from 'next/link';
import { NAV_BAND_FILL, NAV_BAND_SHELL, VIDEO_SHELL } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function GridButtons() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex justify-center py-1.5 md:py-2 relative z-[100]">
      <div className={`${VIDEO_SHELL} relative font-sans`}>
        {/* Dark bar matching the navbar/video window style */}
        <div
          className={cn(
            'relative px-2 py-1.5 sm:px-3 sm:py-2',
            NAV_BAND_FILL,
            NAV_BAND_SHELL
          )}
        >
          {/* Blue-white-red stripe — sticks out left (blue) and right (red) beyond the buttons */}
          <div
            className="pointer-events-none absolute -inset-x-1 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            aria-hidden
          />
          <div className="relative z-10 flex w-full flex-row items-stretch justify-center gap-1 md:gap-2">
            <Link
              href="/basic"
              onClick={scrollToTop}
              title="4 Grids Boxes"
              aria-label="4 Grids Boxes"
              className="group flex h-7 min-h-[28px] min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-none border border-white bg-blue-600 px-1 text-[9px] font-bold leading-none tracking-tight text-white shadow-[0_0_10px_rgba(37,99,235,0.35)] transition-all hover:bg-blue-700 active:scale-[0.99] max-md:text-[9px] md:text-xs"
            >
              <span className="md:hidden">4 Grids</span>
              <span className="hidden md:inline">4 Grids Boxes</span>
            </Link>
            <Link
              href="/premium"
              onClick={scrollToTop}
              title="10 Grids Boxes"
              aria-label="10 Grids Boxes"
              className="group flex h-7 min-h-[28px] min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-none border border-white bg-red-600 px-1 text-[9px] font-bold leading-none tracking-tight text-white shadow-[0_0_10px_rgba(220,38,38,0.35)] transition-all hover:bg-red-700 active:scale-[0.99] max-md:text-[9px] md:text-xs"
            >
              <span className="md:hidden">10 Grids</span>
              <span className="hidden md:inline">10 Grids Boxes</span>
            </Link>
            <Link
              href="/yearly"
              onClick={scrollToTop}
              title="20 Grids Boxes"
              aria-label="20 Grids Boxes"
              className="group flex h-7 min-h-[28px] min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-none border border-white bg-amber-500 px-1 text-[9px] font-bold leading-none tracking-tight text-white shadow-[0_0_10px_rgba(245,158,11,0.35)] transition-all hover:bg-amber-600 active:scale-[0.99] max-md:text-[9px] md:text-xs"
            >
              <span className="md:hidden">20 Grids</span>
              <span className="hidden md:inline">20 Grids Boxes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
