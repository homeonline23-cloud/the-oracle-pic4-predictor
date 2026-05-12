'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Menu, X } from 'lucide-react';
import { VIDEO_SHELL } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

const publicSiteUrl = (
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://theoraclepic4.com'
);

const PRIMARY_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/visual-evidence', label: 'Evidence' },
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

  const getNavLinkClass = (path: string) => {
    const normalize = (p: string) => (p ? p.replace(/\/$/, '') || '/' : '/');
    const isActive = normalize(pathname) === normalize(path);

    return `${navBtnShell} relative z-10 inline-flex min-h-[36px] h-9 items-center justify-center px-3 py-1.5 text-[10px] sm:px-3.5 sm:text-xs ${
      isActive
        ? 'border border-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 text-white shadow-[0_0_20px_rgba(59,130,246,0.55),inset_0_1px_0_rgba(255,255,255,0.28)] hover:brightness-105'
        : 'border-red-600/55 bg-gradient-to-b from-slate-800 via-slate-900 to-black text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_3px_12px_rgba(0,0,0,0.45)] backdrop-blur-sm hover:border-red-400/70 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_22px_rgba(220,38,38,0.25)] active:scale-[0.97]'
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    const normalize = (p: string) => (p ? p.replace(/\/$/, '') || '/' : '/');
    const isActive = normalize(pathname) === normalize(path);
    return `flex w-full items-center justify-center min-h-[48px] px-4 text-sm ${navBtnShell} transition-all duration-200 ${
      isActive
        ? 'border border-white bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 text-white shadow-[0_0_18px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.22)]'
        : 'border border-red-600/55 bg-gradient-to-b from-slate-800 via-slate-900 to-black text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_10px_rgba(0,0,0,0.4)] active:border-red-500/65 active:text-white active:shadow-[0_0_18px_rgba(220,38,38,0.2)]'
    }`;
  };

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[190] flex justify-center py-2 sm:py-2.5 pointer-events-none"
      aria-label="Main navigation"
    >
      <div className={`relative z-10 ${VIDEO_SHELL} pointer-events-auto`}>
        {/* Mobile top bar — chrome matches main windows */}
        <div className="relative flex min-h-[44px] items-center justify-end gap-2 border border-red-600/55 bg-gradient-to-r from-slate-900/95 via-slate-950/98 to-slate-900/95 px-2 py-1.5 shadow-[0_6px_24px_rgba(0,0,0,0.5)] backdrop-blur-md md:hidden">
          <div
            className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)] md:hidden"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-red-600/50 bg-gradient-to-b from-slate-800 to-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_14px_rgba(220,38,38,0.15)] transition-all hover:border-red-400/65 active:scale-95"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={2.5} /> : <Menu className="h-5 w-5" strokeWidth={2.5} />}
          </button>
        </div>

        {/* Desktop row — same outer width as PageHeader video (VIDEO_SHELL); stripe spans full strip like hero line. */}
        <div className="mt-2 hidden w-full md:block">
          <div
            className="relative flex w-full flex-nowrap items-center justify-center gap-2 overflow-x-auto overflow-y-hidden touch-pan-x border border-red-600/55 bg-gradient-to-b from-slate-900 via-slate-950 to-black px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md [scrollbar-width:thin] sm:gap-2.5 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-900/60"
          >
            <div
              className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-0.5 -translate-y-1/2 rounded-none bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.2)] sm:inset-x-3"
              aria-hidden
            />
          {PRIMARY_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={scrollToTop} className={getNavLinkClass(href)}>
              {label}
            </Link>
          ))}

          {mounted && !user && (
            <Link href="/login" onClick={scrollToTop} className={getNavLinkClass('/login')}>
              Sign In
            </Link>
          )}

          {mounted && user && (
            <button
              type="button"
              onClick={() => {
                handleSignOut();
                scrollToTop();
              }}
              className={`${navBtnShell} relative z-10 inline-flex min-h-[36px] h-9 items-center justify-center whitespace-nowrap border border-white/35 bg-gradient-to-b from-slate-800 to-black px-3 text-[10px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-red-400/55 hover:text-white sm:text-xs`}
            >
              Sign Out
            </button>
          )}

          {mounted && userRole === 'admin' && (
            <Link
              href="/admin"
              onClick={scrollToTop}
              className={`${navBtnShell} relative z-10 inline-flex min-h-[36px] h-9 items-center justify-center whitespace-nowrap border-2 border-white/90 bg-gradient-to-b from-red-600 to-red-800 px-3 text-[10px] text-white shadow-[0_0_18px_rgba(220,38,38,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 active:scale-[0.97] sm:text-xs ${pathname === '/admin' ? 'from-red-500 to-red-700 border-white shadow-[0_0_26px_rgba(220,38,38,0.65)] ring-1 ring-white/40' : ''}`}
            >
              Admin
            </Link>
          )}

          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Site openen in nieuw tabblad — kopieer de URL op je iPhone om alles groot te bekijken"
            className={`${navBtnShell} relative z-10 inline-flex min-h-[36px] h-9 items-center justify-center gap-1 whitespace-nowrap border border-emerald-400/55 bg-gradient-to-b from-emerald-600 to-emerald-800 px-3 text-[10px] text-white shadow-[0_0_16px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.22)] hover:brightness-105 sm:text-xs`}
          >
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden />
            <span>Site</span>
          </a>
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
              className="fixed left-0 right-0 bottom-0 z-[186] top-[4.75rem] sm:top-[5rem] md:hidden flex flex-col gap-2 overflow-y-auto border border-white/10 border-t-0 bg-slate-900/97 p-4 pb-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
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
                <Link
                  href="/login"
                  onClick={() => {
                    scrollToTop();
                    closeMobile();
                  }}
                  className={getMobileLinkClass('/login')}
                >
                  Sign In
                </Link>
              )}

              {mounted && user && (
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    scrollToTop();
                    closeMobile();
                  }}
                  className="flex w-full items-center justify-center min-h-[48px] px-4 text-sm rounded-none border border-white/35 bg-gradient-to-b from-slate-800 to-black font-bold tracking-wide text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:border-red-500/50 active:text-white"
                >
                  Sign Out
                </button>
              )}

              {mounted && userRole === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => {
                    scrollToTop();
                    closeMobile();
                  }}
                  className={`flex w-full items-center justify-center min-h-[48px] px-4 text-sm rounded-none border-2 border-white/90 bg-gradient-to-b from-red-600 to-red-800 font-bold tracking-wide text-white shadow-[0_0_18px_rgba(220,38,38,0.45)] active:scale-[0.99] ${pathname === '/admin' ? 'from-red-500 to-red-900 ring-1 ring-white/30' : ''}`}
                >
                  Admin
                </Link>
              )}

              <a
                href={publicSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className="mt-2 flex w-full items-center justify-center gap-2 min-h-[48px] px-4 text-sm rounded-none border border-emerald-400/50 bg-gradient-to-b from-emerald-600 to-emerald-800 font-bold tracking-wide text-white shadow-[0_0_16px_rgba(16,185,129,0.4)] active:brightness-95"
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                Open live site
              </a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
