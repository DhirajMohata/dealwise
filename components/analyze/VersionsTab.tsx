'use client';

import { motion } from 'framer-motion';
import {
  GitBranch,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface VersionsTabProps {
  versions: Array<{ id: string; score: number; rec: string; date: string }>;
}

export default function VersionsTab({ versions }: VersionsTabProps) {
  return (
    <motion.div
      key="tab-versions"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
      <p className="text-sm text-gray-500">Track how your contract score changes across analyses.</p>

      {versions.length <= 1 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
          <GitBranch className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">Analyze this contract again after making changes to see version comparisons.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200" />

          <div className="space-y-3">
            {versions.map((v, i) => {
              const prev = i > 0 ? versions[i - 1] : null;
              const diff = prev ? v.score - prev.score : 0;
              return (
                <div key={v.id || i} className="flex items-start gap-3">
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    v.score >= 65 ? 'border-emerald-200 bg-emerald-50' :
                    v.score >= 35 ? 'border-amber-200 bg-amber-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <span className={`text-xs font-bold ${
                      v.score >= 65 ? 'text-emerald-700' :
                      v.score >= 35 ? 'text-amber-700' :
                      'text-red-700'
                    }`}>{v.score}</span>
                  </div>
                  <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">v{versions.length - i}</span>
                        {prev && diff !== 0 && (
                          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          v.rec === 'sign' ? 'bg-emerald-50 text-emerald-700' :
                          v.rec === 'negotiate' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>{v.rec.replace('_', ' ')}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">{new Date(v.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
