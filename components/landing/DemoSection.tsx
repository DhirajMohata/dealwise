'use client';

import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { FadeInView } from '@/components/ui';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

const redFlags = [
  { severity: 'CRITICAL', label: 'Unlimited revisions', detail: 'No cap on revision rounds drains your effective rate to near zero' },
  { severity: 'CRITICAL', label: 'Net-90 payment terms', detail: 'You won\'t see a dollar for 3 months after delivery' },
  { severity: 'HIGH', label: '18-month non-compete', detail: 'Blocks you from similar work for a year and a half' },
];

export default function DemoSection() {
  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <FadeInView>
          <div className="text-center mb-12">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              See it in action
            </h2>
            <p className="mt-3 text-[15px] text-gray-500">
              Here&apos;s what DealWise finds in a real contract &mdash; in seconds.
            </p>
          </div>
        </FadeInView>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Left: Contract Snippet */}
          <FadeInView delay={0.05}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-4">
                Sample Contract
              </p>
              <div className="font-mono text-[13px] leading-[1.85] text-gray-600">
                <span className="text-gray-400">&ldquo;...&nbsp;</span>
                Freelancer shall make{' '}
                <span className="bg-red-100 text-red-700 rounded px-1 font-semibold">
                  UNLIMITED REVISIONS
                </span>{' '}
                until Client is fully satisfied. Payment of $3,200 shall be made{' '}
                <span className="bg-red-100 text-red-700 rounded px-1 font-semibold">
                  NET-90
                </span>{' '}
                after Client accepts final deliverable. No deposit required. Freelancer agrees to a{' '}
                <span className="bg-red-100 text-red-700 rounded px-1 font-semibold">
                  18-MONTH NON-COMPETE
                </span>{' '}
                clause preventing work with competing firms in the same industry during the contract period and for eighteen months thereafter.
                <span className="text-gray-400">&nbsp;...&rdquo;</span>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-[12px] font-medium text-red-700">
                  3 red flags detected &mdash; this contract heavily favors the client
                </p>
              </div>
            </div>
          </FadeInView>

          {/* Right: Analysis Results */}
          <FadeInView delay={0.1}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-5 h-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                DealWise Analysis
              </p>

              {/* Score + Recommendation */}
              <div className="flex items-center gap-5">
                <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
                  <svg className="-rotate-90 h-[72px] w-[72px]" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                    <circle
                      cx="36" cy="36" r="30" fill="none" stroke="#ef4444" strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${(15 / 100) * 188.5} 188.5`}
                    />
                  </svg>
                  <span className="absolute text-[22px] font-bold text-red-600">15</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">Deal Score</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">out of 100</p>
                  <span className="mt-1.5 inline-block rounded-full bg-red-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-700">
                    Walk Away
                  </span>
                </div>
              </div>

              {/* Rate */}
              <div className="rounded-lg bg-gray-50 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Effective Rate
                </p>
                <p className="mt-1 text-[18px] font-bold text-gray-900">
                  <span className="text-gray-400 line-through">$75/hr</span>
                  <span className="mx-2 text-gray-300">&rarr;</span>
                  <span className="text-red-600">$31/hr</span>
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  59% rate reduction from hidden clauses
                </p>
              </div>

              {/* Red Flags */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Red Flags
                </p>
                {redFlags.map((flag, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3.5 py-2.5"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        flag.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{flag.label}</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{flag.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>

        {/* CTA */}
        <FadeInView delay={0.15}>
          <div className="text-center mt-12">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
            >
              Now analyze YOUR contract
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-3 text-[12px] text-gray-400">
              5 free credits on signup &middot; No credit card required
            </p>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
