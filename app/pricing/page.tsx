'use client';

import Link from 'next/link';
import { ArrowLeft, Check, Sparkles, Zap, Crown } from 'lucide-react';
import Nav from '@/components/Nav';
import { CREDIT_PACKAGES } from '@/lib/stripe';

const PACKAGE_ICONS = [Sparkles, Zap, Crown];
const PACKAGE_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', accent: 'text-blue-600' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', accent: 'text-indigo-600' },
  { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', accent: 'text-purple-600' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFE]">
      <Nav />

      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition-colors hover:text-[#4B5563]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-[#111827] sm:text-4xl">
            Simple, Credit-Based Pricing
          </h1>
          <p className="mt-3 text-[#9CA3AF]">
            Every new account gets <span className="font-semibold text-[#4B5563]">50 free credits</span>. Buy more when you need them.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg, i) => {
            const Icon = PACKAGE_ICONS[i];
            const colors = PACKAGE_COLORS[i];
            const perCredit = (pkg.price / 100 / pkg.credits).toFixed(3);
            const isBestValue = i === CREDIT_PACKAGES.length - 1;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border ${colors.border} ${colors.bg} p-6 shadow-sm transition-all hover:shadow-md ${
                  isBestValue ? 'ring-2 ring-purple-400' : ''
                }`}
              >
                {isBestValue && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Best Value
                  </span>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div className={`rounded-xl ${colors.badge} p-2.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#111827]">{pkg.label}</h2>
                </div>

                <div className="mb-1">
                  <span className="text-3xl font-bold text-[#111827]">{pkg.priceLabel}</span>
                </div>
                <p className="mb-6 text-xs text-[#9CA3AF]">${perCredit} per credit</p>

                <ul className="mb-6 space-y-2 text-sm text-[#4B5563]">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {pkg.credits} contract analyses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    AI-powered insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    PDF &amp; DOCX export
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Never expires
                  </li>
                </ul>

                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-500"
                >
                  Coming Soon
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-[#111827]">Free Tier</h3>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Every account starts with <span className="font-semibold text-[#4B5563]">50 free credits</span> &mdash; no credit card required.
          </p>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            1 credit = 1 basic analysis. AI-enhanced analysis costs 2 credits.
          </p>
          <Link
            href="/analyze"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.25)] transition-all hover:shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            Start Analyzing Free
          </Link>
        </div>
      </div>
    </div>
  );
}
