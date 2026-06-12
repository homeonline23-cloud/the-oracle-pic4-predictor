import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const number = String(body.number ?? '').trim();
    const location = String(body.location ?? 'Global').trim() || 'Global';

    if (!/^\d{4}$/.test(number)) {
      return NextResponse.json({ error: 'Enter a valid 4-digit number.' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sign in to record winning numbers.' }, { status: 401 });
    }

    const row = {
      number,
      location,
      recorded_by: user.id,
    };

    try {
      const admin = createAdminClient();
      const { error } = await admin.from('winning_numbers').insert(row);
      if (error) throw error;
    } catch (adminErr) {
      console.warn('Admin insert failed, trying user session:', adminErr);
      const { error } = await supabase.from('winning_numbers').insert(row);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json({ ok: true, number, location });
  } catch (error) {
    console.error('record-winning-number:', error);
    const message = error instanceof Error ? error.message : 'Failed to record winning number.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
