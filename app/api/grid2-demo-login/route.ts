import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  GRID2_DEMO_ENABLED,
  getGrid2DemoEmailServer,
  getGrid2DemoPasswordServer,
  TESTER_DEMO_GRID_COUNT,
} from '@/lib/demoAuth';

/** Ensures the public tester demo user exists, then signs in server-side (uses live Vercel password). */
export async function POST() {
  if (!GRID2_DEMO_ENABLED) {
    return NextResponse.json({ error: 'Grid 2 demo is disabled' }, { status: 403 });
  }

  const email = getGrid2DemoEmailServer().toLowerCase();
  const password = getGrid2DemoPasswordServer();

  if (!email || !password) {
    return NextResponse.json({ error: 'Grid 2 demo is not configured' }, { status: 503 });
  }

  try {
    const admin = createAdminClient();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Grid 2 Demo' },
    });

    let userId: string | undefined;

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

      userId = existing.id;

      const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    if (!userId) {
      const { data: listData, error: listError } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }
      userId = listData.users?.find((u) => u.email?.toLowerCase() === email)?.id;
    }

    let profileReady = true;
    if (userId) {
      const { error: profileError } = await admin.from('profiles').upsert(
        {
          id: userId,
          full_name: 'Grid 2 Demo',
          subscription_tier: 'standard',
          subscription_status: 'active',
          subscription_expires_at: expiresAt,
          predictions_limit: TESTER_DEMO_GRID_COUNT,
          predictions_used: 0,
          grids_limit: TESTER_DEMO_GRID_COUNT,
          grids_used: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        profileReady = false;
        console.warn('grid2-demo-login: profiles upsert skipped:', profileError.message);
      }
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      profileReady,
      hint: profileReady
        ? undefined
        : 'Demo login works, but run supabase_migration.sql in Supabase if you need full billing/profile features.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Grid 2 demo setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
