'use client';

import { Upload, Search, CheckCircle } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

export default function HowItWorks() {
  const t = useTranslations('landing');

  const steps = [
    {
      num: '01',
      icon: Upload,
      title: t('howItWorks.step1'),
      desc: t('howItWorks.step1desc'),
    },
    {
      num: '02',
      icon: Search,
      title: t('howItWorks.step2'),
      desc: t('howItWorks.step2desc'),
    },
    {
      num: '03',
      icon: CheckCircle,
      title: t('howItWorks.step3'),
      desc: t('howItWorks.step3desc'),
    },
  ];

  return (
    <section id="how-it-works" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <FadeInView>
          <div className="text-center">
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              {t('howItWorks.title')}
            </h2>
          </div>
        </FadeInView>

        <div className="relative mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {/* Dashed connecting line */}
          <div
            aria-hidden="true"
            className="absolute left-[16.6%] right-[16.6%] top-[20px] hidden border-t-2 border-dashed border-gray-300 sm:block"
          />

          {steps.map((step, i) => (
            <FadeInView key={step.num} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-[13px] font-bold text-white">
                  {step.num}
                </span>
                <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                  <step.icon className="h-5 w-5 text-gray-500" />
                </div>
                <h3 className="mt-3 text-[16px] font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                  {step.desc}
                </p>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
