'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'to start',
    highlight: false,
    features: [
      '5 credits (5 analyses)',
      'Unlimited AI chat',
      'PDF & DOCX export',
      'Negotiation emails',
      'No credit card required',
    ],
  },
  {
    name: 'Freelancer',
    price: '$9.99',
    period: '/month',
    highlight: true,
    badge: 'Most Popular',
    features: [
      '30 analyses per month',
      'Unlimited AI chat',
      'PDF & DOCX export',
      'Negotiation emails',
      'What-If Simulator',
    ],
  },
  {
    name: 'Agency',
    price: '$24.99',
    period: '/month',
    highlight: false,
    features: [
      '100 analyses per month',
      'Unlimited AI chat',
      'PDF & DOCX export',
      'Negotiation emails',
      'Priority support',
    ],
  },
];

export default function PricingPreview() {
  const t = useTranslations('landing');

  return (
    <section id="pricing" className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <FadeInView>
          <div className="text-center">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              {t('pricing.title')}
            </h2>
            <p className="mt-3 text-[15px] text-gray-500">
              {t('pricing.subtitle')}
            </p>
            <p className="mt-1 text-[13px] text-gray-400">
              AI Chat, PDF export, negotiation emails &amp; compare are free on every plan.
            </p>
          </div>
        </FadeInView>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan, i) => (
            <FadeInView key={plan.name} delay={i * 0.1}>
              <div
                className={`relative h-full rounded-2xl bg-white p-7 ${
                  plan.highlight
                    ? 'border-2 border-indigo-600 shadow-lg'
                    : 'border border-gray-200'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900" style={serifStyle}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-400"> {plan.period}</span>
                </div>

                <ul className="mb-8 space-y-3 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          plan.highlight ? 'text-indigo-600' : 'text-emerald-500'
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={0.3}>
          <div className="mt-10 text-center">
            <Link
              href="/auth/signin?callbackUrl=/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Start Analyzing Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
