import { NextResponse, type NextRequest } from 'next/server';
import { getAppOrigin } from '@/lib/appOrigin';
import { getSupabaseAnonKey } from '@/lib/supabase/config';
import { createRouteHandlerClient } from '@/lib/supabase/routeHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Start Google OAuth on the server — PKCE cookie survives iPhone fingerprint approval. */
export async function GET(request: NextRequest) {
  const origin = getAppOrigin(request.nextUrl.origin);
  const anonKey = getSupabaseAnonKey();

  if (!anonKey) {
    return NextResponse.redirect(
      `${origin}/login?message=${encodeURIComponent('Sign-in is not configured. Contact support.')}`,
    );
  }

  const rawNext = request.nextUrl.searchParams.get('next');
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';
  const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const cookieJar = NextResponse.redirect(`${origin}/login`);
  const supabase = createRouteHandlerClient(request, cookieJar);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl },
  });

  if (error || !data?.url) {
    const message = error?.message ?? 'Could not start Google sign-in.';
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(message)}`);
  }

  return NextResponse.redirect(data.url, { headers: cookieJar.headers });
}
