'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Info,
  AlertTriangle,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/analyzer';
import { getLikelihoodStyle } from '@/lib/analyze-helpers';
import { getSettings } from '@/lib/settings';
import { simpleMarkdownToHtml } from '@/lib/markdown';
import SectionHeader from './SectionHeader';

interface AIAnalysisTabProps {
  result: AnalysisResult;
}

export default function AIAnalysisTab({ result }: AIAnalysisTabProps) {
  return (
    <motion.div
      key="tab-ai"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* AI-Enhanced Insights */}
      {getSettings().showAiInsights !== false && (
        <>
          {result.aiInsights ? (
            <section>
              <SectionHeader icon={Sparkles} title="AI-Powered Deep Analysis" color="text-indigo-600" />
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
                <div
                  className="text-sm leading-relaxed text-gray-600 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_em]:text-gray-900 [&_ul]:my-2 [&_li]:text-gray-600"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(result.aiInsights) }}
                />
              </div>
            </section>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
              AI insights are available when you provide a Claude API key. Enable it in the analysis form to get deeper contract analysis.
            </div>
          )}
        </>
      )}

      {/* Country-Specific Legal Context */}
      {getSettings().showCountryContext !== false && result.countryContext && (
        <section>
          <SectionHeader icon={Info} title="Legal Context for Your Country" color="text-blue-600" />
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {result.countryContext}
            </div>
          </div>
        </section>
      )}

      {/* Scope Risks */}
      {result.scopeRisks.length > 0 && (
        <section>
          <SectionHeader icon={AlertTriangle} title="Scope Creep Risks" count={result.scopeRisks.length} color="text-orange-600" />

          <div className="grid gap-4 sm:grid-cols-2">
            {result.scopeRisks.map((risk, i) => {
              const lk = getLikelihoodStyle(risk.likelihood);
              return (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${lk.bg} ${lk.text} ${lk.border}`}>
                      {risk.likelihood} likelihood
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-gray-900">{risk.risk}</p>
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-600">Potential cost: </span>
                    {risk.potentialCost}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
