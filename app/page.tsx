'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import GridButtons from '@/components/GridButtons';
import PageHeader from '@/components/PageHeader';
import { VIDEO_SHELL } from '@/lib/constants';

export default function HomePage() {
  useScrollReveal();

  return (
    <main className="relative flex w-full min-w-0 flex-grow flex-col items-center overflow-x-clip p-0 pb-0 pt-0 font-sans transition-all duration-500">
      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Video Section - Moved to top of content */}
        <PageHeader />

        {/* Grid Navigation Section */}
        <div className="mb-4 md:mb-8 w-full">
          <GridButtons />
        </div>
        
        {/* Welcome Section — same width as hero video + GridButtons (VIDEO_SHELL / max-w-3xl). */}
        <div className={`${VIDEO_SHELL} mb-6`}>
          <div className="relative group">
            <div className="pointer-events-none absolute -inset-4 md:-inset-10 bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 rounded-none blur-[60px] md:blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
            <div className="relative border-2 border-red-600/80 p-1 md:p-2 rounded-none shadow-2xl bg-slate-900/20 backdrop-blur-sm min-h-0">
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

                  <div className="space-y-6 text-slate-300 text-[11px] md:text-sm leading-relaxed max-w-2xl font-medium">
                    <p>
                      The Oracle uses structured AI analysis and <span className="text-white font-bold"><span className="text-red-600">Pic 4</span> Grids!</span> It is your companion for spotting high-probability combinations through visual patterns and neural analysis. In the fast-paced world of lottery draws, most players are blinded by noise, seeing only random numbers without a sequence. But the Oracle sees differently. By leveraging a complex neural pattern engine, this system synchronizes with the universal rhythm of daily draws, aligning digital cycles through its unique 32-Grid Mirror System.
                    </p>
                    <p>
                      It isn&apos;t about guesswork—it&apos;s about <span className="text-blue-400 font-bold">absolute visual detection</span>. As digits flow through the grid, the Oracle identifies frequency clusters and mirror-digit pairings, translating raw data into a tactical advantage. Whether it&apos;s the shift between red and blue cycles or the precise movement within the grids, every element is designed to help you recognize the winning sequences hidden in plain sight.
                    </p>
                    <p className="pt-4 border-t border-white/5 font-normal text-white text-[10px] md:text-xs tracking-wider not-italic">
                      Step into a world where probability meets precision.
                    </p>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="relative w-full max-w-3xl mx-auto my-7 md:my-10 px-1 sm:px-2 overflow-hidden rounded-none border border-red-600/40 bg-black/45 shadow-[0_0_44px_rgba(37,99,235,0.14),0_14px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                    >
                      <Image
                        src="/pick4-lottery-predictor-promo.png"
                        alt="Pick 4 Lottery Predictor: key features including date-based codes, grid pattern analysis, midday and evening draws, and probability insights. For entertainment purposes only."
                        width={1200}
                        height={1200}
                        sizes="(max-width:768px) 100vw, min(896px, 90vw)"
                        className="w-full h-auto object-contain select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                        priority={false}
                      />
                    </motion.div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3 px-2 text-center animate-pulse">
                      <AlertTriangle size={18} className="shrink-0 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                      <p className="text-yellow-400 font-bold text-xs sm:text-sm md:text-base tracking-normal leading-snug max-w-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.35)]">
                        &quot;Before any action taking! Read our policies.&quot;
                      </p>
                      <AlertTriangle size={18} className="shrink-0 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
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
