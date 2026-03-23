'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/auth';
import type { AnalysisResult } from '@/lib/analyzer';
import { getScoreColor as getScoreColorObj, getRecommendationConfig, formatRelativeDate } from '@/lib/constants';

interface HistoryPanelProps {
  onSelectResult: (result: AnalysisResult) => void;
}

function getRecommendationDisplay(rec: HistoryEntry['recommendation']) {
  const config = getRecommendationConfig(rec);
  const iconMap: Record<string, typeof CheckCircle2> = { sign: CheckCircle2, negotiate: AlertCircle, walk_away: XCircle };
  return { label: config.label, color: config.text.replace('700', '600'), bg: config.bg, Icon: iconMap[rec] || AlertCircle };
}

function getScoreColor(score: number) {
  return getScoreColorObj(score).text;
}

export default function HistoryPanel({ onSelectResult }: HistoryPanelProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const email = session?.user?.email ?? undefined;

  const refreshHistory = useCallback(() => {
    setEntries(getHistory(email));
  }, [email]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Refresh when panel opens
  useEffect(() => {
    if (isOpen) refreshHistory();
  }, [isOpen, refreshHistory]);

  function handleClear() {
    if (!window.confirm('Are you sure? This will delete all your analysis history.')) return;
    clearHistory(email);
    setEntries([]);
  }

  function handleSelect(entry: HistoryEntry) {
    try {
      const result = JSON.parse(entry.fullResult) as AnalysisResult;
      onSelectResult(result);
      setIsOpen(false);
    } catch {
      /* corrupt entry */
    }
  }

  return (
    <>
      {/* Toggle button - fixed on the right side */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-xl border border-r-0 border-gray-200 bg-white px-2 py-4 text-gray-600 shadow-lg transition-colors hover:bg-gray-50 hover:text-gray-900"
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
        title="Analysis History"
      >
        <div className="flex flex-col items-center gap-2">
          {isOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <History className="h-4 w-4" />
          {entries.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
              {entries.length}
            </span>
          )}
        </div>
      </motion.button>

      {/* Sliding panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-gray-200 bg-white shadow-xl sm:w-96"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Analysis History
                  </h2>
                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {entries.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {entries.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Clear all history"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Entries list */}
              <div className="flex-1 overflow-y-auto p-4">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 rounded-xl bg-gray-50 p-4">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      No analyses yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Your analysis history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry, i) => {
                      const rec = getRecommendationDisplay(entry.recommendation);
                      const RecIcon = rec.Icon;
                      return (
                        <motion.button
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => handleSelect(entry)}
                          className="group w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-indigo-300 hover:bg-white hover:shadow-sm"
                        >
                          {/* Top row: date + score */}
                          <div className="mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock className="h-3 w-3" />
                              {formatRelativeDate(entry.date)}
                            </span>
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                entry.overallScore
                              )}`}
                            >
                              {entry.overallScore}
                              <span className="text-[10px] font-normal text-gray-400">
                                /100
                              </span>
                            </span>
                          </div>

                          {/* Recommendation badge */}
                          <div className="mb-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${rec.bg} ${rec.color}`}
                            >
                              <RecIcon className="h-3 w-3" />
                              {rec.label}
                            </span>
                          </div>

                          {/* Rate reduction */}
                          {entry.rateReduction > 0 && (
                            <div className="mb-2 flex items-center gap-1 text-[11px] text-red-500">
                              <TrendingDown className="h-3 w-3" />
                              -{entry.rateReduction.toFixed(1)}% rate reduction
                            </div>
                          )}

                          {/* Contract snippet */}
                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-400 transition-colors group-hover:text-gray-600">
                            {entry.contractSnippet}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
