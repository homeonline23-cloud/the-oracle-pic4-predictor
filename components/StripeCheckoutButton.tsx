'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type Tier = 'standard' | 'premium' | 'yearly';

interface StripeCheckoutButtonProps {
  tier: Tier;
}

export default function StripeCheckoutButton({ tier }: StripeCheckoutButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          userId: user?.id ?? '',
          userEmail: user?.email ?? '',
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Checkout could not start.');
      }
      if (!data.url) {
        throw new Error('Stripe did not return a checkout URL.');
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-1.5 pt-1">
      {error && (
        <p className="text-center text-[9px] font-bold leading-snug tracking-normal text-red-400">{error}</p>
      )}
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="flex w-full min-h-[42px] items-center justify-center gap-2 rounded-none border border-violet-500/55 bg-gradient-to-b from-violet-600 via-violet-700 to-violet-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_14px_rgba(139,92,246,0.25)] transition-all hover:brightness-105 disabled:opacity-60 active:scale-[0.98] md:text-[11px]"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Redirecting…
          </>
        ) : (
          <>
            Subscribe with card
            <span className="rounded-none bg-white/15 px-1.5 py-0.5 text-[8px] font-bold normal-case tracking-normal text-white/90">
              Stripe
            </span>
          </>
        )}
      </button>
    </div>
  );
}
