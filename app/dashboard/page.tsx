'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Award,
  Search,
  ArrowRight,
  Eye,
  Trash2,
  X,
  Users,
} from 'lucide-react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmModal from '@/components/ConfirmModal';
import { getHistory, removeHistoryEntry, type HistoryEntry } from '@/lib/auth';
import { getScoreColor, getRecommendationConfig, formatDate } from '@/lib/constants';
import { serifStyle } from '@/components/ui/index';
import { useCredits } from '@/components/CreditsProvider';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreBadge(score: number) {
  if (score >= 70) return { label: 'Good', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (score >= 40) return { label: 'Fair', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  return { label: 'Poor', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
}

function recommendationBadge(rec: string) {
  const c = getRecommendationConfig(rec);
  return { label: c.label, bg: c.bg, text: c.text };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { credits, plan, loading: creditsLoading, refreshCredits } = useCredits();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [viewMode, setViewMode] = useState<'my' | 'team'>('my');
  const [teamHistory, setTeamHistory] = useState<HistoryEntry[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const ITEMS_PER_PAGE = 15;

  const loadHistory = useCallback(async () => {
    // Start with localStorage history
    const localHistory = getHistory(session?.user?.email ?? undefined);

    // If authenticated, also fetch from server and merge
    if (session?.user?.email) {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const serverData = await res.json();
          // Convert server entries to HistoryEntry format
          const serverEntries: HistoryEntry[] = (serverData as Array<{
            id: string;
            created_at: string;
            overall_score: number;
            recommendation: string;
            contract_snippet: string;
            currency: string;
            nominal_rate: number;
            effective_rate: number;
            rate_reduction: number;
            full_result: string;
          }>).map((entry) => ({
            id: entry.id,
            date: entry.created_at,
            overallScore: entry.overall_score,
            recommendation: entry.recommendation as 'sign' | 'negotiate' | 'walk_away',
            summary: '',
            contractSnippet: entry.contract_snippet,
            currency: entry.currency,
            nominalHourlyRate: entry.nominal_rate,
            effectiveHourlyRate: entry.effective_rate,
            rateReduction: entry.rate_reduction,
            fullResult: entry.full_result,
          }));

          // Merge: use a Map keyed by id to deduplicate
          const merged = new Map<string, HistoryEntry>();
          for (const entry of localHistory) merged.set(entry.id, entry);
          for (const entry of serverEntries) {
            if (!merged.has(entry.id)) merged.set(entry.id, entry);
          }
          // Sort by date descending
          const mergedArray = Array.from(merged.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setHistory(mergedArray);
          return;
        }
      } catch {
        // Fall through to localStorage only
      }
    }

    setHistory(localHistory);
  }, [session?.user?.email]);

  // Load team info on mount
  const loadTeamInfo = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) return;
      const data = await res.json();
      const owned = data.ownedTeams?.[0];
      const membership = data.memberships?.[0];
      const team = owned || membership?.teams;
      if (team?.id) setTeamId(team.id);
    } catch {}
  }, [session?.user?.email]);

  const loadTeamHistory = useCallback(async () => {
    if (!teamId) return;
    setTeamLoading(true);
    try {
      const res = await fetch(`/api/history?teamId=${teamId}`);
      if (res.ok) {
        const serverData = await res.json();
        const entries: HistoryEntry[] = (serverData as Array<{
          id: string;
          created_at: string;
          overall_score: number;
          recommendation: string;
          contract_snippet: string;
          currency: string;
          nominal_rate: number;
          effective_rate: number;
          rate_reduction: number;
          full_result: string;
        }>).map((entry) => ({
          id: entry.id,
          date: entry.created_at,
          overallScore: entry.overall_score,
          recommendation: entry.recommendation as 'sign' | 'negotiate' | 'walk_away',
          summary: '',
          contractSnippet: entry.contract_snippet,
          currency: entry.currency,
          nominalHourlyRate: entry.nominal_rate,
          effectiveHourlyRate: entry.effective_rate,
          rateReduction: entry.rate_reduction,
          fullResult: entry.full_result,
        }));
        setTeamHistory(entries);
      }
    } catch {}
    setTeamLoading(false);
  }, [teamId]);

  useEffect(() => {
    loadHistory();
    loadTeamInfo();
    setMounted(true);
  }, [loadHistory, loadTeamInfo]);

  useEffect(() => {
    if (viewMode === 'team' && teamId) {
      loadTeamHistory();
    }
  }, [viewMode, teamId, loadTeamHistory]);

  /* ---- Computed stats (always based on user's own history) ---- */
  const stats = useMemo(() => {
    const total = history.length;
    const avgScore = total > 0 ? Math.round(history.reduce((s, h) => s + h.overallScore, 0) / total) : 0;
    // Calculate estimated savings: rateReduction% * nominalRate * ~80hrs avg project
    const moneySaved = history.reduce((s, h) => {
      const reduction = (h.rateReduction || 0) / 100;
      const rate = h.nominalHourlyRate || 0;
      return s + (reduction * rate * 80);
    }, 0);
    const best = total > 0 ? Math.max(...history.map((h) => h.overallScore)) : 0;
    const worst = total > 0 ? Math.min(...history.map((h) => h.overallScore)) : 0;
    return { total, avgScore, moneySaved, best, worst };
  }, [history]);

  /* ---- Delete handler ---- */
  function handleDeleteClick(id: string) {
    setDeleteConfirm({ isOpen: true, id });
  }

  function handleDeleteConfirm() {
    const id = deleteConfirm.id;
    setDeleteConfirm({ isOpen: false, id: '' });
    const email = session?.user?.email ?? undefined;
    removeHistoryEntry(id, email);
    setHistory(getHistory(email));
    // Also delete from server if authenticated
    if (session?.user?.email) {
      fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
    }
  }

  /* ---- Filtered entries ---- */
  const activeHistory = viewMode === 'team' ? teamHistory : history;

  const filtered = useMemo(() => {
    if (!search.trim()) return activeHistory;
    const q = search.toLowerCase();
    return activeHistory.filter(
      (h) =>
        h.contractSnippet.toLowerCase().includes(q) ||
        h.recommendation.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        String(h.overallScore).includes(q) ||
        (q === 'sign' && h.recommendation === 'sign') ||
        (q === 'negotiate' && h.recommendation === 'negotiate') ||
        (q === 'walk away' && h.recommendation === 'walk_away') ||
        (q === 'walk_away' && h.recommendation === 'walk_away')
    );
  }, [activeHistory, search]);

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedHistory = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!mounted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Nav />
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-b from-indigo-50/30 via-white to-white">
      <Nav />

      {!dismissedBanner && plan === 'free' && credits !== null && credits <= 2 && (
        <div className="mx-auto max-w-5xl px-6 pt-4">
          <div className="relative rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white shadow-lg">
            <button
              onClick={() => setDismissedBanner(true)}
              className="absolute right-3 top-3 rounded-md p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium">
              {credits === 0 ? "You've used all your free analyses" : `You have ${credits} analysis${credits === 1 ? '' : 'es'} left`}
            </p>
            <p className="mt-1 text-sm text-indigo-100">
              Upgrade to Freelancer for 30 analyses/month — just $9.99
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Join Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={serifStyle}>Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your contract analyses and insights
            </p>
          </div>
        </div>

        {/* ---- Stat Cards ---- */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileText,
              label: 'Total Contracts Analyzed',
              value: stats.total,
              color: 'bg-indigo-100 text-indigo-600',
            },
            {
              icon: TrendingUp,
              label: 'Average Deal Score',
              value: `${stats.avgScore}/100`,
              color: 'bg-emerald-100 text-emerald-600',
            },
            {
              icon: DollarSign,
              label: 'Est. Rate Impact Found',
              value: `$${Math.round(stats.moneySaved).toLocaleString()}`,
              color: 'bg-amber-100 text-amber-600',
            },
            {
              icon: Award,
              label: 'Best / Worst Score',
              value: stats.total > 0 ? `${stats.best} / ${stats.worst}` : '-- / --',
              color: 'bg-purple-100 text-purple-600',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="mt-1 text-sm text-gray-500">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ---- Recent Analyses Table ---- */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-10 rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
              {teamId && (
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    onClick={() => setViewMode('my')}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      viewMode === 'my'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Analyses
                  </button>
                  <button
                    onClick={() => setViewMode('team')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      viewMode === 'team'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    Team
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:w-72"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <FileText className="h-8 w-8 text-indigo-400" />
              </div>
              <p className="mb-2 text-lg font-semibold text-gray-900">
                {search ? 'No matching analyses' : 'No analyses yet'}
              </p>
              <p className="mb-6 text-sm text-gray-500">
                {search
                  ? 'Try a different search term'
                  : 'Analyze your first contract to see insights here'}
              </p>
              {!search && (
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                >
                  Analyze a Contract
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="hidden sm:table-cell px-3 py-2.5 sm:px-6 sm:py-3">Date</th>
                    <th className="px-3 py-2.5 sm:px-6 sm:py-3">Contract Snippet</th>
                    <th className="px-3 py-2.5 sm:px-6 sm:py-3">Score</th>
                    <th className="hidden sm:table-cell px-3 py-2.5 sm:px-6 sm:py-3">Rate Impact</th>
                    <th className="px-3 py-2.5 sm:px-6 sm:py-3">Recommendation</th>
                    <th className="px-3 py-2.5 sm:px-6 sm:py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((entry, idx) => {
                    const sb = scoreBadge(entry.overallScore);
                    const rb = recommendationBadge(entry.recommendation);
                    return (
                      <tr
                        key={entry.id}
                        className={`border-b border-gray-200 transition-colors hover:bg-indigo-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-white'}`}
                      >
                        <td className="hidden sm:table-cell whitespace-nowrap px-3 py-2.5 sm:px-6 sm:py-4 text-gray-500">
                          {formatDate(entry.date)}
                        </td>
                        <td className="max-w-[240px] truncate px-3 py-2.5 sm:px-6 sm:py-4 font-medium text-gray-900">
                          {entry.contractSnippet}
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sb.bg} ${sb.text} ${sb.border}`}>
                            {entry.overallScore} &middot; {sb.label}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-2.5 sm:px-6 sm:py-4 text-gray-500">
                          <span className={entry.rateReduction > 0 ? 'text-red-600' : 'text-emerald-600'}>
                            {entry.rateReduction > 0 ? '-' : ''}{entry.rateReduction}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${rb.bg} ${rb.text}`}>
                            {rb.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                localStorage.setItem('dealwise_view_result', entry.fullResult);
                                router.push('/analyze');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteClick(entry.id)}
                              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30">Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 text-sm border rounded-lg ${currentPage === i + 1 ? 'bg-gray-900 text-white' : ''}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30">Next</button>
                </div>
              </div>
            )}
            </>
          )}
        </motion.div>

      </main>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Analysis"
        message="Are you sure you want to delete this analysis? This action cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '' })}
      />
    </div>
    </ProtectedRoute>
  );
}
