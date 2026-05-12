import type Stripe from 'stripe';

/** Subscription invoices in API 2025+ expose the subscription id under `parent.subscription_details`. */
export function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  if (
    !parent ||
    parent.type !== 'subscription_details' ||
    !parent.subscription_details
  ) {
    return null;
  }
  const sub = parent.subscription_details.subscription;
  if (typeof sub === 'string') return sub;
  if (sub && typeof sub === 'object' && 'id' in sub && typeof sub.id === 'string') {
    return sub.id;
  }
  return null;
}

export function currentPeriodEndFromSubscription(sub: Stripe.Subscription): number | null {
  const first = sub.items?.data?.[0];
  if (first && typeof first.current_period_end === 'number') {
    return first.current_period_end;
  }
  return null;
}
