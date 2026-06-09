'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_LOGIN_ENABLED } from '@/lib/demoAuth';

type DemoLoginBoxProps = {
  onError?: (message: string | null) => void;
};

export default function DemoLoginBox({ onError }: DemoLoginBoxProps) {
  const [loading, setLoading] = useState(false);
  const { signInWithEmail } = useAuth();
  const router = useRouter();

  if (!DEMO_LOGIN_ENABLED) return null;

  const handleDemoLogin = async () => {
    setLoading(true);
    onError?.(null);
    try {
      const res = await fetch('/api/demo-login', { method: 'POST' });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || 'Demo account could not be prepared');
      }
      await signInWithEmail(DEMO_EMAIL, DEMO_PASSWORD);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-none border border-amber-500/50 bg-amber-950/40 p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-300">
        Demo login — no email confirmation
      </p>
      <div className="mb-3 space-y-1 rounded-none border border-white/10 bg-black/30 px-3 py-2 text-left font-mono text-[11px] text-white">
        <p>
          <span className="text-slate-400">Email:</span> {DEMO_EMAIL}
        </p>
        <p>
          <span className="text-slate-400">Password:</span> {DEMO_PASSWORD}
        </p>
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={handleDemoLogin}
        className="w-full rounded-none border border-amber-500/60 bg-amber-600 py-3 text-[11px] font-bold tracking-normal text-white transition-all hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Preparing demo…' : 'Log in with demo account'}
      </button>
      <p className="mt-2 text-center text-[9px] leading-relaxed text-amber-200/80">
        Use this for demos and testing. Your own account still needs email confirmation.
      </p>
    </div>
  );
}
