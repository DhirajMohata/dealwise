import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay only when keys are available
export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function isRazorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

// Verify Razorpay payment signature
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Verify Razorpay subscription signature
export function verifySubscriptionSignature({
  subscriptionId,
  paymentId,
  signature,
}: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const body = paymentId + '|' + subscriptionId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Plan definitions (amounts in paise — INR smallest unit)
// Using USD pricing converted to INR at ~83 rate, but keeping USD for international
export const PLANS = {
  freelancer: {
    id: 'freelancer',
    name: 'Freelancer',
    amount: 999, // $9.99 in cents
    currency: 'USD',
    credits: 30,
    interval: 'monthly' as const,
    description: 'Freelancer Plan — 30 analyses/month',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    amount: 2499, // $24.99 in cents
    currency: 'USD',
    credits: 100,
    interval: 'monthly' as const,
    description: 'Agency Plan — 100 analyses/month',
  },
} as const;

export type PlanId = keyof typeof PLANS;
