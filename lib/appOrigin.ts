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

/**
 * Origin for OAuth redirects. Uses the page you are actually on (localhost vs live)
 * so local testing never jumps to theoraclepic4.com.
 * NEXT_PUBLIC_APP_URL is only used when no runtime origin exists (emails, scripts).
 */
export function getAppOrigin(runtimeOrigin?: string): string {
  const normalizedRuntime = runtimeOrigin?.trim().replace(/\/$/, '');
  if (normalizedRuntime) return normalizedRuntime;

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
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
