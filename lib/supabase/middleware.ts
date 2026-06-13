import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import {
  getRequiredTierForPath,
  hasPaidGridAccess,
  isAdminEmail,
} from '@/lib/gridAccess';

function getSupabaseConfig() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_wOamvyvM37FkG0Jernvl3A_wL1gl2D9';

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://tvsplftucbntmcuadfsf.supabase.co';
  }

  return { supabaseUrl, supabaseAnonKey };
}

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiredTier = getRequiredTierForPath(pathname);

  if (requiredTier) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdminEmail(user.email)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .single();

      if (!hasPaidGridAccess(profile, requiredTier, user.email)) {
        const pricingUrl = request.nextUrl.clone();
        pricingUrl.pathname = '/pricing';
        pricingUrl.searchParams.set('required', requiredTier);
        return NextResponse.redirect(pricingUrl);
      }
    }
  }

  return response;
};
