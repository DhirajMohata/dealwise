'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FadeInView } from '@/components/ui';
import { useTranslations } from 'next-intl';

const serifStyle: React.CSSProperties = {
  fontFamily: 'var(--font-serif), Georgia, serif',
};

const clauses = [
  { id: 'revisions', label: 'Unlimited revisions', impact: 13, scoreImpact: 12 },
  { id: 'payment', label: 'Net-60 payment terms', impact: 7, scoreImpact: 10 },
  { id: 'killFee', label: 'No kill fee', impact: 13, scoreImpact: 13 },
  { id: 'nonCompete', label: 'Non-compete clause', impact: 8, scoreImpact: 8 },
  { id: 'scopeCreep', label: 'Scope creep language', impact: 11, scoreImpact: 15 },
];

const BASE_RATE = 85;
const BASE_SCORE = 82;

export default function RateRevealDemo() {
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const t = useTranslations('landing');

  const totalImpact = clauses.reduce(
    (sum, c) => sum + (toggled[c.id] ? c.impact : 0),
    0
  );
  const totalScoreImpact = clauses.reduce(
    (sum, c) => sum + (toggled[c.id] ? c.scoreImpact : 0),
    0
  );

  const rate = BASE_RATE - totalImpact;
  const score = Math.max(0, BASE_SCORE - totalScoreImpact);
  const allToggled = clauses.every((c) => toggled[c.id]);

  const rateColor =
    rate >= 70 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600';

  const scoreColor =
    score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';

  const scoreStroke =
    score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#ef4444';

  const circumference = 2 * Math.PI * 54;

  return (
    <section className="bg-indigo-50/30 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <FadeInView>
          <h2
            className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
            style={serifStyle}
          >
            {t('rateReveal.title')}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
            {t('rateReveal.subtitle')}
          </p>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mt-10">
            {/* Rate + Score display */}
            <div className="flex items-center justify-center gap-10">
              {/* Rate */}
              <div>
                <p className="text-[14px] font-medium text-gray-400">Your Rate</p>
                <motion.p
                  key={rate}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`mt-1 text-[56px] font-bold tracking-tight transition-colors duration-300 ${rateColor}`}
                  style={serifStyle}
                >
                  ${rate}/hr
                </motion.p>
              </div>

              {/* Deal Score circle */}
              <div className="flex flex-col items-center">
                <p className="text-[14px] font-medium text-gray-400">Deal Score</p>
                <div className="relative mt-2 flex h-24 w-24 items-center justify-center">
                  <svg className="-rotate-90 h-24 w-24" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <motion.circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={scoreStroke}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <motion.span
                    key={score}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`absolute text-[24px] font-bold ${scoreColor}`}
                  >
                    {score}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Toggleable clauses */}
            <div className="mx-auto mt-8 max-w-md space-y-3 text-left">
              {clauses.map((clause) => (
                <label
                  key={clause.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-all ${
                    toggled[clause.id]
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!toggled[clause.id]}
                      onChange={() =>
                        setToggled((prev) => ({
                          ...prev,
                          [clause.id]: !prev[clause.id],
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 accent-indigo-600"
                    />
                    <span className="text-[14px] font-medium text-gray-700">
                      {clause.label}
                    </span>
                  </div>
                  {toggled[clause.id] && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[13px] font-semibold text-red-500"
                    >
                      -${clause.impact}
                    </motion.span>
                  )}
                </label>
              ))}
            </div>

            {/* Impact message when all toggled */}
            {allToggled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-6 max-w-md rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <p className="text-[14px] font-medium text-red-700">
                  Your rate dropped from ${BASE_RATE} to ${rate} &mdash; a{' '}
                  {Math.round(((BASE_RATE - rate) / BASE_RATE) * 100)}% reduction.
                  And this was only 5 clauses. DealWise checks 30+.
                </p>
              </motion.div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/auth/signin?callbackUrl=/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Upload your contract to see YOUR real rate
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
