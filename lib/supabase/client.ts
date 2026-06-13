import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  return browserClient;
};

/** After sign-out, next Google login needs a fresh PKCE cookie chain. */
export function resetBrowserClient(): void {
  browserClient = undefined;
}
