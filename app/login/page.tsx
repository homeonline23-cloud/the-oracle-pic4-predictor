'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';
import { GRID2_DEMO_PATH } from '@/lib/demoAuth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginContent() {
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, signInWithGoogle, loading: authLoading } = useAuth();

  const nextPath =
    searchParams?.get('next') &&
    searchParams.get('next')!.startsWith('/') &&
    !searchParams.get('next')!.startsWith('//')
      ? searchParams.get('next')!
      : '/';

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle(nextPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailValue = email.trim();
    if (!EMAIL_PATTERN.test(emailValue)) {
      setError('Enter a valid email address in the Email field and your password below.');
      return;
    }
    if (!password) {
      setError('Enter your password in the Password field.');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: emailValue, password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || 'Sign-in failed');
      }
      window.location.href = nextPath;
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      if (/invalid login credentials/i.test(message)) {
        setError(
          'Wrong email or password. Testers: use the one-tap link at /demo/grid2 instead of typing here.',
        );
      } else {
        setError(message);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = nextPath;
    }
  }, [user, authLoading, nextPath]);

  useEffect(() => {
    if (searchParams) {
      const message = searchParams.get('message');
      if (message) {
        setSuccess(message);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-start px-6 py-6 relative">
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-none border border-white/10 shadow-2xl"
      >
        <motion.div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex flex-col md:flex-row gap-2 justify-center items-center">
            <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 w-fit">Sign</span>
            <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 text-blue-500 w-fit">In</span>
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-normal mt-6 underline decoration-blue-500/30 px-2 text-center">
            Welcome back to the Oracle — sign in with Google or email
          </p>
        </motion.div>

        {error && (
          <motion.div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-none mb-6 text-center tracking-normal">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold p-3 rounded-none mb-6 text-center tracking-normal">
            {success}
          </motion.div>
        )}

        <div className="mb-6 rounded-none border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            Fiverr / tester access
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/90">
            Do not create an account. Open{' '}
            <Link href={GRID2_DEMO_PATH} className="font-bold text-emerald-300 underline">
              the 4-grid demo page
            </Link>{' '}
            and tap <strong>Start 4-grid tester demo</strong> — one tap, no typing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={googleLoading || emailLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 border border-white/20 text-slate-900 rounded-none py-4 px-2 font-bold transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Image
            src="https://www.google.com/favicon.ico"
            width={20}
            height={20}
            className="w-5 h-5 shrink-0"
            alt="Google"
          />
          <span className="text-[11px] sm:text-sm font-bold tracking-normal text-center">
            {googleLoading ? 'Connecting to Google…' : 'Sign in with Google'}
          </span>
        </button>

        <p className="mt-3 rounded-none border border-amber-500/30 bg-amber-950/25 px-3 py-2 text-[10px] leading-relaxed text-amber-100/90">
          Google may send fingerprint approval to your iPhone — that is normal. Use <strong>normal Chrome</strong> on
          PC (not Cursor preview). Or <strong>Sign in with email</strong> below.
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold tracking-normal leading-none">
            <span className="bg-slate-900 px-4 text-slate-500">or email & password</span>
          </div>
        </div>

        <form noValidate onSubmit={handleEmailSignIn} className="flex flex-col gap-4 space-y-1">
          <motion.div>
            <label htmlFor="login-email" className="block text-[10px] font-bold text-white tracking-normal mb-1 ml-4">
              Email
            </label>
            <input
              id="login-email"
              name="oracle-login-email"
              type="text"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
              placeholder="you@example.com"
            />
          </motion.div>
          <motion.div>
            <label htmlFor="login-password" className="block text-[10px] font-bold text-white tracking-normal mb-1 ml-4">
              Password
            </label>
            <input
              id="login-password"
              name="oracle-login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
              placeholder="••••••••"
            />
          </motion.div>
          <motion.div className="flex justify-end px-1">
            <Link href="/forgot-password" className="text-[10px] font-bold text-blue-400 hover:text-blue-300">
              Forgot password?
            </Link>
          </motion.div>
          <button
            type="submit"
            disabled={emailLoading || googleLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 border border-white/10 text-white rounded-none py-4 px-2 font-bold tracking-normal text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {emailLoading ? 'Signing in...' : 'Sign in with email'}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 tracking-normal opacity-50">
          New member?{' '}
          <Link href="/signup" className="text-red-400/90 hover:text-red-300 underline decoration-red-400/40">
            Create account (Join)
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <motion.div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-none animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
