'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const rawNext = url.searchParams.get('next');
    const next =
      rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

    const goLogin = (message: string) => {
      window.location.replace(`/login?message=${encodeURIComponent(message)}`);
    };

    const finish = () => {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
        window.close();
        return;
      }
      window.location.replace(next);
    };

    void (async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('OAuth code exchange failed:', error);
          const friendly = /pkce|code verifier/i.test(error.message)
            ? 'Google sign-in timed out. Tap Sign in with Google once more.'
            : error.message;
          goLogin(friendly);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        finish();
        return;
      }

      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          sub.subscription.unsubscribe();
          finish();
        }
      });

      window.setTimeout(async () => {
        sub.subscription.unsubscribe();
        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession();
        if (retrySession) finish();
        else goLogin('Sign-in could not finish. Please try Sign in with Google again.');
      }, 5000);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="animate-pulse text-xs font-bold tracking-normal text-blue-400">Signing you in…</p>
    </div>
  );
}
