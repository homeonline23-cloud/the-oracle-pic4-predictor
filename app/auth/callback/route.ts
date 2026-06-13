import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getAppOrigin } from '@/lib/appOrigin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function loginRedirect(origin: string, message: string) {
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('message', message);
  return NextResponse.redirect(loginUrl);
}

/** Server-side OAuth callback — exchanges Google code using PKCE cookies. */
export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const origin = getAppOrigin(requestUrl.origin);
    const code = requestUrl.searchParams.get('code');
    const rawNext = requestUrl.searchParams.get('next');
    const next =
      rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

    if (!code) {
      return loginRedirect(origin, 'Sign-in link expired. Please try Sign in with Google again.');
    }

    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    let response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('auth/callback exchangeCodeForSession:', error.message);
      return loginRedirect(origin, error.message);
    }

    return response;
  } catch (error) {
    console.error('auth/callback:', error);
    const origin = getAppOrigin(new URL(request.url).origin);
    const message =
      error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
    return loginRedirect(origin, message);
  }
}
