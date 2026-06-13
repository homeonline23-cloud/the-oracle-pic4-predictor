import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getAppOrigin } from '@/lib/appOrigin';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function loginRedirect(origin: string, message: string) {
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('message', message);
  return NextResponse.redirect(loginUrl);
}

/** Server OAuth callback — reads PKCE cookies from the request (works on phone + desktop). */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = getAppOrigin(requestUrl.origin);

  try {
    const code = requestUrl.searchParams.get('code');
    const rawNext = requestUrl.searchParams.get('next');
    const next =
      rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

    if (!code) {
      return loginRedirect(origin, 'Sign-in link expired. Please try Sign in with Google again.');
    }

    const anonKey = getSupabaseAnonKey();
    if (!anonKey) {
      return loginRedirect(origin, 'Sign-in is not configured on the server. Contact support.');
    }

    let response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(getSupabaseUrl(), anonKey, {
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
      const friendly = /pkce|code verifier/i.test(error.message)
        ? 'Google sign-in expired. Please go to Sign In and try again once.'
        : error.message;
      return loginRedirect(origin, friendly);
    }

    return response;
  } catch (error) {
    console.error('auth/callback:', error);
    const message =
      error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
    return loginRedirect(origin, message);
  }
}
