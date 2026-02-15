import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    const priceId = process.env.STRIPE_PRICE_ID?.trim();

    if (!stripeKey || !priceId) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 }
      );
    }

    // Get email from request body (sent by authenticated client)
    const body = await request.json();
    const email = body.email;

    if (!email) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const stripe = new Stripe(stripeKey);

    // Determine base URL from request headers
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const proto = headersList.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXTAUTH_URL || `${proto}://${host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: email,
      metadata: {
        email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    const message = error?.message || 'Failed to create checkout session';
    const code = error?.code || error?.type || 'unknown';
    return NextResponse.json(
      { error: `${message} (${code})` },
      { status: 500 }
    );
  }
}
