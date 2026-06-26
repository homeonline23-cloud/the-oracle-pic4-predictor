'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingLocal(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingLocal(false);
    }
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
        className="w-full max-w-md bg-slate-900/95 p-6 md:p-8 rounded-none border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
            Reset password
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-normal mt-6 px-2 text-center">
            Enter your account email—you will receive a link to choose a new password.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-none mb-6 text-center tracking-normal">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-4 rounded-none">
              If there is an account for <span className="text-white">{email}</span>, you will shortly receive an email
              with instructions. Also check spam.
            </div>
            <Link
              href="/login"
              className="inline-block text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-white tracking-normal mb-1.5 ml-4">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-none px-6 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingLocal}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-normal py-4 rounded-none transition-all border border-white/10 shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {loadingLocal ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 tracking-normal">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
            Cancel and return to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
