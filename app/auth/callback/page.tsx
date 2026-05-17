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
            `/login?message=${encodeURIComponent(exchangeError.message)}`
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

      // Full navigation helps Edge/IE apply auth cookies reliably (popup flow legacy).
      window.location.replace(next);
    };

    void handleAuth();
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-blue-400 font-bold tracking-normal text-xs animate-pulse">
        Synchronizing Neural Session...
      </p>
      <p className="text-slate-500 text-[10px] font-bold mt-2">
        This window will close automatically.
      </p>
    </div>
  );
}
