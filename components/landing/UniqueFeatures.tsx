'use client';

import { FadeInView, Card, Badge } from '@/components/ui';
import { DollarSign, ThumbsUp, SlidersHorizontal, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

const features = [
  {
    icon: DollarSign,
    title: 'Effective Hourly Rate Calculator',
    description: 'See your REAL rate, not the one on paper',
    illustration: (
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] text-gray-400">Quoted</span>
          <span className="text-[18px] font-bold text-gray-900">$85/hr</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] text-gray-400">After clauses</span>
          <span className="text-[18px] font-bold text-red-600">$33/hr</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-[39%] rounded-full bg-gradient-to-r from-red-500 to-red-400" />
        </div>
        <p className="text-[11px] text-gray-400 text-center">61% reduction from hidden clauses</p>
      </div>
    ),
  },
  {
    icon: ThumbsUp,
    title: 'Sign / Negotiate / Walk Away',
    description: 'A clear answer, not just a list of problems',
    illustration: (
      <div className="flex items-center justify-center gap-3">
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-700">
          Sign
        </span>
        <span className="rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-[12px] font-semibold text-amber-700">
          Negotiate
        </span>
        <span className="rounded-full bg-red-50 border border-red-200 px-3.5 py-1.5 text-[12px] font-semibold text-red-700">
          Walk Away
        </span>
      </div>
    ),
  },
  {
    icon: SlidersHorizontal,
    title: 'What-If Simulator',
    description: 'See the financial impact before you negotiate',
    illustration: (
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Revision rounds</span>
            <span className="font-semibold text-gray-700">2 &rarr; 5</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[50%] rounded-full bg-indigo-500" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Payment delay</span>
            <span className="font-semibold text-gray-700">30 &rarr; 60 days</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[75%] rounded-full bg-amber-500" />
          </div>
        </div>
        <div className="rounded-md bg-gray-50 p-2 text-center">
          <span className="text-[11px] text-gray-400">Simulated rate: </span>
          <span className="text-[14px] font-bold text-red-600">$41/hr</span>
        </div>
      </div>
    ),
  },
  {
    icon: Mail,
    title: 'Negotiation Emails',
    description: "Don't just find problems. Solve them.",
    illustration: (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="space-y-1 text-[11px] text-gray-500">
          <p className="font-semibold text-gray-700">Subject: Contract Review Notes</p>
          <div className="h-px bg-gray-200" />
          <p>Hi, I&apos;ve reviewed the contract and noticed a few points...</p>
          <p className="text-indigo-600 font-medium">1. Cap revisions at 2 rounds</p>
          <p className="text-indigo-600 font-medium">2. Move to Net-14 payment</p>
          <p className="text-gray-400 italic">Ready to copy &amp; send</p>
        </div>
      </div>
    ),
  },
];

export default function UniqueFeatures() {
  const t = useTranslations('landing');

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <FadeInView>
          <div className="text-center">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              {t('features.title')}
            </h2>
            <p className="mt-3 text-[15px] text-gray-500">
              {t('features.subtitle')}
            </p>
          </div>
        </FadeInView>

        <div className="mt-14 space-y-6">
          {features.map((feature, i) => (
            <FadeInView key={feature.title} delay={i * 0.1}>
              <Card padding="lg" variant="elevated" className="overflow-hidden">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  {/* Left: Text */}
                  <div className="md:w-[55%]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                        <feature.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <Badge variant="info" className="!text-[10px]">Only in DealWise</Badge>
                    </div>
                    <h3 className="mt-4 text-[18px] font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[14px] text-gray-500">
                      {feature.description}
                    </p>
                  </div>

                  {/* Right: Illustration */}
                  <div className="md:w-[45%]">
                    <div className="rounded-lg border border-gray-100 bg-white p-4">
                      {feature.illustration}
                    </div>
                  </div>
                </div>
              </Card>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
