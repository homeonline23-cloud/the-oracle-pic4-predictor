import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_wOamvyvM37FkG0Jernvl3A_wL1gl2D9';

  // Hardcode fallback if user has missing or swapped URL in settings
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://tvsplftucbntmcuadfsf.supabase.co';
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
