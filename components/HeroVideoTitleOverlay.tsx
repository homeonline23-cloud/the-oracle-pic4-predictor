'use client';

import Image from 'next/image';
import { PUBLIC_LOGO_VIDEO_OVERLAY } from '@/lib/constants';

/**
 * Sharp title card over the hero video — matches the Oracle Pic 4 Predictor intro layout.
 */
export default function HeroVideoTitleOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center px-3 text-center md:px-6"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-transparent to-slate-950/35" />

      <div className="relative flex w-full max-w-4xl flex-col items-center gap-2 md:gap-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
          <Image
            src={PUBLIC_LOGO_VIDEO_OVERLAY}
            alt=""
            width={512}
            height={512}
            className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 [image-rendering:-webkit-optimize-contrast]"
            priority
          />
          <h1 className="flex flex-wrap items-baseline justify-center gap-x-1.5 md:gap-x-2.5">
            <span className="text-2xl font-black uppercase tracking-tight text-white antialiased drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl lg:text-5xl">
              THE
            </span>
            <span className="text-2xl font-black uppercase tracking-tight text-blue-500 antialiased drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl lg:text-5xl">
              ORACLE
            </span>
            <span className="text-2xl font-black uppercase tracking-tight text-red-500 antialiased drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl lg:text-5xl">
              PIC 4
            </span>
          </h1>
        </div>

        <p className="text-base font-bold italic text-white antialiased drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] md:text-2xl lg:text-3xl">
          Predictor
        </p>

        <p className="text-sm font-bold text-white antialiased drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] md:text-xl lg:text-2xl">
          The World <span aria-hidden>🌍</span> Globally
        </p>

        <blockquote className="mt-1 max-w-3xl space-y-0.5 px-2 text-[11px] font-medium leading-snug text-white antialiased drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] sm:text-sm md:mt-2 md:text-base md:leading-relaxed lg:text-lg">
          <p>
            &ldquo;Billions of dreams, millions of plays. One{' '}
            <span className="font-bold italic text-red-500">Pic 4</span>
          </p>
          <p>that changes everything, That aligned in numbers where</p>
          <p>
            every <span className="font-bold italic text-red-500">Pic 4</span> holds the power to
            change your destiny&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  );
}
