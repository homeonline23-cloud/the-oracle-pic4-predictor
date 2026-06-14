/** True when the browser or request is on a local dev machine (not production). */
export function isLocalDevOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost') ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
}

/** Live site always uses www so OAuth cookies match Supabase Site URL. */
export function normalizeProductionOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    if (url.hostname === 'theoraclepic4.com') {
      url.hostname = 'www.theoraclepic4.com';
    }
    return url.origin;
  } catch {
    return origin.replace(/\/$/, '');
  }
}

/**
 * Origin for OAuth redirects. Uses the page you are actually on (localhost vs live)
 * so local testing never jumps to theoraclepic4.com.
 * NEXT_PUBLIC_APP_URL is only used when no runtime origin exists (emails, scripts).
 */
export function getAppOrigin(runtimeOrigin?: string): string {
  const normalizedRuntime = runtimeOrigin?.trim().replace(/\/$/, '');
  if (normalizedRuntime) {
    if (isLocalDevOrigin(normalizedRuntime)) return normalizedRuntime;
    return normalizeProductionOrigin(normalizedRuntime);
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (configured) return normalizeProductionOrigin(configured);
  return 'https://www.theoraclepic4.com';
}

export function authCallbackUrl(nextPath?: string | null): string {
  const origin = getAppOrigin(typeof window !== 'undefined' ? window.location.origin : undefined);
  const base = `${origin}/auth/callback`;
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    return `${base}?next=${encodeURIComponent(nextPath)}`;
  }
  return base;
}

/** Client redirect to www before OAuth (when middleware does not run). */
export function redirectToWwwIfNeeded(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.hostname !== 'theoraclepic4.com') return false;
  const target = `https://www.theoraclepic4.com${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(target);
  return true;
}
