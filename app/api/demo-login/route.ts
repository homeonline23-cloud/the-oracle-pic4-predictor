import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_LOGIN_ENABLED } from '@/lib/demoAuth';

/** Ensures the demo user exists with a confirmed email (no inbox needed). */
export async function POST() {
  if (!DEMO_LOGIN_ENABLED) {
    return NextResponse.json({ error: 'Demo login is disabled' }, { status: 403 });
  }

  if (!DEMO_EMAIL || !DEMO_PASSWORD) {
    return NextResponse.json({ error: 'Demo login is not configured' }, { status: 503 });
  }

  try {
    const admin = createAdminClient();
    const email = DEMO_EMAIL.toLowerCase();

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Demo User' },
    });

    if (createError) {
      const { data: listData, error: listError } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const existing = listData.users?.find((u) => u.email?.toLowerCase() === email);
      if (!existing) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Demo setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
