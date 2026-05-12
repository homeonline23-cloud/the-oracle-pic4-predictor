'use client';

import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

/**
 * Responsible-play copy with site RWB divider + light motion (Evidence page, below grids).
 */
export default function PlayResponsiblyBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 border-t border-white/5 pt-4 pb-2 md:mt-8 md:pt-5 md:pb-3"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-2 md:px-4">
        <div
          aria-hidden
          className="mx-2 h-0.5 w-full rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_12px_rgba(255,255,255,0.22)] md:mx-4"
        />
        <div
          className="mt-3 flex flex-wrap items-center justify-center gap-2 px-1 text-center sm:gap-3 md:mt-4 md:gap-4 animate-pulse"
          role="note"
        >
          <AlertTriangle
            size={18}
            className="shrink-0 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            aria-hidden
          />
          <p className="max-w-[min(100%,22rem)] text-center text-[10px] font-bold leading-snug tracking-wide text-amber-300 text-balance drop-shadow-[0_0_14px_rgba(251,191,36,0.35)] sm:max-w-lg sm:text-[11px] md:text-xs">
            Play carefully and only with money you can afford to{'\u00A0'}lose.
          </p>
          <AlertTriangle
            size={18}
            className="shrink-0 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
            aria-hidden
          />
        </div>
      </div>
    </motion.div>
  );
}
