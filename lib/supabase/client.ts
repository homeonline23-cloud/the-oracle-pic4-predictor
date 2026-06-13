import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
  if (browserClient) return browserClient;

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_wOamvyvM37FkG0Jernvl3A_wL1gl2D9';

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://tvsplftucbntmcuadfsf.supabase.co';
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
};
