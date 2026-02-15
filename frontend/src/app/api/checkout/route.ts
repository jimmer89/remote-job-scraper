import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    // Determine base URL from NEXTAUTH_URL or request headers
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const proto = headersList.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXTAUTH_URL || `${proto}://${host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: session.user.email,
      metadata: {
        userId: (session.user as any).id || '',
        email: session.user.email,
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
