'use client';

import Image from 'next/image';
import { Target, Cpu, Database, ShieldCheck, Globe } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import { PUBLIC_THE_SYSTEM_ROBOT_IMAGE, PUBLIC_THE_ORACLE_1_IMAGE } from '@/lib/constants';

/** Full-width blue–white–red divider between major “windows” (balanced vertical padding). */
function SectionStripe() {
  return (
    <div className="shrink-0 px-3 py-4 md:px-5 md:py-5" role="separator" aria-hidden>
      <div className="h-0.5 w-full rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
    </div>
  );
}

export default function AboutPage() {
  useScrollReveal();

  const featureCards = [
    {
      title: 'AI Analysis',
      desc: 'Predictive algorithms that scan 4-digit draw histories to find frequency clusters.',
      icon: <Cpu className="h-6 w-6 text-blue-500" />,
    },
    {
      title: 'Grid Engine',
      desc: 'A 32-grid system that visually pairs digits with their mirror counterparts.',
      icon: <Target className="h-6 w-6 text-red-500" />,
    },
    {
      title: 'State-Scoped',
      desc: 'Specific logic for New York, Florida, Texas, Georgia, and other major lotteries.',
      icon: <Globe className="h-6 w-6 text-emerald-500" />,
    },
    {
      title: 'Data Integrity',
      desc: 'Encryption-backed database architecture ensuring secure, private analysis.',
      icon: <Database className="h-6 w-6 text-amber-500" />,
    },
  ] as const;

  return (
    <div className="pb-0 pt-4 flex flex-col items-center text-center">
      <PageHeader />

      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>

      <div className="max-w-3xl mx-auto px-2 md:px-6 w-full text-left">
        {/* The Window Container - Styled exactly like the Welcome! window */}
        <div className="relative">
          <div className="relative group">
            {/* Outer Glow / Blur */}
            <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 rounded-none blur-[100px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
            
            {/* Red Border Layer / Outer Window */}
            <div className="relative border-2 border-red-600/80 p-2 rounded-none shadow-2xl overflow-hidden bg-slate-900/20 backdrop-blur-sm">
              
              {/* Content Box — single symmetric gutter so every inner panel lines up */}
              <div className="relative bg-slate-950/40 px-5 py-8 backdrop-blur-xl md:px-8 rounded-none">
                <div className="flex flex-col">
                  {/* System architecture heading — above robot image only */}
                  <div className="w-full text-center">
                    <h3 className="mb-4 bg-gradient-to-r from-red-600 via-white to-blue-600 bg-clip-text text-base font-bold leading-relaxed tracking-normal text-transparent drop-shadow-sm md:text-xl">
                      The System Architecture
                    </h3>
                    <div className="mb-4 h-0.5 w-full rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)] md:mb-5" />
                    <div className="relative w-full overflow-hidden rounded-none border border-blue-500/20 bg-black/35 shadow-[0_0_44px_rgba(37,99,235,0.12)]">
                      <Image
                        src={PUBLIC_THE_SYSTEM_ROBOT_IMAGE}
                        alt="The Oracle Pic 4 system architecture — layered robot analysis and grid engine."
                        width={1200}
                        height={800}
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="pointer-events-none h-auto w-full select-none object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <SectionStripe />

                  {/* Core Analytics Engine — blue window (below robot image) */}
                  <div className="relative overflow-hidden rounded-none border border-blue-500/20 bg-[#00004d]/50 p-6 backdrop-blur-sm md:p-8">
                    <div className="absolute top-0 right-0 h-64 w-64 rounded-none bg-blue-600/10 blur-[100px]"></div>
                    <div className="relative z-10">
                      <h3 className="mb-4 inline-block text-lg font-bold tracking-normal text-white">
                        Core Analytics Engine
                      </h3>
                      <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-300 md:text-sm">
                        <p>
                          The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor takes the guesswork out of the <span className="text-red-600 font-bold">Pic 4</span> Grids system! 
                          This AI-powered platform is your smart companion for analyzing number patterns and helping you spot high-probability combinations. Instead of relying purely on luck, the system combines <strong className="text-white font-bold">structured grids</strong> with <strong className="text-white font-bold">AI-powered analysis</strong> to help you visualize patterns and trends that may appear in upcoming draws.
                        </p>
                        <p>
                          Most people see <span className="text-red-600 font-bold">Pic 4</span> as chance—random, unpredictable. But here, in these Grids, something different happens. As soon as the winning numbers are placed, distinct patterns reveal themselves across all of the grids. All numbers inside those Grids are the playing winning numbers, just waiting to be recognized by you. It’s like the universe whispering its secrets: The winning numbers are hiding somewhere between these patterns and helping you spot high-probability combinations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <SectionStripe />

                  {/* The Oracle-1 — sits above AI Analysis & Grid Engine card row */}
                  <div className="relative w-full overflow-hidden rounded-none border border-blue-500/20 bg-black/35 shadow-[0_0_44px_rgba(37,99,235,0.12)]">
                    <Image
                      src={PUBLIC_THE_ORACLE_1_IMAGE}
                      alt="The Oracle-1 — Pic 4 prediction AI and grid pattern visualization."
                      width={1200}
                      height={675}
                      sizes="(max-width: 768px) 100vw, 672px"
                      className="pointer-events-none h-auto w-full select-none object-cover object-center md:object-contain aspect-video"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <SectionStripe />

                  {/* Grid Section — row 1 (AI + Grid Engine), stripe, row 2 (State + Data) */}
                  <div className="relative flex w-full flex-col">
                    <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      {featureCards.slice(0, 2).map((item) => (
                        <div
                          key={item.title}
                          className="group/card flex h-full min-h-[9.5rem] flex-col rounded-none border border-blue-500/20 bg-[#00004d]/60 p-6 transition-all backdrop-blur-sm hover:border-blue-500/40 hover:bg-[#00004d]/80 md:p-7"
                        >
                          <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-white/5 bg-slate-900 transition-all group-hover/card:scale-110 group-hover/card:border-white/10">
                            <div className="scale-75">{item.icon}</div>
                          </div>
                          <h3 className="mb-2 text-base font-bold tracking-normal text-white">{item.title}</h3>
                          <p className="text-xs font-medium leading-relaxed text-slate-400 opacity-90 md:text-sm">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                    <SectionStripe />
                    <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                      {featureCards.slice(2).map((item) => (
                        <div
                          key={item.title}
                          className="group/card flex h-full min-h-[9.5rem] flex-col rounded-none border border-blue-500/20 bg-[#00004d]/60 p-6 transition-all backdrop-blur-sm hover:border-blue-500/40 hover:bg-[#00004d]/80 md:p-7"
                        >
                          <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-white/5 bg-slate-900 transition-all group-hover/card:scale-110 group-hover/card:border-white/10">
                            <div className="scale-75">{item.icon}</div>
                          </div>
                          <h3 className="mb-2 text-base font-bold tracking-normal text-white">{item.title}</h3>
                          <p className="text-xs font-medium leading-relaxed text-slate-400 opacity-90 md:text-sm">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <SectionStripe />

                  {/* Geo Definition — aligned padding/stripe family with Core Analytics */}
                  <div className="relative overflow-hidden rounded-none border border-blue-500/20 bg-[#00004d]/50 p-6 backdrop-blur-sm md:p-8">
                    <div className="absolute inset-0 bg-blue-600/5"></div>
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center gap-2 justify-center md:justify-start">
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                        <h2 className="text-lg font-bold tracking-normal text-white">Geo Definition</h2>
                      </div>
                      <p className="text-xs font-medium leading-relaxed text-slate-300 md:text-sm text-center md:text-left">
                        &quot;The Oracle <span className="text-red-600 font-bold">Pic 4</span> is an AI-powered Pick 4 lottery prediction system that uses a 32-grid pattern engine and historical draw data to identify high-probability number combinations across all US Daily 4 games.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
