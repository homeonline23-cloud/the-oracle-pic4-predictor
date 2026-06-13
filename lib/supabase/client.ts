import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/** Store PKCE verifier in cookies (required for Google OAuth callback on mobile + SSR). */
function createBrowserSupabaseClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return document.cookie.split(';').reduce<Array<{ name: string; value: string }>>((acc, part) => {
          const trimmed = part.trim();
          if (!trimmed) return acc;
          const eq = trimmed.indexOf('=');
          if (eq <= 0) return acc;
          acc.push({
            name: trimmed.slice(0, eq),
            value: decodeURIComponent(trimmed.slice(eq + 1)),
          });
          return acc;
        }, []);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const segments = [
            `${name}=${encodeURIComponent(value)}`,
            `path=${options?.path ?? '/'}`,
          ];
          if (options?.maxAge != null) segments.push(`max-age=${options.maxAge}`);
          const sameSite = options?.sameSite ?? 'lax';
          segments.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);
          if (options?.secure ?? window.location.protocol === 'https:') {
            segments.push('Secure');
          }
          document.cookie = segments.join('; ');
        });
      },
    },
  });
}

export const createClient = () => {
  if (browserClient) return browserClient;
  browserClient = createBrowserSupabaseClient();
  return browserClient;
};

/** After sign-out, next Google login needs a fresh PKCE cookie chain. */
export function resetBrowserClient(): void {
  browserClient = undefined;
}
