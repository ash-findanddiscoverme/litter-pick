/**
 * Stripe REST API helper — Edge Runtime compatible.
 * Uses fetch directly instead of the Stripe SDK.
 */

const STRIPE_API = 'https://api.stripe.com/v1';

function getAuthHeader(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  // Stripe expects Basic auth with secret key as username, empty password
  return 'Basic ' + btoa(key + ':');
}

export interface CheckoutSessionParams {
  /** Amount in pence (e.g. 1000 = £10) */
  amountPence: number;
  isRecurring: boolean;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CheckoutSessionParams) {
  const { amountPence, isRecurring, customerEmail, successUrl, cancelUrl } = params;

  const body = new URLSearchParams();
  body.append('payment_method_types[]', 'card');
  body.append('line_items[0][price_data][currency]', 'gbp');
  body.append('line_items[0][price_data][unit_amount]', amountPence.toString());
  body.append('line_items[0][price_data][product_data][name]', 'Litter Pick Donation');
  body.append(
    'line_items[0][price_data][product_data][description]',
    isRecurring
      ? 'Monthly donation to support Litter Pick'
      : 'One-off donation to support Litter Pick'
  );
  body.append('line_items[0][quantity]', '1');

  if (isRecurring) {
    body.append('mode', 'subscription');
    body.append('line_items[0][price_data][recurring][interval]', 'month');
  } else {
    body.append('mode', 'payment');
  }

  body.append('success_url', successUrl);
  body.append('cancel_url', cancelUrl);

  if (customerEmail) {
    body.append('customer_email', customerEmail);
  }

  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || 'Failed to create checkout session');
  }

  return response.json();
}
