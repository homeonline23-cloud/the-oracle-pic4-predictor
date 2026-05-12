import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripeServer';
import { isPaidTier, type PaidTier } from '@/lib/subscriptionTiers';

function priceIdForTier(tier: PaidTier): string | undefined {
  const map: Record<PaidTier, string | undefined> = {
    standard: process.env.STRIPE_PRICE_STANDARD,
    premium: process.env.STRIPE_PRICE_PREMIUM,
    yearly: process.env.STRIPE_PRICE_YEARLY,
  };
  return map[tier]?.trim() || undefined;
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured on the server.' }, { status: 503 });
  }

  let body: { tier?: string; userId?: string | null; userEmail?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const tier = body.tier;
  if (!tier || !isPaidTier(tier)) {
    return NextResponse.json({ error: 'Invalid subscription tier.' }, { status: 400 });
  }

  const priceId = priceIdForTier(tier);
  if (!priceId) {
    return NextResponse.json(
      { error: 'Missing Stripe price ID for this tier. Set STRIPE_PRICE_* in the server environment.' },
      { status: 500 }
    );
  }

  const origin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  const userEmail = typeof body.userEmail === 'string' ? body.userEmail.trim() : '';

  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?stripe_success=1`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: userId || undefined,
      ...(userEmail ? { customer_email: userEmail } : {}),
      metadata: {
        tier,
        supabase_user_id: userId,
      },
      subscription_data: {
        metadata: {
          tier,
          supabase_user_id: userId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout.session.create failed:', e);
    return NextResponse.json({ error: 'Could not start Stripe checkout.' }, { status: 500 });
  }
}
