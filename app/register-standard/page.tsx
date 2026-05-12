'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterStandardPage() {
  const { user, signUp, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user && !success) {
      // If they are already logged in, just redirect them to basic
      router.push('/basic');
    }
  }, [user, loading, router, success]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Assign the 'standard' role upon registration
      await signUp(email, password, 'Oracle Member');
      setSuccess(true);
      setTimeout(() => {
        router.push('/basic');
      }, 3000);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { code?: string };
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative group">
        {/* Ambient Glows - Red, White, Blue */}
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/20 via-white/10 to-red-600/20 rounded-none blur-[80px] opacity-40 group-hover:opacity-80 transition duration-1000"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Red Outer Border */}
          <div className="relative border-2 border-red-600/60 p-1.5 rounded-none shadow-2xl overflow-hidden">
            {/* Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-none p-10 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-none flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-normal mb-4">
                Welcome to Standard!
              </h2>
              <p className="text-slate-300 font-medium">
                Your account has been successfully created. Redirecting you to the Basic Dashboard...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[180px] relative group"
      >
        {/* Ambient Glows - Red, White, Blue */}
        <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/20 via-white/10 to-red-600/20 rounded-none blur-2xl opacity-40 group-hover:opacity-80 transition duration-1000"></div>
        
        {/* Red Outer Border */}
        <div className="relative border-2 border-red-600/60 p-1 rounded-none shadow-2xl overflow-hidden">
          {/* Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-none p-4 shadow-2xl text-center">
          <div className="relative z-10 flex flex-col items-center mb-4">
            <h1 className="text-[8px] font-bold text-white tracking-normal italic">
              Claim Your <span className="text-blue-500">Standard</span> Access
            </h1>
            <p className="text-slate-400 mt-2 text-[6px] font-medium leading-tight">
              Thank you for your purchase! Create your account below to access the Dual Grid Predictor.
            </p>
          </div>

          {error && (
            <div className="mb-3 p-1.5 bg-red-500/10 border border-red-500/50 rounded-none text-red-500 text-[6px] font-bold relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col space-y-2 relative z-10">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white px-2 py-1.5 rounded-none text-[7px] focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-800 border border-slate-700 text-white px-2 py-1.5 rounded-none text-[7px] focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-800 border border-slate-700 text-white px-2 py-1.5 rounded-none text-[7px] focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full py-2 mt-1 bg-slate-600 hover:bg-slate-700 text-white text-[7px] font-bold tracking-normal rounded-none transition-all shadow-lg flex items-center justify-center disabled:opacity-50 border border-white/10"
            >
              <span className="whitespace-nowrap">{isSubmitting ? 'Creating...' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  </div>
);
}
