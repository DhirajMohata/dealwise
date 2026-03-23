// Legacy file — payments now handled via Razorpay (lib/razorpay.ts)
// Keeping plan definitions here for backward compatibility with components that import them

export const SUBSCRIPTION_PLANS = [
  { id: 'freelancer', name: 'Freelancer', price: 999, priceLabel: '$9.99/mo', credits: 30, features: ['30 analyses/month', 'Unlimited AI chat', 'PDF & DOCX export', 'Negotiation emails'] },
  { id: 'agency', name: 'Agency', price: 2499, priceLabel: '$24.99/mo', credits: 100, features: ['100 analyses/month', 'Unlimited AI chat', 'PDF & DOCX export', 'Negotiation emails', 'Priority support'] },
];

// No longer used — kept for any lingering imports
export const CREDIT_PACKAGES: never[] = [];

export function isStripeConfigured(): boolean {
  return false;
}
