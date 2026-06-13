'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_LOGIN_ENABLED } from '@/lib/demoAuth';

type DemoLoginBoxProps = {
  onError?: (message: string | null) => void;
};

export default function DemoLoginBox({ onError }: DemoLoginBoxProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!DEMO_LOGIN_ENABLED) return null;

  const handleDemoLogin = async () => {
    setLoading(true);
    onError?.(null);
    try {
      const res = await fetch('/api/demo-login', { method: 'POST', credentials: 'include' });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || 'Demo account could not be prepared');
      }
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-none border border-amber-500/50 bg-amber-950/40 p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
      <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-wide text-amber-300">
        Demo login — one tap
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={handleDemoLogin}
        className="w-full rounded-none border border-amber-500/60 bg-amber-600 py-3 text-[11px] font-bold tracking-normal text-white transition-all hover:bg-amber-500 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Preparing demo…' : 'Log in with demo account'}
      </button>
      <p className="mt-2 text-center text-[9px] leading-relaxed text-amber-200/80">
        No email or password to type — credentials stay on the server.
      </p>
    </div>
  );
}
