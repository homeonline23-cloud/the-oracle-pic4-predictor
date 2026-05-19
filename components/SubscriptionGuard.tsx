'use client';

import { useState, useEffect } from 'react';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { hasPaidGridAccess, type GridTier } from '@/lib/gridAccess';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: GridTier;
}

export default function SubscriptionGuard({
  children,
  requiredTier,
}: SubscriptionGuardProps) {
  const { user, profile, loading: authLoading, userRole: contextRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setIsAuthorized(
      hasPaidGridAccess(profile, requiredTier, user.email) || contextRole === 'admin'
    );
    setLoading(false);
  }, [authLoading, user, profile, contextRole, requiredTier]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-center">
        <div>
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium animate-pulse">Verifying membership...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const loginHref = `/login?next=${encodeURIComponent(
      typeof window !== 'undefined' ? window.location.pathname : '/'
    )}`;

    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-none p-8"
        >
          <div className="w-20 h-20 bg-blue-500/20 rounded-none flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-normal mb-4">Sign in required</h2>
          <p className="text-white/60 mb-8">
            Grid access is for members only. Sign in, then choose a plan to unlock the{' '}
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-red-500">
              Oracle Predictor
            </span>
            .
          </p>
          <div className="space-y-4">
            <Link
              href={loginHref}
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold tracking-normal rounded-none hover:scale-[1.02] transition-all text-center"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              View plans
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-none p-8"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-none flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-normal mb-4">Membership required</h2>
          <p className="text-white/60 mb-8">
            Pay first to unlock this grid. This area needs an active{' '}
            <span className="text-white font-bold">{requiredTier}</span> plan or higher.
            {profile?.subscription_tier && profile.subscription_tier !== 'free' ? (
              <>
                {' '}
                Your plan:{' '}
                <span className="text-blue-500 font-bold">{profile.subscription_tier}</span>
                {profile.subscription_status !== 'active' ? (
                  <span className="block mt-2 text-amber-400/90 text-sm">
                    Status: {profile.subscription_status || 'inactive'} — complete payment to activate.
                  </span>
                ) : null}
              </>
            ) : (
              <>
                {' '}
                Current level: <span className="text-blue-500 font-bold">Free</span>
              </>
            )}
          </p>
          <div className="space-y-4">
            <Link
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold tracking-normal rounded-none hover:scale-[1.02] transition-all text-center"
            >
              Choose a plan
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 font-bold hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
