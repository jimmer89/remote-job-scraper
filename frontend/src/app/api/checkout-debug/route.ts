import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Stripe from 'stripe';

export async function GET(request: Request) {
  const checks: Record<string, any> = {};

  // 1. Check env vars (trimmed)
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const priceId = process.env.STRIPE_PRICE_ID?.trim();

  checks.stripe_key_set = !!stripeKey;
  checks.stripe_key_prefix = stripeKey?.substring(0, 7) || 'NOT SET';
  checks.price_id_set = !!priceId;
  checks.price_id = priceId || 'NOT SET';
  checks.price_id_had_whitespace = process.env.STRIPE_PRICE_ID !== priceId;
  checks.nextauth_secret_set = !!process.env.NEXTAUTH_SECRET;
  checks.webhook_secret_set = !!process.env.STRIPE_WEBHOOK_SECRET;

  // 2. Check JWT token
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET?.trim(),
    });
    checks.token_found = !!token;
    checks.token_email = token?.email || null;
    checks.token_userId = token?.userId || null;
  } catch (e: any) {
    checks.token_error = e.message;
  }

  // 3. Test Stripe connection (with trimmed values)
  if (stripeKey && priceId) {
    try {
      const stripe = new Stripe(stripeKey);
      const price = await stripe.prices.retrieve(priceId);
      checks.stripe_price_valid = true;
      checks.stripe_price_active = price.active;
      checks.stripe_price_amount = price.unit_amount;
      checks.stripe_price_currency = price.currency;
    } catch (e: any) {
      checks.stripe_error = e.message;
      checks.stripe_error_type = e.type;
      checks.stripe_error_code = e.code;
    }
  }

  return NextResponse.json(checks);
}
