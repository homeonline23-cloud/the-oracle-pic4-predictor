'use client';

import Image from 'next/image';
import { PUBLIC_LOGO_VIDEO_OVERLAY, PUBLIC_WORLD_GLOBE_IMAGE } from '@/lib/constants';

/** Sharp title card over the hero video — crisp HTML text (not baked into the video). */
export default function HeroVideoTitleOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center px-3 text-center md:px-6"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />

      <div className="relative flex w-full max-w-4xl flex-col items-center gap-1.5 md:gap-2.5 rounded-none bg-black/25 px-3 py-3 md:px-6 md:py-4">
        <div className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5">
          <Image
            src={PUBLIC_LOGO_VIDEO_OVERLAY}
            alt=""
            width={512}
            height={512}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10 md:h-12 md:w-12 [image-rendering:-webkit-optimize-contrast]"
            priority
          />
          <h1 className="flex flex-wrap items-baseline justify-center gap-x-1.5 md:gap-x-2">
            <span className="text-[1.35rem] font-black uppercase tracking-tight text-white subpixel-antialiased sm:text-3xl md:text-4xl lg:text-[2.75rem] [text-shadow:0_2px_0_rgba(0,0,0,1),0_0_1px_rgba(0,0,0,1)]">
              THE
            </span>
            <span className="text-[1.35rem] font-black uppercase tracking-tight text-blue-400 subpixel-antialiased sm:text-3xl md:text-4xl lg:text-[2.75rem] [text-shadow:0_2px_0_rgba(0,0,0,1),0_0_1px_rgba(0,0,0,1)]">
              ORACLE
            </span>
            <span className="text-[1.35rem] font-black uppercase tracking-tight text-red-500 subpixel-antialiased sm:text-3xl md:text-4xl lg:text-[2.75rem] [text-shadow:0_2px_0_rgba(0,0,0,1),0_0_1px_rgba(0,0,0,1)]">
              PIC 4
            </span>
          </h1>
        </div>

        <p className="text-lg font-bold text-white subpixel-antialiased md:text-2xl lg:text-3xl [text-shadow:0_2px_0_rgba(0,0,0,1),0_0_1px_rgba(0,0,0,1)]">
          Predictor
        </p>

        <p className="flex items-center justify-center gap-2 text-sm font-bold text-white subpixel-antialiased md:gap-2.5 md:text-lg lg:text-xl [text-shadow:0_1px_0_rgba(0,0,0,1)]">
          <span>The World</span>
          <Image
            src={PUBLIC_WORLD_GLOBE_IMAGE}
            alt=""
            width={48}
            height={48}
            className="inline-block h-6 w-6 shrink-0 object-contain md:h-7 md:w-7 [image-rendering:-webkit-optimize-contrast]"
            priority
          />
          <span>Globally</span>
        </p>

        <blockquote className="mt-0.5 max-w-3xl space-y-0 px-1 text-[9px] font-semibold leading-snug text-white/95 subpixel-antialiased sm:text-[10px] md:mt-1 md:text-sm md:leading-relaxed lg:text-base [text-shadow:0_1px_2px_rgba(0,0,0,1)]">
          <p>
            &ldquo;Billions of dreams, millions of plays. One{' '}
            <span className="font-bold text-red-400">Pic 4</span>
          </p>
          <p>that changes everything — aligned in numbers where</p>
          <p>
            every <span className="font-bold text-red-400">Pic 4</span> holds the power to change
            your destiny&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  );
}
