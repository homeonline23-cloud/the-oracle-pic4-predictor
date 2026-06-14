'use client';

import { useEffect } from 'react';

/** Legacy Supabase redirect URL — forward to the API callback (keeps iPhone fingerprint flow working). */
export default function AuthCallbackRedirect() {
  useEffect(() => {
    const search = window.location.search || '';
    window.location.replace(`/api/auth/callback${search}`);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-xs font-bold text-blue-400">Signing you in…</p>
    </div>
  );
}
