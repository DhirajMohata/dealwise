'use client';

import Link from 'next/link';
import { RefreshCw, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { FadeInView, Card } from '@/components/ui';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

const problems = [
  {
    icon: RefreshCw,
    clause: '"Unlimited revisions"',
    impact: '200+ hours of unpaid rework',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Clock,
    clause: 'Net-60 payment terms',
    impact: '2 months waiting for money',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: ShieldAlert,
    clause: 'IP transfer before payment',
    impact: 'No leverage when client ghosts',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function ProblemStatement() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <FadeInView>
          <div className="text-center">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px] max-w-3xl mx-auto"
              style={serifStyle}
            >
              Freelancers lose an average of $12,000/year to contract clauses
              they didn&apos;t understand
            </h2>
          </div>
        </FadeInView>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {problems.map((p, i) => (
            <FadeInView key={p.clause} delay={i * 0.1}>
              <Card hover padding="lg" className="text-center h-full">
                <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${p.bgColor}`}>
                  <p.icon className={`h-6 w-6 ${p.color}`} />
                </div>
                <p className="mt-5 text-[15px] font-semibold text-gray-900">
                  {p.clause}
                </p>
                <p className="mt-2 text-[14px] text-gray-500">{p.impact}</p>
              </Card>
            </FadeInView>
          ))}
        </div>

        <FadeInView delay={0.3}>
          <div className="mt-12 text-center">
            <p className="text-[15px] text-gray-600 mb-4">
              Does your current contract have these? Find out in 30 seconds.
            </p>
            <Link
              href="/auth/signin?callbackUrl=/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Check My Contract
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
