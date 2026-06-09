'use client';

import { useAuth } from '@/hooks/useAuth';
import { isGrid2DemoEmail } from '@/lib/demoAuth';

export default function Grid2DemoBanner() {
  const { user } = useAuth();

  if (!isGrid2DemoEmail(user?.email)) return null;

  return (
    <div className="mx-auto mb-4 w-full max-w-3xl rounded-none border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">
        Tester mode
      </p>
      <p className="mt-1 text-xs leading-relaxed text-emerald-100/90">
        Full access to Grids 1–4 for testing. No payment required.
      </p>
    </div>
  );
}
