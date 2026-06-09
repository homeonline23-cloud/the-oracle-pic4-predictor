'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import {
  GRID2_DEMO_EMAIL,
  GRID2_DEMO_PASSWORD,
  GRID2_DEMO_ENABLED,
  getGrid2DemoUrl,
} from '@/lib/demoAuth';

export default function Grid2DemoPage() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl =
    typeof window !== 'undefined' ? getGrid2DemoUrl(window.location.origin) : getGrid2DemoUrl();

  const startDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/grid2-demo-login', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || 'Demo could not be prepared');
      }
      await signInWithEmail(GRID2_DEMO_EMAIL, GRID2_DEMO_PASSWORD);
      router.push('/basic');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo start failed');
    } finally {
      setLoading(false);
    }
  };

  if (!GRID2_DEMO_ENABLED) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-white">
        <p>The tester demo is not available right now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-6">
      <PageHeader />
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        className="mt-6 w-full max-w-lg rounded-none border border-blue-500/30 bg-slate-900/60 p-6 text-center backdrop-blur-xl md:p-8"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
          The Oracle Pic 4 Predictor
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">
          <span className="text-blue-400">4-Grid</span> tester website
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-300">
          One tap opens <strong className="text-white">Grids 1–4</strong> with two winning-number
          pairs. Test patterns across all four grids. Free for testers — no payment, no signup
          email.
        </p>

        {error && (
          <p className="mt-4 rounded-none border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => void startDemo()}
          className="mt-6 w-full rounded-none border border-blue-500/50 bg-blue-600 py-4 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Opening demo…' : 'Start 4-grid tester demo'}
        </button>

        <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
          Share this link in ads and posts:
          <span className="mt-1 block break-all font-mono text-slate-400">{shareUrl}</span>
        </p>

      </motion.div>
    </div>
  );
}
