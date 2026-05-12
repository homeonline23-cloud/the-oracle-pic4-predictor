'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';

/** Hash fragment (#...&type=recovery) used by implicit-style recovery links */
function recoveryFromHash(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return false;
  return new URLSearchParams(hash).get('type') === 'recovery';
}

/** PKCE-style redirects often use ?code= on the configured redirect route */
function recoveryLandingHint(): boolean {
  if (typeof window === 'undefined') return false;
  if (recoveryFromHash()) return true;
  const q = new URLSearchParams(window.location.search);
  return q.has('code');
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [passChecks, setPassChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setPassChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  useEffect(() => {
    const landingHint = recoveryLandingHint();
    let ignore = false;
    let sawRecovery = false;
    let failTimer: number | undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (ignore) return;
      if (event === 'PASSWORD_RECOVERY') {
        sawRecovery = true;
        setReady(true);
        setInvalid(false);
      }
      if (event === 'INITIAL_SESSION' && session && landingHint) {
        sawRecovery = true;
        setReady(true);
        setInvalid(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (ignore) return;
      if (session && landingHint) {
        sawRecovery = true;
        setReady(true);
      }
      setChecking(false);
      if (!ignore && !sawRecovery && !landingHint) {
        failTimer = window.setTimeout(() => {
          if (ignore || sawRecovery) return;
          setInvalid(true);
        }, 4500);
      }
    });

    return () => {
      ignore = true;
      if (failTimer !== undefined) clearTimeout(failTimer);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!Object.values(passChecks).every(Boolean)) {
      setError('Meet all password requirements');
      return;
    }
    setSaving(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      await supabase.auth.signOut();
      router.push('/login?message=' + encodeURIComponent('Password updated. Sign in with your new password.'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start px-6 py-6 relative overflow-hidden">
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-none border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">New password</h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-normal mt-4 px-2">
            Choose a strong password for your account.
          </p>
        </div>

        {checking && !ready ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-none animate-spin" />
            <p className="text-slate-400 text-xs font-bold">Checking recovery link…</p>
          </div>
        ) : invalid && !ready ? (
          <div className="space-y-4 text-center">
            <p className="text-red-400 text-sm font-bold">
              This recovery link is invalid or has expired.
            </p>
            <Link href="/forgot-password" className="inline-block text-blue-400 hover:text-blue-300 text-sm font-bold">
              Request a new link
            </Link>
            <Link href="/login" className="block text-[10px] font-bold text-slate-500 hover:text-slate-400 mt-6">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-none mb-6 text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white tracking-normal mb-1.5 ml-4">
                  New password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-none px-6 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white tracking-normal mb-1.5 ml-4">
                  Confirm password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-none px-6 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="bg-black/20 rounded-none p-4 space-y-2 border border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'length', label: '8+ Characters' },
                    { key: 'uppercase', label: '1 Uppercase' },
                    { key: 'number', label: '1 Number' },
                    { key: 'special', label: '1 Special' },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center gap-2">
                      {passChecks[c.key as keyof typeof passChecks] ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" strokeWidth={4} />
                        </div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      )}
                      <span className="text-[9px] font-bold tracking-normal text-white">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-none border border-white/10 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
