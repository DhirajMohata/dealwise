'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const refreshHistory = useCallback(() => {
    setEntries(getHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Refresh when panel opens
  useEffect(() => {
    if (isOpen) refreshHistory();
  }, [isOpen, refreshHistory]);

  function handleClear() {
    if (!window.confirm('Are you sure? This will delete all your analysis history.')) return;
    clearHistory();
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
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-xl border border-r-0 border-[#E5E7EB] bg-white px-2 py-4 text-[#4B5563] shadow-lg transition-colors hover:bg-[#F3F4F8] hover:text-[#111827]"
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
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-[#E5E7EB] bg-white shadow-xl sm:w-96"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-[#111827]">
                    Analysis History
                  </h2>
                  <span className="rounded-full bg-[#F3F4F8] px-2 py-0.5 text-[10px] font-medium text-[#4B5563]">
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
                    className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F8] hover:text-[#4B5563]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Entries list */}
              <div className="flex-1 overflow-y-auto p-4">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 rounded-xl bg-[#F3F4F8] p-4">
                      <Clock className="h-8 w-8 text-[#9CA3AF]" />
                    </div>
                    <p className="text-sm font-medium text-[#4B5563]">
                      No analyses yet
                    </p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
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
                          className="group w-full rounded-lg border border-[#E5E7EB] bg-[#F3F4F8] p-4 text-left transition-all hover:border-indigo-300 hover:bg-white hover:shadow-sm"
                        >
                          {/* Top row: date + score */}
                          <div className="mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                              <Clock className="h-3 w-3" />
                              {formatRelativeDate(entry.date)}
                            </span>
                            <span
                              className={`text-lg font-bold ${getScoreColor(
                                entry.overallScore
                              )}`}
                            >
                              {entry.overallScore}
                              <span className="text-[10px] font-normal text-[#9CA3AF]">
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
                          <p className="line-clamp-2 text-xs leading-relaxed text-[#9CA3AF] transition-colors group-hover:text-[#4B5563]">
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
