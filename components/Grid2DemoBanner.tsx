'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { isGrid2DemoEmail } from '@/lib/demoAuth';

export default function Grid2DemoBanner() {
  const { user } = useAuth();

  if (!isGrid2DemoEmail(user?.email)) return null;

  return (
    <div className="mx-auto mb-4 w-full max-w-3xl rounded-none border border-amber-500/40 bg-amber-950/35 px-4 py-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-300">
        Free 4-grid tester demo
      </p>
      <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
        You are trying Grids 1–4 only. Upgrade for 10- and 20-grid access.
      </p>
      <Link
        href="/pricing"
        className="mt-2 inline-block text-[11px] font-bold text-blue-400 underline decoration-blue-400/40 hover:text-blue-300"
      >
        View plans
      </Link>
    </div>
  );
}
