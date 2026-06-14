import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey } from '@/lib/supabase/config';
import { createRouteHandlerClient } from '@/lib/supabase/routeHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Finish Google OAuth on the server (GET redirect from Supabase — reliable on Vercel). */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get('code')?.trim();
  const rawNext = request.nextUrl.searchParams.get('next');
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  const goLogin = (message: string) =>
    NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(message)}`);

  if (!getSupabaseAnonKey()) {
    return goLogin('Sign-in is not configured.');
  }

  if (!code) {
    return goLogin('Sign-in link expired. Tap Sign in with Google again.');
  }

  const response = NextResponse.redirect(new URL(next, origin));
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('auth/callback GET:', error.message);
    const friendly = /pkce|code verifier/i.test(error.message)
      ? 'Google sign-in timed out. Tap Sign in with Google once more.'
      : error.message;
    return goLogin(friendly);
  }

  return response;
}
