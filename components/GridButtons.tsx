'use client';

import React from 'react';
import Link from 'next/link';
import { VIDEO_SHELL } from '@/lib/constants';

export default function GridButtons() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex justify-center py-1.5 md:py-2 relative z-[100]">
      <div className={`${VIDEO_SHELL} relative font-sans`}>
        {/* Dark bar matching the navbar/video window style */}
        <div className="relative border border-red-600/55 bg-gradient-to-b from-slate-900 via-slate-950 to-black px-3 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.5)] backdrop-blur-md">
          {/* Blue-white-red stripe — sticks out left (blue) and right (red) beyond the buttons */}
          <div
            className="pointer-events-none absolute -inset-x-1 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            aria-hidden
          />
          <div className="relative z-10 flex w-full flex-row items-stretch justify-center gap-1.5 sm:gap-2">
            <Link
              href="/basic"
              onClick={scrollToTop}
              className="group flex min-h-[28px] h-7 min-w-0 flex-1 basis-0 items-center justify-center rounded-none border border-white bg-blue-600 px-1 text-[10px] font-bold tracking-normal text-white shadow-[0_0_10px_rgba(37,99,235,0.35)] transition-all hover:bg-blue-700 active:scale-[0.99] sm:text-xs"
            >
              2 Grids Boxes
            </Link>
            <Link
              href="/premium"
              onClick={scrollToTop}
              className="group flex min-h-[28px] h-7 min-w-0 flex-1 basis-0 items-center justify-center rounded-none border border-white bg-red-600 px-1 text-[10px] font-bold tracking-normal text-white shadow-[0_0_10px_rgba(220,38,38,0.35)] transition-all hover:bg-red-700 active:scale-[0.99] sm:text-xs"
            >
              10 Grids Boxes
            </Link>
            <Link
              href="/yearly"
              onClick={scrollToTop}
              className="group flex min-h-[28px] h-7 min-w-0 flex-1 basis-0 items-center justify-center rounded-none border border-white bg-amber-500 px-1 text-[10px] font-bold tracking-normal text-white shadow-[0_0_10px_rgba(245,158,11,0.35)] transition-all hover:bg-amber-600 active:scale-[0.99] sm:text-xs"
            >
              20 Grids Boxes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
