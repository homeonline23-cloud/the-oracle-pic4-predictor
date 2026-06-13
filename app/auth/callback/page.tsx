'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const supabase = createClient();

  useEffect(() => {
    const handleAuth = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('OAuth code exchange failed:', exchangeError);
          window.location.replace(
            `/login?message=${encodeURIComponent(exchangeError.message)}`,
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth error during callback:', error);
        }
      }

      const rawNext = url.searchParams.get('next');
      const next =
        rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
        window.close();
        return;
      }

      window.location.replace(next);
    };

    void handleAuth();
  }, [supabase.auth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="animate-pulse text-xs font-bold tracking-normal text-blue-400">Signing you in…</p>
    </div>
  );
}
