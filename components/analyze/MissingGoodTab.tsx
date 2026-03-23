'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileWarning,
  ShieldCheck,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/analyzer';
import { getImportanceStyle } from '@/lib/analyze-helpers';
import SectionHeader from './SectionHeader';
import CopyButton from './CopyButton';

interface MissingGoodTabProps {
  result: AnalysisResult;
  missingClauseFilter: string;
  setMissingClauseFilter: (f: string) => void;
}

export default function MissingGoodTab({ result, missingClauseFilter, setMissingClauseFilter }: MissingGoodTabProps) {
  return (
    <motion.div
      key="tab-missing"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-10"
    >
      {/* Missing Clauses */}
      {result.missingClauses.length > 0 ? (() => {
        const importanceCounts = {
          all: result.missingClauses.length,
          critical: result.missingClauses.filter((c) => c.importance === 'critical').length,
          important: result.missingClauses.filter((c) => c.importance === 'important').length,
          nice_to_have: result.missingClauses.filter((c) => c.importance === 'nice_to_have').length,
        };
        const importanceLabels: Record<string, string> = {
          all: 'All',
          critical: 'Critical',
          important: 'Important',
          nice_to_have: 'Nice to Have',
        };
        const filteredClauses = missingClauseFilter === 'all'
          ? result.missingClauses
          : result.missingClauses.filter((c) => c.importance === missingClauseFilter);

        return (
          <section>
            <SectionHeader icon={FileWarning} title="Missing Protections" count={result.missingClauses.length} color="text-amber-600" />

            {/* Filter bar */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              {(['all', 'critical', 'important', 'nice_to_have'] as const).map((imp) => {
                const count = importanceCounts[imp];
                if (imp !== 'all' && count === 0) return null;
                const isActive = missingClauseFilter === imp;
                return (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => setMissingClauseFilter(imp)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? imp === 'all'
                          ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-300'
                          : imp === 'critical'
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          : imp === 'important'
                          ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {importanceLabels[imp]}
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
                {filteredClauses.map((clause, i) => {
                  const imp = getImportanceStyle(clause.importance);
                  return (
                    <motion.div
                      key={`${clause.importance}-${clause.name}-${i}`}
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      layout
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-900">{clause.name}</h3>
                        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${imp.bg} ${imp.text} ${imp.border}`}>
                          {clause.importance}
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-gray-600">{clause.description}</p>

                      {/* Suggested language */}
                      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-700">Add This Language</span>
                          <CopyButton text={clause.suggestedLanguage} label="Copy" />
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">{clause.suggestedLanguage}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredClauses.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                  No missing clauses match this filter.
                </div>
              )}
            </div>
          </section>
        );
      })() : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-sm text-emerald-700">
          No missing protections detected.
        </div>
      )}

      {/* Green Flags */}
      <section>
        <SectionHeader icon={ShieldCheck} title="Green Flags" count={result.greenFlags.length} color="text-emerald-600" />

        {result.greenFlags.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {result.greenFlags.map((flag, i) => (
              <div
                key={i}
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <p className="mb-2 text-sm font-semibold text-emerald-700">{flag.clause}</p>
                <p className="text-sm leading-relaxed text-gray-600">{flag.benefit}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm leading-relaxed text-gray-600">
                No positive protections found in this contract. This is a red flag in itself — a well-drafted contract should include protections for both parties.
              </p>
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}
