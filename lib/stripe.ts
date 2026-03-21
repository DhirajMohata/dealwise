// Stripe integration — requires STRIPE_SECRET_KEY env var
// Install: npm install stripe (when ready to accept payments)

// Will only work when STRIPE_SECRET_KEY is set
// import Stripe from 'stripe';
// export const stripe = process.env.STRIPE_SECRET_KEY
//   ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
//   : null;

export const CREDIT_PACKAGES = [
  { id: 'credits_50', credits: 50, price: 499, label: '50 Credits', priceLabel: '$4.99' },
  { id: 'credits_200', credits: 200, price: 1499, label: '200 Credits', priceLabel: '$14.99' },
  { id: 'credits_500', credits: 500, price: 2999, label: '500 Credits', priceLabel: '$29.99' },
];

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
