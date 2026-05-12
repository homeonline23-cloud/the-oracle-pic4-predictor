import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPaidTier, TIER_LIMITS } from '@/lib/subscriptionTiers';

export async function POST(req: Request) {
  let payload: { orderId?: string; userId?: string; tier?: string; email?: string; amount?: number; currency?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { orderId, userId, tier, email, amount, currency } = payload;

  if (!orderId || !tier) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  if (!isPaidTier(tier)) {
    return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const limits = TIER_LIMITS[tier];
    const expiresAt = new Date(Date.now() + limits.days * 24 * 60 * 60 * 1000).toISOString();

    // Update the user profile with the subscription information.
    // The schema uses `subscription_tier` (not `role`) and we also need to bump the
    // limits and reset usage so the AI predictor doesn't immediately block the user.
    if (userId) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          subscription_expires_at: expiresAt,
          predictions_limit: limits.predictions_limit,
          predictions_used: 0,
          grids_limit: limits.grids_limit,
          grids_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    }

    // Always record the payment so admins can audit it, even for guest checkouts.
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .upsert(
        {
          order_id: orderId,
          user_id: userId ?? null,
          email: email ?? null,
          amount: amount ?? null,
          currency: currency ?? 'USD',
          tier,
        },
        { onConflict: 'order_id' }
      );

    if (paymentError) {
      // Don't fail the whole request if just the audit row failed - the user already paid.
      console.error('Payment row insert failed:', paymentError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to process payment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
