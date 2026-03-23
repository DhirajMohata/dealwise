'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

export default function FinalCTA() {
  const t = useTranslations('landing');

  return (
    <section className="bg-indigo-600 px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <FadeInView>
          <h2
            className="text-[28px] font-bold tracking-tight text-white md:text-[36px]"
            style={serifStyle}
          >
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-indigo-100">
            {t('cta.subtitle')}
          </p>
        </FadeInView>

        <FadeInView delay={0.05}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/auth/signin?callbackUrl=/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[15px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              {t('cta.button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/signin?callbackUrl=%2Fanalyze%3Fsample%3Dtrue"
              className="text-[13px] text-indigo-200 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-white"
            >
              or try with a sample contract
            </Link>
          </div>
          <p className="mt-4 text-[12px] text-indigo-200">
            5 free credits &middot; No credit card &middot; Your data is never
            stored
          </p>
        </FadeInView>
      </div>
    </section>
  );
}
