'use client';

import Image from 'next/image';
import { BrainCircuit, LayoutGrid, History, Database, ShieldCheck, Target, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { PUBLIC_THE_ORACLE_2_IMAGE, WINDOW_OUTER_SHELL, PANEL_EDGE_GLOW, WINDOW_PANEL_OUTER, WINDOW_PANEL_INNER } from '@/lib/constants';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import SiteDisclaimer from '@/components/SiteDisclaimer';

/** Blue–white–red divider between methodology “windows” (balanced vertical padding). */
function MethodologyStripe() {
  return (
    <div className="shrink-0 overflow-hidden py-3 md:py-4" role="separator" aria-hidden>
      <div className="h-0.5 w-full max-w-full rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
    </div>
  );
}

export default function HowItWorksPage() {
  useScrollReveal();

  const steps = [
    {
      title: "Data Aggregation",
      icon: <Database className="w-6 h-6 text-blue-500" />,
      color: "blue",
      desc: "The AI Predictor memorizes every winning number implemented by our members, inputting verified data directly into its neural memory bank for absolute pattern synchronization."
    },
    {
      title: "Pattern Recognition",
      icon: <History className="w-6 h-6 text-red-500" />,
      color: "red",
      desc: "Advanced algorithms identify 'clusters' where certain digit sequences repeat. We look for the 'hot' streaks and the 'due' variations that the human eye misses."
    },
    {
      title: "Grid Synthesis",
      icon: <LayoutGrid className="w-6 h-6 text-amber-500" />,
      color: "amber",
      desc: "Dual grids generate unique patterns that synchronize with winning numbers to reveal perfectly ordered sequences via the Mirror System."
    },
    {
      title: "AI Validation",
      icon: <BrainCircuit className="w-6 h-6 text-emerald-500" />,
      color: "emerald",
      desc: "Every prediction undergoes simulated backtesting against recent history to ensure maximum probability before system output."
    }
  ];

  return (
    <div className="pb-0 pt-4 flex flex-col items-center">
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>

      <div className="max-w-3xl mx-auto px-2 md:px-6 w-full">
        <div className="relative group">
          {/* Ambient Glows */}
          <div className={PANEL_EDGE_GLOW}></div>
          
          <div
            className={cn(
              WINDOW_PANEL_OUTER,
              WINDOW_OUTER_SHELL
            )}
          >
            <div className={cn(WINDOW_PANEL_INNER, 'px-5 pb-5 pt-8 md:px-8 md:pb-6')}>
              <div className="mb-6 h-0.5 w-full rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80"></div>
              <div className="mb-8 text-center">
                <h1 className="mb-3 text-2xl font-bold tracking-normal text-white md:text-3xl">
                  Operation System Core Operations
                </h1>
                <h2 className="mb-3 text-lg font-bold tracking-normal text-white md:text-xl">
                  Predict <span className="text-red-600">Pic 4</span> Numbers Smarter, Not Harder
                </h2>
                <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-slate-300 md:text-[15px]">
                  &ldquo;Unlock winning insights with AI that learns from history, spots patterns, and adapts to your region.&rdquo;
                </p>
                <p className="mx-auto mt-5 max-w-2xl border-t border-white/10 pt-4 text-sm font-semibold leading-relaxed text-slate-400">
                  A 4-stage systematic approach to <span className="text-blue-400">pattern identification</span>.
                </p>
              </div>

              <div className="relative mb-0 w-full">
                <div className="pointer-events-none absolute top-1/2 left-0 right-0 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
                <div className="relative z-10 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  {steps.map((step, idx) => (
                    <div
                      key={step.title}
                      className={`group/card relative min-h-[10rem] overflow-hidden rounded-none border p-6 transition-all md:p-7
                      ${step.color === 'blue' ? 'border-blue-500/25 bg-gradient-to-br from-blue-600/10 to-transparent hover:border-blue-500/45' : ''}
                      ${step.color === 'red' ? 'border-red-500/25 bg-gradient-to-br from-red-600/10 to-transparent hover:border-red-500/45' : ''}
                      ${step.color === 'emerald' ? 'border-emerald-500/25 bg-gradient-to-br from-emerald-600/10 to-transparent hover:border-emerald-500/45' : ''}
                      ${step.color === 'amber' ? 'border-amber-500/25 bg-gradient-to-br from-amber-600/10 to-transparent hover:border-amber-500/45' : ''}
                    `}
                    >
                      <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-5 transition-opacity group-hover:opacity-10">
                        {step.icon}
                      </div>
                      <div className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-none border border-white/5 bg-slate-900 transition-all group-hover/card:scale-110 group-hover/card:border-white/10">
                        {step.icon}
                      </div>
                      <h3 className="relative z-10 mb-2 flex items-center gap-3 text-base font-bold text-white md:text-lg">
                        <span className="text-lg font-bold text-blue-500 tabular-nums md:text-xl">0{idx + 1}</span>
                        {step.title}
                      </h3>
                      <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-400">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blue–white–red divider: aligned with inner panel gutters so red end stays inside the shell. */}
            <div className="shrink-0 overflow-hidden px-5 py-3 md:px-8 md:py-4" aria-hidden>
              <div className="h-0.5 w-full max-w-full rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
            </div>

            {/* Methodology — same horizontal padding + unified body scale */}
            <div className="relative mb-4 overflow-hidden rounded-none border border-white/5 bg-slate-950/95 px-5 pb-2 pt-5 md:px-8 md:pb-3 md:pt-6">
              <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-none bg-blue-600/5 blur-[120px]"></div>
              <div className="relative z-10 flex flex-col">
                {/* The Oracle-2 */}
                <div className="relative w-full overflow-hidden rounded-none border border-blue-500/20 bg-black/35 shadow-[0_0_44px_rgba(37,99,235,0.12)]">
                  <Image
                    src={PUBLIC_THE_ORACLE_2_IMAGE}
                    alt="The Oracle Pic 4 — the grid pattern engine and color-coded grid analysis."
                    width={1200}
                    height={675}
                    sizes="(max-width: 768px) 100vw, 672px"
                    className="aspect-video h-auto w-full select-none object-cover object-center md:object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <MethodologyStripe />

                <div className="pb-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">How it Works</h2>
                </div>

                <div className="space-y-3 text-center md:text-left">
                  <h3 className="flex flex-col items-center gap-2 text-lg font-semibold tracking-normal text-white sm:flex-row sm:gap-4 md:text-xl md:justify-start">
                    <span className="shrink-0 font-bold text-blue-500 tabular-nums">01.</span>
                    <span>
                      The Oracle <span className="font-bold text-red-600">Pic 4</span> system organizes your numbers
                    </span>
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                    The Oracle <span className="font-bold text-red-600">Pic 4</span> system records the numbers you enter and uses them to build a clear historical view. This makes it easier to review past results and observe possible patterns.
                  </p>
                </div>

                <MethodologyStripe />

                <div className="space-y-3 text-center md:text-left">
                  <h3 className="flex flex-col items-center gap-2 text-lg font-semibold tracking-normal text-white sm:flex-row sm:gap-4 md:text-xl md:justify-start">
                    <span className="shrink-0 font-bold text-blue-500 tabular-nums">02.</span>
                    Choose your display settings
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                    Select the options that match your preferred format, and the system will adjust the display to show the information in a way that is easier to compare and understand.
                  </p>
                </div>

                <MethodologyStripe />

                <div className="space-y-6 rounded-none border border-white/10 bg-slate-900/95 p-6 md:p-7">
                  <h3 className="flex flex-col items-center gap-2 text-lg font-semibold tracking-normal text-white sm:flex-row sm:gap-4 md:text-xl md:justify-start">
                    <span className="shrink-0 font-bold text-blue-500 tabular-nums">03.</span>
                    Understanding the Grid Pattern Engine
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                    <span className="font-semibold text-white">The Oracle <span className="font-bold text-red-600">Pic 4</span></span>
                    {' '}uses a <strong className="font-semibold text-white">visual, color-coded system</strong> to organize numbers:
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                    <div className="flex min-h-[11rem] flex-col gap-3 rounded-none border border-white/10 bg-slate-950/95 p-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-none border border-red-500/30 bg-red-600/20">
                        <div className="h-2 w-2 animate-pulse rounded-none bg-red-500"></div>
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-white">Red &amp; Blue circles</h4>
                      <p className="flex-grow text-sm leading-relaxed text-slate-400">
                        Each day the anchor pairs move up one step like a clock — for example <span className="font-semibold text-red-500">Red: 0–5</span> with <span className="font-semibold text-blue-500">Blue: 1–6</span>, then the next day <span className="font-semibold text-red-500">Red: 1–6</span> and <span className="font-semibold text-blue-500">Blue: 2–7</span>.
                      </p>
                    </div>
                    <div className="flex min-h-[11rem] flex-col gap-3 rounded-none border border-white/10 bg-slate-950/95 p-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-none border border-amber-500/30 bg-amber-500/20">
                        <LayoutGrid size={14} className="text-amber-500" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-white">32 Grid boxes</h4>
                      <p className="flex-grow text-sm leading-relaxed text-slate-400">
                        Numbers spread across <strong className="font-semibold text-white">32 grids</strong>, tied to dates and cycles so patterns recur in a calendar-like rhythm.
                      </p>
                    </div>
                    <div className="flex min-h-[11rem] flex-col gap-3 rounded-none border border-white/10 bg-slate-950/95 p-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-none border border-blue-500/30 bg-blue-600/20">
                        <Target size={14} className="text-blue-400" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-white">Visual detection</h4>
                      <p className="flex-grow text-sm leading-relaxed text-slate-400">
                        Colour cues make hotspots easier to scan so you notice trends sooner and weigh <span className="font-semibold text-blue-400">probability</span> visually.
                      </p>
                    </div>
                  </div>
                </div>

                <MethodologyStripe />

                <div className="grid grid-cols-1 items-stretch gap-y-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-5 lg:gap-y-0">
                  <div className="rounded-none border border-blue-500/20 bg-blue-600/10 p-6 md:p-7">
                    <h4 className="mb-4 text-base font-semibold tracking-normal text-white">
                      Why Oracle <span className="font-bold text-red-600">Pic 4</span> is different
                    </h4>
                    <ul className="space-y-3 text-sm leading-relaxed text-slate-300 md:text-[15px]">
                      <li className="flex gap-2.5 font-medium">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
                        Not random: every prediction is grounded in historical results.
                      </li>
                      <li className="flex gap-2.5 font-medium">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
                        Learns over time as you add more draws.
                      </li>
                      <li className="flex gap-2.5 font-medium">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
                        Visual first: grids and circle colours expose structure quickly.
                      </li>
                      <li className="flex gap-2.5 font-medium">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden />
                        Region-aware modelling for Daily 4 style games where you play.
                      </li>
                    </ul>
                  </div>
                  {/* Blue–white–red between “Why Oracle…” and “Getting started” (horizontal on mobile, vertical on lg). */}
                  <div
                    role="separator"
                    aria-hidden
                    className="h-0.5 w-full shrink-0 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)] lg:h-full lg:min-h-[14rem] lg:w-0.5 lg:max-w-none lg:bg-gradient-to-b lg:from-blue-600 lg:via-white lg:to-red-600 lg:shadow-[0_0_12px_rgba(255,255,255,0.22)]"
                  />
                  <div className="rounded-none border border-blue-500/20 bg-blue-600/10 p-6 md:p-7">
                    <h4 className="mb-4 text-base font-semibold text-white">Getting started</h4>
                    <ol className="list-decimal space-y-3 ps-5 text-sm leading-relaxed text-slate-300 marker:font-semibold marker:text-blue-400 md:text-[15px]">
                      <li className="ps-1">
                        Enter past winning numbers into the Oracle <span className="font-bold text-red-600">Pic 4</span> AI.
                      </li>
                      <li className="ps-1">Select your country or state.</li>
                      <li className="ps-1">
                        Watch grids highlight rhythms with{' '}
                        <span className="font-semibold text-red-500">red</span> / <span className="font-semibold text-blue-400">blue</span> anchors.
                      </li>
                    </ol>
                    <p className="mt-5 text-sm leading-relaxed text-slate-400">
                      Prediction stays <strong className="font-semibold text-slate-300">structured, visual,</strong> and data-led instead of arbitrary guessing.
                    </p>
                  </div>
                </div>

                <MethodologyStripe />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="rounded-none border border-blue-500/20 bg-blue-600/10 p-6 md:p-7">
                    <h5 className="mb-2 text-sm font-semibold tracking-wide text-blue-400 uppercase">User-friendly</h5>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                      Built so anyone can read patterns calmly and tighten picks over repeated sessions.
                    </p>
                  </div>
                  <div className="rounded-none border border-blue-500/20 bg-blue-600/10 p-6 md:p-7">
                    <h5 className="mb-2 text-sm font-semibold tracking-wide text-blue-400 uppercase">Start now</h5>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                      Load history, confirm your jurisdiction, let the grids flag high-structure positions—fewer leaps, clearer intent.
                    </p>
                  </div>
                </div>

                <MethodologyStripe />

                <div className="group/secret relative overflow-hidden rounded-none border border-white/10 bg-slate-950/65 px-6 py-10 text-center md:px-8">
                  <div className="absolute inset-0 bg-blue-600/5 transition-colors group-hover/secret:bg-blue-600/10"></div>
                  <div className="relative z-10 mx-auto max-w-3xl space-y-5">
                    <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                      Unlock the <span className="text-blue-500">four grid</span> secret
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                      The layout is built so paired views and mirrored relationships are easier to scan side by side. For{' '}
                      <span className="font-bold text-red-600">Pic 4</span>
                      {' '}draws, the aim is steadier comparison over time—watching how anchors and colours shift from session to session instead of leaning on guesswork alone.
                    </p>
                    <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                      A calm routine beats rushed picks: note what you actually see, review on a schedule you can keep, and focus on structure rather than impulse. Consistent practice tends to read clearer than chasing shortcuts.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-none border border-white/10 bg-gradient-to-br from-blue-900/25 to-red-900/25 p-6 md:p-8">
                  <h3 className="mb-5 text-center text-xl font-semibold tracking-tight text-white md:mb-6 md:text-2xl">
                    Play smarter, not harder
                  </h3>
                  <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-relaxed text-slate-300 md:mb-7 md:text-[15px]">
                    Treat{' '}
                    <span className="font-semibold text-white">
                      The Oracle <span className="font-bold text-red-600">Pic 4</span> Predictor
                    </span>{' '}
                    like a disciplined map—you explore structure before you wager emotion.
                  </p>
                  <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
                    {[
                      { label: 'Data-driven', desc: 'Every insight references stored member-verified histories.', color: 'text-blue-500', bg: 'bg-blue-500/25', border: 'border-blue-500/35' },
                      { label: 'Intuitive visuals', desc: 'Palette + lattice geometry pull weak signals forward.', color: 'text-red-500', bg: 'bg-red-500/25', border: 'border-red-500/35' },
                      { label: 'Smarter over time', desc: 'More uploads refine cluster confidence.', color: 'text-amber-500', bg: 'bg-amber-500/25', border: 'border-amber-500/35' },
                      { label: 'Predictive positions', desc: 'Highlights combos that recur beside anchors.', color: 'text-emerald-500', bg: 'bg-emerald-500/25', border: 'border-emerald-500/35' },
                      { label: 'Verified accuracy', desc: 'Operators report spotting up to ~85% of recurring slots—your mileage varies.', color: 'text-purple-500', bg: 'bg-purple-500/25', border: 'border-purple-500/35' },
                      { label: 'Strategic focus', desc: 'Encourages repeatable process over impulse.', color: 'text-sky-500', bg: 'bg-sky-500/25', border: 'border-sky-500/35' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border ${item.border} ${item.bg}`}>
                          <ShieldCheck size={11} strokeWidth={2.5} className={item.color} aria-hidden />
                        </div>
                        <div className="min-w-0 space-y-1 text-left">
                          <span className="block text-sm font-semibold text-white">{item.label}</span>
                          <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 pb-1 text-center">
                  <motion.p
                    animate={{ opacity: [1, 0.35] }}
                    transition={{ duration: 1.25, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold leading-relaxed text-yellow-400 md:text-[15px]"
                  >
                    <AlertTriangle size={18} className="shrink-0 fill-yellow-500/25 text-yellow-500" aria-hidden />
                    <span>Play carefully and only with money you can afford to lose</span>
                    <AlertTriangle size={18} className="shrink-0 fill-yellow-500/25 text-yellow-500" aria-hidden />
                  </motion.p>
                </div>

                <SiteDisclaimer className="mt-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
