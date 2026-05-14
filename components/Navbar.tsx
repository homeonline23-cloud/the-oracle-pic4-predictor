'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_BAND_FILL, NAV_BAND_SHELL, VIDEO_SHELL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const PRIMARY_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'Process' },
  { href: '/pricing', label: 'Pricing' },
] as const;

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const navBtnShell =
    'rounded-none transition-all duration-200 font-bold tracking-wide border leading-tight shrink-0';

  /** Same inactive “window” chrome as primary nav pills — keeps Log in / Join visually balanced. */
  const authClusterInactiveShell =
    'border-blue-600/55 bg-[linear-gradient(180deg,rgb(24,32,48)_0%,rgb(15,23,42)_45%,rgb(10,15,28)_100%)] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_3px_12px_rgba(0,0,0,0.5)] transition-all hover:border-blue-400/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_22px_rgba(59,130,246,0.28)] active:scale-[0.97]';

  const authDesktopClusterClass = `${navBtnShell} group relative z-10 inline-flex min-h-[36px] h-9 items-stretch overflow-hidden ${authClusterInactiveShell}`;

  const authDesktopLinkClass =
    'inline-flex min-h-[36px] flex-1 items-center justify-center px-2.5 text-[10px] font-bold tracking-wide text-slate-100 transition-colors hover:bg-white/[0.07] hover:text-white sm:px-3 sm:text-xs';

  const authMobileClusterClass = `${navBtnShell} flex flex-col overflow-hidden ${authClusterInactiveShell}`;

  const authMobileSignInClass =
    'flex w-full items-center justify-center min-h-[42px] px-4 text-sm font-bold tracking-wide text-slate-200 hover:text-white rounded-none border-0 border-b border-white/12 bg-transparent hover:bg-white/[0.05] transition-colors';

  const authMobileSignUpClass =
    'flex w-full items-center justify-center min-h-[42px] px-4 text-sm font-bold tracking-wide text-slate-100 hover:text-white rounded-none border-0 bg-transparent hover:bg-white/[0.06] transition-colors';

  const getNavLinkClass = (path: string) => {
    const normalize = (p: string) => (p ? p.replace(/\/$/, '') || '/' : '/');
    const isActive = normalize(pathname) === normalize(path);

    return `${navBtnShell} relative z-10 inline-flex min-h-[36px] h-9 items-center justify-center px-3 py-1.5 text-[10px] sm:px-3.5 sm:text-xs ${
      isActive
        ? 'border border-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 text-white shadow-[0_0_20px_rgba(59,130,246,0.55),inset_0_1px_0_rgba(255,255,255,0.28)] hover:brightness-105'
        : 'border-blue-600/55 bg-[linear-gradient(180deg,rgb(24,32,48)_0%,rgb(15,23,42)_45%,rgb(10,15,28)_100%)] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_3px_12px_rgba(0,0,0,0.5)] hover:border-blue-400/70 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_22px_rgba(59,130,246,0.28)] active:scale-[0.97]'
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const normalize = (p: string) => (p ? p.replace(/\/$/, '') || '/' : '/');
    const isActive = normalize(pathname) === normalize(path);
    return `flex w-full items-center justify-center min-h-[48px] px-4 text-sm ${navBtnShell} transition-all duration-200 ${
      isActive
        ? 'border border-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 text-white shadow-[0_0_18px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.22)]'
        : 'border border-blue-600/55 bg-[linear-gradient(180deg,rgb(24,32,48)_0%,rgb(15,23,42)_50%,rgb(10,15,28)_100%)] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_10px_rgba(0,0,0,0.45)] active:border-blue-500/65 active:text-white active:shadow-[0_0_18px_rgba(59,130,246,0.22)]'
    }`;
  };

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[190] flex justify-center py-2 sm:py-2.5 pointer-events-none"
      aria-label="Main navigation"
    >
      <div className={`relative z-10 ${VIDEO_SHELL} pointer-events-auto`}>
        {/* Mobile top bar — menu opens sheet (auth lives in menu only; no duplicate buttons) */}
        <div
          className={cn(
            'relative flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-1.5 md:hidden',
            NAV_BAND_FILL,
            NAV_BAND_SHELL
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)] md:hidden"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-blue-600/50 bg-[linear-gradient(180deg,rgb(30,41,59)_0%,rgb(15,23,42)_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_14px_rgba(59,130,246,0.22)] transition-all hover:border-blue-400/65 active:scale-95"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
          </button>
          {/* Mobile: auth only inside menu — avoids duplicate Sign in / Sign out on screen */}
          <div className="min-w-0 flex-1 md:hidden" aria-hidden />
        </div>

        {/* Desktop — one row, equal gaps between every control (no flex-1 holes) */}
        <div className="mt-2 hidden w-full md:block">
          <div
            className={cn(
              'relative flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-2 px-3 py-2.5 sm:gap-x-3 sm:px-4',
              NAV_BAND_FILL,
              NAV_BAND_SHELL
            )}
          >
            {/* Stripe only behind primary pills — not across Log in / Join (was reading as a strike-through) */}
            <div className="relative z-0 inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 sm:gap-x-3">
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                aria-hidden
              />
              {PRIMARY_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} onClick={scrollToTop} className={getNavLinkClass(href)}>
                  {label}
                </Link>
              ))}
            </div>
            {mounted && !user && (
              <div className="relative z-10 ml-1 flex items-center sm:ml-2" aria-label="Account">
                <div className={authDesktopClusterClass}>
                  <Link href="/login" onClick={scrollToTop} className={authDesktopLinkClass}>
                    Log in
                  </Link>
                  <span className="w-px shrink-0 self-stretch bg-white/15" aria-hidden />
                  <Link href="/signup" onClick={scrollToTop} className={authDesktopLinkClass}>
                    Join
                  </Link>
                </div>
              </div>
            )}
            {mounted && user && (
              <div className="relative z-10 ml-1 flex flex-wrap items-center justify-center gap-2 sm:ml-2 sm:gap-2.5">
                <span className="hidden h-4 w-px shrink-0 bg-white/20 sm:block" aria-hidden />
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    scrollToTop();
                  }}
                  className="text-[11px] sm:text-xs font-medium text-slate-400 hover:text-white hover:underline underline-offset-4 transition-colors"
                >
                  Sign out
                </button>
                {userRole === 'admin' && (
                  <Link href="/admin" onClick={scrollToTop} className={getNavLinkClass('/admin')}>
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile overlay + sheet */}
        {mobileOpen && (
          <>
            <button
              type="button"
              className="fixed left-0 right-0 bottom-0 top-[4.75rem] z-[185] bg-slate-950/70 backdrop-blur-sm sm:top-[5rem] md:hidden"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <div
              id="mobile-nav-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
              className="fixed left-0 right-0 bottom-0 z-[186] top-[4.75rem] sm:top-[5rem] md:hidden flex flex-col gap-1.5 overflow-y-auto border border-white/10 border-t-0 bg-slate-900/97 p-3 pb-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            >
              {PRIMARY_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => {
                    scrollToTop();
                    closeMobile();
                  }}
                  className={getMobileLinkClass(href)}
                >
                  {label}
                </Link>
              ))}

              {mounted && !user && (
                <div className="mt-1 border-t border-white/10 pt-2">
                  <p className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Account</p>
                  <div className={`${authMobileClusterClass} mt-1`}>
                    <Link
                      href="/login"
                      onClick={() => {
                        scrollToTop();
                        closeMobile();
                      }}
                      className={authMobileSignInClass}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => {
                        scrollToTop();
                        closeMobile();
                      }}
                      className={authMobileSignUpClass}
                    >
                      Join
                    </Link>
                  </div>
                </div>
              )}

              {mounted && user && (
                <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-2">
                  <p className="px-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">Account</p>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        scrollToTop();
                        closeMobile();
                      }}
                      className={getMobileLinkClass('/admin')}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      scrollToTop();
                      closeMobile();
                    }}
                    className="flex w-full items-center justify-center min-h-[42px] px-4 text-sm font-medium text-slate-400 hover:text-white rounded-none border border-white/15 bg-transparent hover:bg-white/[0.06] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
