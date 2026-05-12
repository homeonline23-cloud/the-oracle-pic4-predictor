import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center justify-start px-6 py-10 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-none border border-white/10 text-center shadow-2xl">
        <div className="w-20 h-20 bg-blue-600/20 rounded-none flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
          <Mail className="w-10 h-10 text-blue-500 animate-bounce" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-normal mb-8 flex flex-col md:flex-row gap-2 justify-center items-center">
          <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 w-fit">Check Your</span> 
          <span className="px-3 py-1 bg-slate-600 rounded-none border border-white/10 text-blue-500 w-fit">Email</span>
        </h1>
        
        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
          We&apos;ve sent a verification link to your email address. Please click the link to confirm your account and start using The Oracle.
        </p>

        <Link 
          href="/login"
          className="inline-block w-full bg-slate-600 hover:bg-slate-700 text-white font-bold tracking-normal py-4 rounded-none transition-all border border-white/10"
        >
          Return to Login
        </Link>
        
        <p className="mt-8 text-[10px] font-bold text-slate-500 tracking-normal">
          Didn&apos;t receive an email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}
