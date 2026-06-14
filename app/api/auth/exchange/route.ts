import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey } from '@/lib/supabase/config';
import { createRouteHandlerClient } from '@/lib/supabase/routeHandler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Finish OAuth — reads PKCE from cookies (POST avoids gateway 502 on redirect). */
export async function POST(request: NextRequest) {
  if (!getSupabaseAnonKey()) {
    return NextResponse.json({ error: 'Sign-in is not configured.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { code?: string };
  const code = body.code?.trim();

  if (!code) {
    return NextResponse.json({ error: 'Missing sign-in code.' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createRouteHandlerClient(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('auth/exchange:', error.message);
    const friendly = /pkce|code verifier/i.test(error.message)
      ? 'Google sign-in timed out. Tap Sign in with Google once more.'
      : error.message;
    return NextResponse.json({ error: friendly }, { status: 401 });
  }

  return response;
}
