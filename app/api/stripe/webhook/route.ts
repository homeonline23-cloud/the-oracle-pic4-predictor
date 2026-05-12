import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripeServer';
import { subscriptionIdFromInvoice } from '@/lib/stripeInvoiceHelpers';
import { applyStripeSubscriptionToProfile, recordStripeInvoicePayment } from '@/lib/stripeSync';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe webhook: missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        const subId = session.subscription;
        if (typeof subId === 'string') {
          await applyStripeSubscriptionToProfile(subId);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const id = subscriptionIdFromInvoice(invoice);
        if (id) {
          await applyStripeSubscriptionToProfile(id);
          await recordStripeInvoicePayment(invoice);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Stripe webhook handler error:', e);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
