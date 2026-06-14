import { NextResponse, type NextRequest } from 'next/server';
import { getAppOrigin } from '@/lib/appOrigin';
import { getSupabaseAnonKey } from '@/lib/supabase/config';
import { createRouteHandlerClient } from '@/lib/supabase/routeHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function loginRedirect(origin: string, message: string) {
  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent(message)}`,
  );
}

/** Finish Google OAuth — exchange code using server PKCE cookies. */
export async function GET(request: NextRequest) {
  const origin = getAppOrigin(request.nextUrl.origin);
  const anonKey = getSupabaseAnonKey();

  if (!anonKey) {
    return loginRedirect(origin, 'Sign-in is not configured. Contact support.');
  }

  const code = request.nextUrl.searchParams.get('code');
  const rawNext = request.nextUrl.searchParams.get('next');
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (!code) {
    return loginRedirect(origin, 'Sign-in link expired. Tap Sign in with Google again.');
  }

  const response = NextResponse.redirect(new URL(next, origin));
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('api/auth/callback:', error.message);
    const friendly = /pkce|code verifier/i.test(error.message)
      ? 'Google sign-in timed out. Tap Sign in with Google once more.'
      : error.message;
    return loginRedirect(origin, friendly);
  }

  return response;
}
