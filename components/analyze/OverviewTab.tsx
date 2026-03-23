'use client';

import { motion } from 'framer-motion';
import {
  Info,
  Calculator,
  SlidersHorizontal,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/analyzer';
import { getRecommendationConfig } from '@/lib/constants';
import { getRecommendationIcon } from '@/lib/analyze-helpers';
import ScoreCircle from './ScoreCircle';
import SectionHeader from './SectionHeader';

interface OverviewTabProps {
  result: AnalysisResult;
  currencySymbol: string;
  // "What If" simulator state + setters
  simRevisions: number;
  setSimRevisions: (v: number) => void;
  simPayDelay: number;
  setSimPayDelay: (v: number) => void;
  simScopeCreep: number;
  setSimScopeCreep: (v: number) => void;
  simEffectiveRate: number;
}

export default function OverviewTab({
  result,
  currencySymbol,
  simRevisions,
  setSimRevisions,
  simPayDelay,
  setSimPayDelay,
  simScopeCreep,
  setSimScopeCreep,
  simEffectiveRate,
}: OverviewTabProps) {
  return (
    <motion.div
      key="tab-overview"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* Score + Rate Comparison + Recommendation */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Score */}
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ScoreCircle score={result.overallScore} />
        </div>

        {/* Rate Comparison */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rate Comparison</h3>

          {/* Quoted */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-400">Your Quoted Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {currencySymbol}{result.nominalHourlyRate.toFixed(2)}
              <span className="text-sm font-normal text-gray-400">/hr</span>
            </p>
          </div>

          {/* Real */}
          <div
            className={`rounded-xl border px-4 py-3 ${
              result.effectiveHourlyRate < result.nominalHourlyRate
                ? 'border-red-200 bg-red-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <p
              className={`text-xs ${
                result.effectiveHourlyRate < result.nominalHourlyRate
                  ? 'text-red-500'
                  : 'text-emerald-500'
              }`}
            >
              Your REAL Rate
            </p>
            <p
              className={`text-xl font-bold ${
                result.effectiveHourlyRate < result.nominalHourlyRate
                  ? 'text-red-600'
                  : 'text-emerald-600'
              }`}
            >
              {currencySymbol}{result.effectiveHourlyRate.toFixed(2)}
              <span className="text-sm font-normal opacity-60">/hr</span>
            </p>
          </div>

          {result.rateReduction > 0 && (
            <p className="text-center">
              <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                You&apos;re losing {result.rateReduction.toFixed(1)}% to contract terms
              </span>
            </p>
          )}
        </div>

        {/* Recommendation Badge */}
        {(() => {
          const config = getRecommendationConfig(result.recommendation);
          const RecIcon = getRecommendationIcon(result.recommendation);
          return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recommendation</h3>
              <div
                className={`flex items-center gap-3 rounded-xl border px-6 py-4 ${config.bg} ${config.border}`}
              >
                <RecIcon className={`h-7 w-7 ${config.text}`} />
                <span className={`text-2xl font-extrabold ${config.text}`}>{config.label}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Contextual Score Message */}
      <div className={`rounded-xl border px-5 py-4 text-sm font-medium ${
        result.overallScore >= 70
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : result.overallScore >= 40
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}>
        {result.overallScore >= 70
          ? 'This contract looks solid. Review the minor issues below.'
          : result.overallScore >= 40
          ? 'This contract needs negotiation. Use the counter-proposals below.'
          : 'This contract is risky. We strongly recommend not signing without major changes.'}
      </div>

      {/* Summary */}
      <div>
        <SectionHeader icon={Info} title="Analysis Summary" color="text-indigo-600" />
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="text-sm leading-relaxed text-gray-600">{result.summary}</p>
        </div>
      </div>

      {/* Walk Away Calculator */}
      {result.rateReduction > 10 && result.nominalHourlyRate > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            The Real Cost of This Deal
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-3 border border-amber-100">
              <p className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">What You Expect</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {currencySymbol}{(result.nominalHourlyRate * 80).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{currencySymbol}{result.nominalHourlyRate}/hr x 80 hrs</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-red-100">
              <p className="text-[10px] uppercase tracking-wider text-red-600 font-medium">What You&apos;ll Actually Earn</p>
              <p className="mt-1 text-xl font-bold text-red-600">
                {currencySymbol}{(result.effectiveHourlyRate * 80).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{currencySymbol}{result.effectiveHourlyRate.toFixed(2)}/hr x 80 hrs</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">Money Left on Table</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {currencySymbol}{((result.nominalHourlyRate - result.effectiveHourlyRate) * 80).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{result.rateReduction.toFixed(0)}% lost to contract terms</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-700">
            Negotiate the red flags above to close this gap. Use the &quot;Generate Negotiation Email&quot; button to get a ready-to-send message.
          </p>
        </div>
      )}

      {/* "What If" Scenario Simulator */}
      {result.nominalHourlyRate > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
            &quot;What If&quot; Scenario Simulator
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500">Extra revision rounds</label>
              <input type="range" min="0" max="10" value={simRevisions} onChange={e => setSimRevisions(parseInt(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              <span className="text-xs text-gray-700">{simRevisions} extra rounds</span>
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment delay (days late)</label>
              <input type="range" min="0" max="90" step="15" value={simPayDelay} onChange={e => setSimPayDelay(parseInt(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              <span className="text-xs text-gray-700">{simPayDelay} days late</span>
            </div>
            <div>
              <label className="text-xs text-gray-500">Scope creep (extra hours)</label>
              <input type="range" min="0" max="100" step="5" value={simScopeCreep} onChange={e => setSimScopeCreep(parseInt(e.target.value))} className="w-full mt-1 accent-indigo-600" />
              <span className="text-xs text-gray-700">+{simScopeCreep} hours</span>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-xs text-gray-500 mb-1">Simulated effective rate:</p>
              <p className="text-2xl font-bold" style={{ color: simEffectiveRate < result.nominalHourlyRate * 0.5 ? '#DC2626' : simEffectiveRate < result.nominalHourlyRate * 0.75 ? '#D97706' : '#059669' }}>
                {currencySymbol}{simEffectiveRate.toFixed(2)}/hr
              </p>
              <p className="text-xs text-gray-400">vs {currencySymbol}{result.nominalHourlyRate}/hr quoted</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
