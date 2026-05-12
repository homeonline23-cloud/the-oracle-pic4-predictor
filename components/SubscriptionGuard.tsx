'use client';

import { useState, useEffect } from 'react';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: 'standard' | 'premium' | 'yearly';
}

import { ADMIN_EMAIL } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionGuard({ children, requiredTier }: SubscriptionGuardProps) {
  const { user, profile, loading: authLoading, userRole: contextRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    // Admin always has access (from context or email check)
    const isAdminEmail = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    if (contextRole === 'admin' || isAdminEmail) {
      setIsAuthorized(true);
      setLoading(false);
      return;
    }

    const tiers = ['free', 'standard', 'premium', 'yearly'];
    const userTierIndex = tiers.indexOf(profile?.subscription_tier || 'free');
    const requiredTierIndex = tiers.indexOf(requiredTier);

    if (userTierIndex >= requiredTierIndex) {
      setIsAuthorized(true);
    }
    
    setLoading(false);
  }, [authLoading, user, profile, contextRole, requiredTier]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-center">
        <div>
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium animate-pulse">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
          <h2 className="text-2xl font-bold text-white tracking-normal mb-4">Access Restricted</h2>
          <p className="text-white/60 mb-8">Please sign in to access the <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-400 to-red-500">Oracle Predictor</span>.</p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-blue-500 font-bold hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Login
          </Link>
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
          <h2 className="text-2xl font-bold text-white tracking-normal mb-4">Membership Required</h2>
          <p className="text-white/60 mb-8">
            This area is reserved for <span className="text-white font-bold">{requiredTier}</span> members. 
            Your current level: <span className="text-blue-500 font-bold">{profile?.subscription_tier || 'Free'}</span>
          </p>
          <div className="space-y-4">
            <Link 
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold tracking-normal rounded-none hover:scale-[1.02] transition-all text-center"
            >
              Upgrade Now
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
