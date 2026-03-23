'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  TrendingDown,
  Filter,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/analyzer';
import { getSeverityStyle, getSeverityLeftBorder } from '@/lib/analyze-helpers';
import SectionHeader from './SectionHeader';
import CopyButton from './CopyButton';

interface RedFlagsTabProps {
  result: AnalysisResult;
  currencySymbol: string;
  redFlagFilter: string;
  setRedFlagFilter: (f: string) => void;
}

export default function RedFlagsTab({ result, currencySymbol, redFlagFilter, setRedFlagFilter }: RedFlagsTabProps) {
  return (
    <motion.div
      key="tab-redflags"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {result.redFlags.length > 0 ? (() => {
        const severityCounts = {
          all: result.redFlags.length,
          critical: result.redFlags.filter((f) => f.severity === 'critical').length,
          high: result.redFlags.filter((f) => f.severity === 'high').length,
          medium: result.redFlags.filter((f) => f.severity === 'medium').length,
          low: result.redFlags.filter((f) => f.severity === 'low').length,
        };
        const filteredRedFlags = redFlagFilter === 'all'
          ? result.redFlags
          : result.redFlags.filter((f) => f.severity === redFlagFilter);

        return (
          <>
            <SectionHeader icon={ShieldAlert} title="Red Flags Found" count={result.redFlags.length} color="text-red-600" />

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
                const count = severityCounts[sev];
                if (sev !== 'all' && count === 0) return null;
                const isActive = redFlagFilter === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setRedFlagFilter(sev)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                      isActive
                        ? sev === 'all'
                          ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-300'
                          : sev === 'critical'
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          : sev === 'high'
                          ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                          : sev === 'medium'
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {sev === 'all' ? 'All' : sev}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-black/10' : 'bg-gray-100'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredRedFlags.map((flag, i) => {
                  const sev = getSeverityStyle(flag.severity);
                  const leftBorder = getSeverityLeftBorder(flag.severity);
                  return (
                    <motion.div
                      key={`${flag.severity}-${flag.clause}-${i}`}
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      layout
                      className={`rounded-xl border border-gray-200 border-l-4 ${leftBorder} bg-white p-5 shadow-sm`}
                    >
                      {/* Top row: severity + rate impact */}
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${sev.bg} ${sev.text} ${sev.border}`}>
                          {flag.severity}
                        </span>
                        {flag.hourlyRateImpact !== 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <TrendingDown className="h-3 w-3" />
                            {flag.hourlyRateImpact > 0 ? '-' : '+'}
                            {currencySymbol}{Math.abs(flag.hourlyRateImpact).toFixed(2)}/hr
                          </span>
                        )}
                      </div>

                      {/* Clause quote */}
                      <div className="mb-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-sm font-mono text-gray-600 italic">
                          &ldquo;{flag.clause}&rdquo;
                        </p>
                      </div>

                      {/* Issue & Impact */}
                      <div className="mb-4 space-y-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-semibold text-gray-900">Issue: </span>
                          {flag.issue}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold text-gray-900">Financial Impact: </span>
                          {flag.impact}
                        </p>
                      </div>

                      {/* Suggestion */}
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-700">Suggested Counter-Proposal</span>
                          <CopyButton text={flag.suggestion} label="Copy" />
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">{flag.suggestion}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredRedFlags.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                  No red flags match this filter.
                </div>
              )}
            </div>
          </>
        );
      })() : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-sm text-emerald-700">
          No red flags found in this contract. That&apos;s a good sign!
        </div>
      )}
    </motion.div>
  );
}
