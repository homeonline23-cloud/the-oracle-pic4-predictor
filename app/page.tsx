'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import GridButtons from '@/components/GridButtons';
import PageHeader from '@/components/PageHeader';
import SiteDisclaimer from '@/components/SiteDisclaimer';
import { VIDEO_SHELL, WINDOW_OUTER_SHELL, WINDOW_INNER_FRAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function HomePage() {
  useScrollReveal();

  return (
    <main className="relative flex w-full min-w-0 flex-grow flex-col items-center overflow-x-hidden p-0 pb-0 pt-0 font-sans transition-all duration-500">
      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Video Section - Moved to top of content */}
        <PageHeader showHeroTitleCard />

        {/* Grid Navigation Section */}
        <div className="mb-4 md:mb-8 w-full">
          <GridButtons />
        </div>
        
        {/* Welcome Section — same width as hero video + GridButtons (VIDEO_SHELL / max-w-3xl). */}
        <div className={`${VIDEO_SHELL} mb-6`}>
          <div className="relative group">
            <div className="pointer-events-none absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 rounded-none blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
            <div
              className={cn(
                'relative rounded-none bg-slate-900/20 p-1 backdrop-blur-sm md:p-2 min-h-0',
                WINDOW_OUTER_SHELL
              )}
            >
              <div className="relative bg-slate-950/40 backdrop-blur-xl rounded-none p-4 md:p-12 h-auto flex flex-col">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-baseline justify-center">
                      <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">Welcome</span>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-300 text-3xl md:text-4xl animate-pulse drop-shadow-[0_0_15px_rgba(96,165,250,0.8)] ml-1 inline-block scale-y-125 origin-bottom">!</span>
                    </h2>
                    <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-white to-red-600 mx-auto mt-6 rounded-none opacity-80"></div>
                  </motion.div>

                  <div className="space-y-6 text-center text-slate-300 text-[11px] md:text-sm leading-relaxed max-w-2xl font-medium">
                    <p className="text-balance">
                      The Oracle is designed to make number review easier by presenting historical results in a clear, grid-based layout. It helps users compare patterns across draws, spot repeated structures, and follow changes over time in a simple visual format. The experience is built around organization, readability, and pattern awareness rather than speculation.
                    </p>
                    <p className="text-balance">
                      It focuses on pattern detection, frequency analysis, and visual comparison across grid cycles. As numbers move through the system, the Oracle highlights repeatable structures, mirrored digit relationships, and other data points that may be useful for review. Whether you are looking at red and blue cycle changes or movement across the grids, the goal is to make number analysis more structured and easier to understand.
                    </p>
                    <div className="w-full max-w-3xl mx-auto space-y-3 px-1 sm:px-2 pt-2 md:pt-4">
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={cn(
                          'relative w-full overflow-hidden rounded-none bg-black/45',
                          WINDOW_INNER_FRAME
                        )}
                      >
                        <Image
                          src="/pick4-lottery-predictor-promo.png"
                          alt="The Oracle Pic 4: grid-based number review and pattern visualization for informational and entertainment purposes only."
                          width={1200}
                          height={1200}
                          sizes="(max-width:768px) 100vw, min(896px, 90vw)"
                          className="w-full h-auto object-contain select-none pointer-events-none"
                          referrerPolicy="no-referrer"
                          priority={false}
                        />
                      </motion.div>
                      <SiteDisclaimer className="mt-0 px-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
