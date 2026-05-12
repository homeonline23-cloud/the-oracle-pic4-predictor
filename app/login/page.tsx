'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';

function LoginContent() {
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualAuthUrl, setManualAuthUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const { user, signInWithGoogle, forceAdminBypass, signInWithEmail, loading: authLoading } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (searchParams) {
      const message = searchParams.get('message');
      if (message) {
        setSuccess(message);
      }
    }
  }, [searchParams]);

  const handleOAuth = async (provider: 'google') => {
    try {
      if (provider === 'google') {
        const url = await signInWithGoogle();
        if (url) {
          setManualAuthUrl(url);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'OAuth error';
      setError(errorMessage);
    }
  };

  const handleAdminBypass = () => {
    forceAdminBypass();
  };

  return (
    <div className="flex flex-col items-center justify-start px-6 py-6 relative overflow-hidden">
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-none border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex flex-col md:flex-row gap-2 justify-center items-center">
            <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 w-fit">Sign</span> 
            <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 text-blue-500 w-fit">In</span>
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-normal mt-6 underline decoration-blue-500/30 px-2 text-center">
            Welcome back to the Oracle
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-none mb-6 text-center tracking-normal">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold p-3 rounded-none mb-6 text-center tracking-normal">
            {success}
          </div>
        )}

        {manualAuthUrl ? (
          <div className="bg-yellow-500/10 border-2 border-yellow-500 text-yellow-500 text-sm font-bold p-4 rounded-none mb-6 text-center tracking-normal flex flex-col gap-4">
            <p>Popups are blocked by your browser. Please click the button below to sign in:</p>
            <a 
              href={manualAuthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 text-black px-4 py-3 tracking-normal font-bold transition-transform active:scale-95"
            >
              Open Sign In Window
            </a>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 mt-4 space-y-1">
              <div>
                <label className="block text-[10px] font-bold text-white tracking-normal mb-1 ml-4">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
                  placeholder="oracle@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white tracking-normal mb-1 ml-4">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-none px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex justify-end px-1">
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 border border-white/10 text-white rounded-none py-4 px-2 font-bold tracking-normal text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {emailLoading ? 'Signing in…' : 'Sign in with email'}
              </button>
            </form>

            <div className="py-2 flex items-center gap-2 mt-4">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-[9px] text-slate-500 font-bold">or</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleOAuth('google')}
                type="button"
                className="flex items-center justify-center gap-3 bg-slate-600 hover:bg-slate-700 border border-white/10 text-white rounded-none py-4 px-2 transition-all active:scale-95"
              >
                <Image src="https://www.google.com/favicon.ico" width={20} height={20} className="w-5 h-5 shrink-0" alt="Google" />
                <span className="text-[10px] sm:text-xs font-bold tracking-normal text-center">Sign in with Google</span>
              </button>
            </div>
          </>
        )}

        <div className="flex flex-col gap-4 mt-4">
          <div className="py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-[9px] text-slate-500 font-bold">or</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <button
            onClick={handleAdminBypass}
            className="flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 border-2 border-white text-white rounded-none py-6 transition-all active:scale-95 whitespace-nowrap group shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-none animate-pulse">
                <span className="text-sm">★</span>
              </div>
              <span className="text-sm font-bold tracking-normal">Fast Login (Owner Access)</span>
            </div>
            <span className="text-[10px] font-bold text-blue-200">System override for homeonline23@gmail.com</span>
          </button>

          <p className="text-[9px] text-slate-500 font-bold tracking-normal text-center mt-2 opacity-70">
            Secure login with automated redirect fallback
          </p>
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 tracking-normal opacity-50">
          Use email and password, Google sign-in, or owner access below.
          {' '}
          <Link href="/signup" className="text-red-400/90 hover:text-red-300 underline decoration-red-400/40">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-none animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}