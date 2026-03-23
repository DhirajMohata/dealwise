'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { FadeInView, Badge } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

export default function Hero() {
  const { status } = useSession();
  const t = useTranslations('landing');

  return (
    <section className="bg-white px-6 pt-28 pb-20">
      <div className="mx-auto max-w-6xl">
        {/* Welcome-back banner */}
        {status === 'authenticated' && (
          <FadeInView>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-indigo-100 bg-indigo-50 px-5 py-2.5">
              <p className="text-sm font-medium text-indigo-700">
                Welcome back!{' '}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-indigo-800"
                >
                  Go to your Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </FadeInView>
        )}

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left 60% */}
          <div className="lg:w-[60%]">
            <FadeInView>
              <Badge variant="info" className="!rounded-full !px-3 !py-1 !text-[12px] !tracking-normal !normal-case !border-indigo-100 !bg-indigo-50 !text-indigo-600">
                5 free credits on signup &middot; No credit card required
              </Badge>
            </FadeInView>

            <FadeInView delay={0.05}>
              <h1
                className="mt-6 text-[40px] font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-[48px] md:text-[56px]"
                style={serifStyle}
              >
                {t('heroTitle')}
              </h1>
            </FadeInView>

            <FadeInView delay={0.1}>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-gray-500">
                {t('heroSubtitle')}
              </p>
            </FadeInView>

            <FadeInView delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/signin?callbackUrl=/analyze"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  {t('heroCta')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
                >
                  {t('heroSecondary')}
                </a>
              </div>
            </FadeInView>

            <FadeInView delay={0.2}>
              <p className="mt-4 text-[12px] text-gray-400">
                PDF, DOCX, TXT &middot; 30-second analysis &middot; 6-country
                legal context
              </p>
            </FadeInView>
          </div>

          {/* Right 40% — Product Preview */}
          <div className="lg:w-[40%]">
            <FadeInView delay={0.15}>
              <motion.div
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-lg"
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Score row */}
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <svg className="-rotate-90 h-16 w-16" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="27" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="27" fill="none" stroke="#ef4444" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${(42 / 100) * 169.6} 169.6`}
                      />
                    </svg>
                    <span className="absolute text-[18px] font-bold text-red-600">42</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">Deal Score</p>
                    <span className="mt-1 inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-red-700">
                      Walk Away
                    </span>
                  </div>
                </div>

                {/* Rate */}
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Effective Rate
                  </p>
                  <p className="mt-1 text-[17px] font-bold text-gray-900">
                    <span className="text-gray-400 line-through">$62/hr</span>
                    <span className="mx-2 text-gray-300">&rarr;</span>
                    <span className="text-red-600">$24/hr</span>
                  </p>
                </div>

                {/* Red flag pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                    Unlimited Revisions
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                    Net-60 Payment
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                    IP Before Payment
                  </span>
                </div>
              </motion.div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  );
}
