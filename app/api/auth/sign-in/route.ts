import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

/** Email + password sign-in with HttpOnly session cookies (more reliable than client-only auth). */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    let response = NextResponse.json({ ok: true });

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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json({ error: 'Sign-in did not create a session.' }, { status: 401 });
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign-in failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
