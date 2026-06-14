'use client';

import { useEffect } from 'react';
import { redirectToWwwIfNeeded } from '@/lib/appOrigin';

/** Legacy /auth/callback URLs (Supabase) → server handler that sets session cookies. */
export default function AuthCallback() {
  useEffect(() => {
    if (redirectToWwwIfNeeded()) return;
    const search = window.location.search;
    window.location.replace(`/api/auth/callback${search}`);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="animate-pulse text-xs font-bold tracking-normal text-blue-400">Signing you in…</p>
    </div>
  );
}
