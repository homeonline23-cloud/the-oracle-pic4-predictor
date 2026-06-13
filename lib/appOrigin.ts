/** Canonical site URL for OAuth redirects (must match Supabase Auth redirect allow-list). */
export function getAppOrigin(runtimeOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  if (runtimeOrigin) return runtimeOrigin.replace(/\/$/, '');
  return 'https://theoraclepic4.com';
}

export function authCallbackUrl(nextPath?: string | null): string {
  const origin = getAppOrigin(typeof window !== 'undefined' ? window.location.origin : undefined);
  const base = `${origin}/auth/callback`;
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return `${base}?next=${encodeURIComponent(nextPath)}`;
  }
  return base;
}
