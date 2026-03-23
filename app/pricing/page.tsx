'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Nav from '@/components/Nav';

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleJoinWaitlist(planName: string) {
    if (!session?.user?.email) {
      window.location.href = '/auth/signin?callbackUrl=/pricing';
      return;
    }

    setLoading(planName);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          subject: `Waitlist: ${planName}`,
          message: `User wants to join the waitlist for the ${planName} plan.`,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess(planName);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  const PlanButton = ({ planId, primary }: { planId: string; primary?: boolean }) => {
    if (planId === 'free') {
      return (
        <Link
          href={session ? '/analyze' : '/auth/signin'}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Get Started Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      );
    }

    if (success === planId) {
      return (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle className="h-4 w-4" />
          You&apos;re on the list!
        </div>
      );
    }

    return (
      <button
        onClick={() => handleJoinWaitlist(planId)}
        disabled={loading === planId}
        className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
          primary
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
      >
        {loading === planId ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Joining...
          </span>
        ) : (
          'Join Waitlist'
        )}
      </button>
    );
  };

  return (
    <div className="min-h-dvh bg-white">
      <Nav />

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1
            className="text-3xl font-bold text-gray-900 sm:text-4xl"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            Simple pricing, no surprises
          </h1>
          <p className="mt-3 text-base text-gray-500">
            Start free. Upgrade when you need more analyses.
          </p>
        </div>

        {/* What's free callout */}
        <div className="mx-auto mb-12 max-w-2xl rounded-xl border border-indigo-100 bg-indigo-50/50 px-6 py-4 text-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-indigo-700">AI Chat, PDF Export, Negotiation Emails, Compare</span>
            {' '}— all free on every plan. You only pay for contract analyses.
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 3 Plans */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <p className="mt-1 text-sm text-gray-500">Try it out</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-sm text-gray-400"> forever</span>
            </div>
            <ul className="mb-8 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                <span><strong>5 analyses</strong> included</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                Unlimited AI chat
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                PDF & DOCX export
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                Negotiation emails
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                No credit card required
              </li>
            </ul>
            <PlanButton planId="free" />
          </div>

          {/* Freelancer */}
          <div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-7 shadow-lg">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
              Most Popular
            </span>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Freelancer</h3>
              <p className="mt-1 text-sm text-gray-500">For active freelancers</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$9.99</span>
              <span className="text-sm text-gray-400"> /month</span>
            </div>
            <ul className="mb-8 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                <span><strong>30 analyses</strong> per month</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                Unlimited AI chat
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                PDF & DOCX export
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                Negotiation emails
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                What-If Simulator
              </li>
            </ul>
            <PlanButton planId="freelancer" primary />
          </div>

          {/* Agency */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Agency</h3>
              <p className="mt-1 text-sm text-gray-500">For teams & agencies</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$24.99</span>
              <span className="text-sm text-gray-400"> /month</span>
            </div>
            <ul className="mb-8 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                <span><strong>100 analyses</strong> per month</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                Unlimited AI chat
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                PDF & DOCX export
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                Negotiation emails
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                Priority support
              </li>
            </ul>
            <PlanButton planId="agency" />
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-14 space-y-3 text-center">
          <p className="text-sm text-gray-400">
            All plans include AI Chat, PDF export, negotiation emails, and compare — completely free.
          </p>
          <p className="text-sm text-gray-400">
            Paid plans launching soon. Join the waitlist to be first in line.
          </p>
          <p className="text-sm text-gray-400">
            Questions? <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
