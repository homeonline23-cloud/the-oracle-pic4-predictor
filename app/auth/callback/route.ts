import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

/** Server-side OAuth callback — reads PKCE verifier from cookies (fixes Google sign-in on live). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (!code) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set(
      'message',
      'Sign-in link expired. Please try Sign in with Google again.',
    );
    return NextResponse.redirect(loginUrl);
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  let response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(new URL(next, origin));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('message', error.message);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
