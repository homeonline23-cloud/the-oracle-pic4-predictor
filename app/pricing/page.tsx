'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import StripeCheckoutButton from '@/components/StripeCheckoutButton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import { WINDOW_OUTER_SHELL } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  useScrollReveal();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') !== '1') return;
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete('stripe_success');
      const qs = url.searchParams.toString();
      window.history.replaceState({}, '', qs ? `${url.pathname}?${qs}` : url.pathname);
      window.location.reload();
    }, 2200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative flex min-w-0 flex-col items-center overflow-x-hidden p-0 pb-0 pt-4 font-sans">
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center px-2 md:px-6">
        
        {/* Pricing Header */}
        <div className="mx-auto mb-10 w-full max-w-3xl px-2 text-center md:mb-10 md:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-1 text-2xl font-bold leading-tight tracking-normal text-white md:text-3xl"
          >
            Choose Your Advantage
          </motion.h1>
          <p className="mx-auto mt-1 max-w-2xl text-xs font-semibold leading-relaxed tracking-normal text-slate-200 md:text-sm">
            Select Your Access Tier
          </p>
          <div
            className="mt-4 h-0.5 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)] md:mt-5"
            aria-hidden
          />
        </div>

        {/* Pricing/Advantage Grid */}
        <div id="pricing-plans" className="w-full max-w-3xl px-2 md:px-6">
          <div
            className={cn(
              'relative rounded-none bg-[#29465B] p-2 md:p-4',
              WINDOW_OUTER_SHELL
            )}
          >
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {/* Standard Plan */}
              <div className="relative group/plan">
                <div className="absolute -inset-0.5 rounded-none bg-gradient-to-r from-blue-600 to-cyan-500 opacity-40 blur transition duration-1000 group-hover/plan:opacity-70"></div>
                <div className="relative flex h-full flex-col space-y-2 rounded-none border border-white/20 bg-[#00004d]/93 p-4 pb-6 md:p-5 md:pb-7">
                  <div className="absolute -top-2 left-3 rounded-none bg-gradient-to-r from-blue-600 to-cyan-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-lg md:text-xs">
                    Standard
                  </div>
                  <div className="mb-0 mt-5 md:mt-6">
                    <h3 className="mb-0.5 text-sm font-bold tracking-tight text-white md:text-base">Basic</h3>
                    <p className="text-[11px] font-semibold text-slate-300 md:text-xs">Monthly Access</p>
                  </div>
                  <div className="mb-1 flex items-baseline">
                    <span className="text-2xl font-bold text-white md:text-3xl">$19.95</span>
                    <span className="ml-1.5 text-[10px] font-bold text-slate-400 md:text-xs">/ mo</span>
                  </div>
                  <ul className="mb-3 flex-grow space-y-1.5 text-[11px] leading-relaxed text-slate-200 md:text-xs">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-400">*</span>
                      2 AI Predictions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-400">*</span>
                      2 Grids Boxes
                    </li>
                  </ul>
                  <div className="flex w-full flex-col items-center pt-0.5">
                    <StripeCheckoutButton tier="standard" />
                  </div>
                </div>
              </div>

              {/* Advanced Plan */}
              <div className="relative group/plan">
                <div className="absolute -inset-0.5 rounded-none bg-gradient-to-r from-red-600 to-purple-600 opacity-40 blur transition duration-1000 group-hover/plan:opacity-70"></div>
                <div className="relative flex h-full flex-col space-y-2 rounded-none border border-white/20 bg-[#00004d]/93 p-4 pb-6 md:p-5 md:pb-7">
                  <div className="absolute -top-2 left-3 rounded-none bg-gradient-to-r from-red-600 to-purple-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-lg md:text-xs">
                    Advanced
                  </div>
                  <div className="mb-0 mt-5 md:mt-6">
                    <h3 className="mb-0.5 text-sm font-bold tracking-tight text-white md:text-base">Premium</h3>
                    <p className="text-[11px] font-semibold text-slate-300 md:text-xs">Professional Tier</p>
                  </div>
                  <div className="mb-1 flex items-baseline">
                    <span className="text-2xl font-bold text-white md:text-3xl">$39.95</span>
                    <span className="ml-1.5 text-[10px] font-bold text-slate-400 md:text-xs">/ mo</span>
                  </div>
                  <ul className="mb-3 flex-grow space-y-1.5 text-[11px] font-medium leading-relaxed text-slate-200 md:text-xs">
                    <li className="font-semibold text-white">5 AI Predictions</li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-400">*</span>
                      10 Grids Boxes
                    </li>
                  </ul>
                  <div className="flex w-full flex-col items-center pt-0.5">
                    <StripeCheckoutButton tier="premium" />
                  </div>
                </div>
              </div>

              {/* Best Value Plan */}
              <div className="relative group/plan">
                <div className="absolute -inset-0.5 rounded-none bg-gradient-to-r from-amber-500 to-yellow-600 opacity-40 blur transition duration-1000 group-hover/plan:opacity-70"></div>
                <div className="relative flex h-full flex-col space-y-2 rounded-none border border-blue-500/50 bg-[#00004d]/93 p-4 pb-6 md:p-5 md:pb-7">
                  <div className="absolute -top-2 left-3 rounded-none bg-gradient-to-r from-amber-500 to-yellow-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-lg md:text-xs">
                    Best Value
                  </div>
                  <div className="mb-0 mt-5 md:mt-6">
                    <h3 className="mb-0.5 text-sm font-bold tracking-tight text-white md:text-base">Full Year</h3>
                    <p className="text-[11px] font-semibold text-slate-300 md:text-xs">Annual Access</p>
                  </div>
                  <div className="mb-1 flex items-baseline">
                    <span className="text-2xl font-bold text-white md:text-3xl">$379.95</span>
                    <span className="ml-1.5 text-[10px] font-bold text-slate-400 md:text-xs">/ yr</span>
                  </div>
                  <ul className="mb-3 flex-grow space-y-1.5 text-[11px] font-medium leading-relaxed text-slate-200 md:text-xs">
                    <li className="font-semibold text-white">10 AI Predictions</li>
                    <li className="flex items-start gap-2 font-semibold text-amber-300">
                      <span className="font-bold">*</span>
                      20 Grids Boxes
                    </li>
                  </ul>
                  <div className="flex w-full flex-col items-center pt-0.5">
                    <StripeCheckoutButton tier="yearly" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment security footer */}
          <div className="mt-6 flex flex-col items-center gap-4 text-center md:mt-8 md:gap-5">
            <div className="max-w-lg space-y-1.5 px-3">
              <p className="flex items-center justify-center gap-2 text-xs font-semibold leading-snug text-white md:text-sm">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" aria-hidden />
                100% Secure SSL Payment Processing
              </p>
              <p className="text-[10px] font-semibold leading-relaxed tracking-wide text-white md:text-xs">
                payments: stripe checkout (card subscriptions)
              </p>
            </div>
            <div
              className={cn(
                'mt-2 rounded-none bg-[#29465B] p-4 transition-all hover:scale-[1.02] md:p-5',
                WINDOW_OUTER_SHELL
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/creditcards%20logo.jpg"
                alt="Accepted payment methods — Visa, Mastercard, PayPal, Stripe, Apple Pay, Google Pay and more"
                className="mx-auto h-20 w-auto rounded-sm object-contain md:h-28"
              />
            </div>
          </div>
        </div>

        <div className="pb-4"></div>
      </div>
    </main>
  );
}
