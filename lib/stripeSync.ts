import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPaidTier, TIER_LIMITS, type PaidTier } from '@/lib/subscriptionTiers';
import { getStripe } from '@/lib/stripeServer';
import { currentPeriodEndFromSubscription, subscriptionIdFromInvoice } from '@/lib/stripeInvoiceHelpers';

/**
 * Apply an active Stripe subscription period to the Supabase profile (service role).
 * Resets usage for a new billing period (same idea as PayPal capture).
 */
export async function applyStripeSubscriptionToProfile(subscriptionId: string) {
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId);

  const tierRaw = sub.metadata?.tier ?? '';
  if (!isPaidTier(tierRaw)) {
    console.warn('Stripe subscription missing valid tier metadata:', subscriptionId, tierRaw);
    return { ok: false as const, reason: 'invalid_tier' };
  }
  const tier: PaidTier = tierRaw;

  const userId = sub.metadata?.supabase_user_id?.trim() || '';
  const limits = TIER_LIMITS[tier];
  const periodEndUnix =
    currentPeriodEndFromSubscription(sub) ??
    Math.floor(Date.now() / 1000) + limits.days * 24 * 60 * 60;
  const periodEnd = new Date(periodEndUnix * 1000).toISOString();

  if (userId) {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_expires_at: periodEnd,
        predictions_limit: limits.predictions_limit,
        predictions_used: 0,
        grids_limit: limits.grids_limit,
        grids_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  }

  return { ok: true as const, tier, userId: userId || null, subscription: sub };
}

export async function recordStripeInvoicePayment(invoice: Stripe.Invoice) {
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return;

  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subId);
  const tierRaw = sub.metadata?.tier ?? '';
  if (!isPaidTier(tierRaw)) return;

  const userId = sub.metadata?.supabase_user_id?.trim() || null;
  const invId = invoice.id;
  if (!invId) return;

  const supabaseAdmin = createAdminClient();
  const { error: paymentError } = await supabaseAdmin.from('payments').upsert(
    {
      order_id: invId,
      user_id: userId,
      email: invoice.customer_email ?? null,
      amount: invoice.amount_paid != null ? invoice.amount_paid / 100 : null,
      currency: (invoice.currency ?? 'usd').toUpperCase(),
      tier: tierRaw,
    },
    { onConflict: 'order_id' }
  );

  if (paymentError) {
    console.error('Stripe payment row upsert failed:', paymentError);
  }
}
