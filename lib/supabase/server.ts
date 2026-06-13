import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config';

export const createClient = async () => {
  const cookieStore = await cookies();
  const anonKey = getSupabaseAnonKey();

  return createServerClient(
    getSupabaseUrl(),
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Error ignored for server action usage
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Error ignored for server action usage
          }
        },
      },
    }
  );
};
