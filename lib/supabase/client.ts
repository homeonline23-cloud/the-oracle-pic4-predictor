import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

function parseDocumentCookies(): Array<{ name: string; value: string }> {
  if (typeof document === 'undefined') return [];
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
}

/** PKCE verifier in cookies — survives Google redirect + iPhone fingerprint approval on same browser. */
function createBrowserSupabaseClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return parseDocumentCookies();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const parts = [
            `${name}=${encodeURIComponent(value)}`,
            `path=${options?.path ?? '/'}`,
          ];
          if (options?.maxAge != null) parts.push(`max-age=${options.maxAge}`);
          const sameSite = options?.sameSite ?? 'lax';
          parts.push(
            `SameSite=${sameSite.charAt(0).toUpperCase()}${String(sameSite).slice(1)}`,
          );
          if (options?.secure ?? window.location.protocol === 'https:') {
            parts.push('Secure');
          }
          document.cookie = parts.join('; ');
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

export function resetBrowserClient(): void {
  browserClient = undefined;
}
