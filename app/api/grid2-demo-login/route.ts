import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  GRID2_DEMO_EMAIL,
  GRID2_DEMO_PASSWORD,
  GRID2_DEMO_ENABLED,
} from '@/lib/demoAuth';
import { TIER_LIMITS } from '@/lib/subscriptionTiers';

/** Ensures the public 2-grid demo user exists with standard-tier access only. */
export async function POST() {
  if (!GRID2_DEMO_ENABLED) {
    return NextResponse.json({ error: 'Grid 2 demo is disabled' }, { status: 403 });
  }

  if (!GRID2_DEMO_EMAIL || !GRID2_DEMO_PASSWORD) {
    return NextResponse.json({ error: 'Grid 2 demo is not configured' }, { status: 503 });
  }

  try {
    const admin = createAdminClient();
    const email = GRID2_DEMO_EMAIL.toLowerCase();
    const limits = TIER_LIMITS.standard;
    const expiresAt = new Date(Date.now() + limits.days * 24 * 60 * 60 * 1000).toISOString();

    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password: GRID2_DEMO_PASSWORD,
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
        password: GRID2_DEMO_PASSWORD,
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

    if (userId) {
      const { error: profileError } = await admin
        .from('profiles')
        .upsert(
          {
            id: userId,
            full_name: 'Grid 2 Demo',
            subscription_tier: 'standard',
            subscription_status: 'active',
            subscription_expires_at: expiresAt,
            predictions_limit: limits.predictions_limit,
            predictions_used: 0,
            grids_limit: limits.grids_limit,
            grids_used: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );

      if (profileError) {
        console.warn('grid2-demo-login: profiles upsert skipped:', profileError.message);
        return NextResponse.json({
          ok: true,
          profileReady: false,
          hint:
            'Demo login works, but run supabase_migration.sql in Supabase if you need full billing/profile features.',
        });
      }
    }

    return NextResponse.json({ ok: true, profileReady: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Grid 2 demo setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
