'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [passChecks, setPassChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setPassChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Object.values(passChecks).every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }

    setLoadingLocal(true);
    setError(null);

    try {
      await signUp(email, password, fullName);
      router.push('/check-email');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to create account');
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
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-none border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-white italic tracking-normal flex flex-col md:flex-row gap-2 justify-center items-center">
            <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 w-fit">Create</span> 
            <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 text-red-600 w-fit">Account</span>
          </h1>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-normal mt-6 underline decoration-red-500/30 px-2">
            Join the elite prediction network
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-none mb-6 text-center tracking-normal">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white tracking-normal mb-1.5 ml-4">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-none px-6 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all font-mono"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white tracking-normal mb-1.5 ml-4">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-none px-6 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all font-mono"
              placeholder="oracle@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white tracking-normal mb-1.5 ml-4">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-none px-6 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all font-mono"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Password Strength Indicator */}
          <div className="bg-black/20 rounded-none p-4 space-y-2 border border-white/5">
             <div className="grid grid-cols-2 gap-2">
               {[
                 { key: 'length', label: '8+ Characters' },
                 { key: 'uppercase', label: '1 Uppercase' },
                 { key: 'number', label: '1 Number' },
                 { key: 'special', label: '1 Special' }
               ].map((check) => (
                 <div key={check.key} className="flex items-center gap-2">
                    {passChecks[check.key as keyof typeof passChecks] ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                        <Check className="w-2 h-2 text-white" strokeWidth={4} />
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                    )}
                    <span className="text-[9px] font-bold tracking-normal text-white">
                      {check.label}
                    </span>
                 </div>
               ))}
             </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingLocal}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold tracking-normal py-4 rounded-none transition-all border border-white/10 shadow-lg active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
            >
              {loadingLocal ? 'Processing...' : 'Create Account'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold tracking-normal leading-none">
              <span className="bg-slate-900 px-4 text-slate-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 bg-slate-600 hover:bg-slate-700 border border-white/10 text-white rounded-none py-4 px-2 transition-all active:scale-[0.98]"
          >
            <Image src="https://www.google.com/favicon.ico" width={20} height={20} className="w-5 h-5 shrink-0 grayscale-0" alt="Google" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-normal text-center">Sign up with Google</span>
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-bold text-slate-500 tracking-normal">
           <ShieldCheck size={14} className="text-emerald-500" />
           Secure 256-bit Encrypted Session
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 tracking-normal">
          Already have an account?{' '}
          <Link href="/login" className="text-red-500 hover:text-red-400 transition-colors">
            Sign In Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
