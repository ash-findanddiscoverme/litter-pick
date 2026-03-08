import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export const runtime = 'edge';

const MIN_AMOUNT_PENCE = 200;   // £2
const MAX_AMOUNT_PENCE = 1000000; // £10,000

export async function POST(request: NextRequest) {
  try {
    const { amount, isRecurring, email } = await request.json();

    // Validate amount (in pounds from client, convert to pence)
    const amountPence = Math.round(Number(amount) * 100);

    if (!amountPence || amountPence < MIN_AMOUNT_PENCE || amountPence > MAX_AMOUNT_PENCE) {
      return NextResponse.json(
        { error: 'Please enter an amount between £2 and £10,000.' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';

    const session = await createCheckoutSession({
      amountPence,
      isRecurring: Boolean(isRecurring),
      customerEmail: email || undefined,
      successUrl: `${origin}/donate/success`,
      cancelUrl: `${origin}/donate/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Donation session error:', err);
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
