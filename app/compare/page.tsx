'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  Upload,
} from 'lucide-react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { AnalysisResult } from '@/lib/analyzer';
import { getHistory, type HistoryEntry } from '@/lib/auth';
import { CURRENCIES, getScoreColor, getRecommendationConfig, getCurrencySymbol } from '@/lib/constants';

function getScoreBg(score: number) {
  const c = getScoreColor(score);
  return `${c.bg} ${c.border}`;
}

function getRecommendationIcon(rec: string) {
  switch (rec) {
    case 'sign': return CheckCircle2;
    case 'negotiate': return AlertCircle;
    case 'walk_away': return XCircle;
    default: return AlertCircle;
  }
}

function ComparisonBadge({ aVal, bVal, higherIsBetter = true }: { aVal: number; bVal: number; higherIsBetter?: boolean }) {
  if (aVal === bVal) return <span className="text-xs text-[#9CA3AF]">Tied</span>;
  const aIsBetter = higherIsBetter ? aVal > bVal : aVal < bVal;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${aIsBetter ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {aIsBetter ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {aIsBetter ? 'A Better' : 'B Better'}
    </span>
  );
}

export default function ComparePage() {
  const [contractA, setContractA] = useState('');
  const [contractB, setContractB] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [history, setHistoryState] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistoryState(getHistory());
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);

  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '$';

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!contractA.trim() || !contractB.trim()) {
      setError('Please paste both contracts.');
      return;
    }
    if (!projectScope.trim() || !quotedPrice || !estimatedHours) {
      setError('Please fill in project scope, quoted price, and estimated hours.');
      return;
    }

    setLoading(true);
    setResultA(null);
    setResultB(null);

    try {
      const payload = {
        projectScope,
        quotedPrice: parseFloat(quotedPrice),
        estimatedHours: parseFloat(estimatedHours),
        currency,
      };

      const [resA, resB] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, contractText: contractA }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, contractText: contractB }),
        }),
      ]);

      if (!resA.ok) {
        const body = await resA.json().catch(() => null);
        throw new Error(`Contract A: ${body?.error ?? `Request failed (${resA.status})`}`);
      }
      if (!resB.ok) {
        const body = await resB.json().catch(() => null);
        throw new Error(`Contract B: ${body?.error ?? `Request failed (${resB.status})`}`);
      }

      const dataA: AnalysisResult = await resA.json();
      const dataB: AnalysisResult = await resB.json();
      setResultA(dataA);
      setResultB(dataB);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResultA(null);
    setResultB(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasResults = resultA && resultB;

  // Determine winner
  let verdict = '';
  if (hasResults) {
    const diff = resultA.overallScore - resultB.overallScore;
    if (Math.abs(diff) <= 5) {
      verdict = 'Both contracts are roughly equal in safety. Review the details below.';
    } else if (diff > 0) {
      verdict = `Contract A is ${Math.abs(diff)} points safer than Contract B. It has ${resultA.redFlags.length < resultB.redFlags.length ? 'fewer red flags' : 'a higher overall score'} and a better effective rate.`;
    } else {
      verdict = `Contract B is ${Math.abs(diff)} points safer than Contract A. It has ${resultB.redFlags.length < resultA.redFlags.length ? 'fewer red flags' : 'a higher overall score'} and a better effective rate.`;
    }
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#FAFBFE]">
      <Nav />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition-colors hover:text-[#4B5563]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#111827] sm:text-4xl">
            Compare Contracts
          </h1>
          <p className="mt-2 max-w-2xl text-[#9CA3AF]">
            Paste two contracts side by side with the same deal details. We will analyze both and show you which one is the better deal.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleCompare}
              className="space-y-8"
            >
              {/* Contracts Side by Side */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-semibold text-[#111827]">Contract A</label>
                    {history.length > 0 && (
                      <select
                        onChange={(e) => {
                          const entry = history.find(h => h.id === e.target.value);
                          if (entry) {
                            setContractA(entry.contractSnippet);
                            try {
                              const parsed = JSON.parse(entry.fullResult);
                              if (parsed.contractText) setContractA(parsed.contractText);
                            } catch { /* use snippet */ }
                          }
                        }}
                        className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1 text-[#4B5563] bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="">Load from history...</option>
                        {history.map(h => (
                          <option key={h.id} value={h.id}>{h.contractSnippet?.substring(0, 40)}... ({h.overallScore}/100)</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                      <Upload className="h-4 w-4" />
                      Upload PDF/DOCX
                      <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.text) setContractA(data.text);
                      }} />
                    </label>
                  </div>
                  <textarea
                    rows={10}
                    value={contractA}
                    onChange={(e) => setContractA(e.target.value)}
                    placeholder="Paste the first contract here..."
                    className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm font-semibold text-[#111827]">Contract B</label>
                    {history.length > 0 && (
                      <select
                        onChange={(e) => {
                          const entry = history.find(h => h.id === e.target.value);
                          if (entry) {
                            setContractB(entry.contractSnippet);
                            try {
                              const parsed = JSON.parse(entry.fullResult);
                              if (parsed.contractText) setContractB(parsed.contractText);
                            } catch { /* use snippet */ }
                          }
                        }}
                        className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1 text-[#4B5563] bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="">Load from history...</option>
                        {history.map(h => (
                          <option key={h.id} value={h.id}>{h.contractSnippet?.substring(0, 40)}... ({h.overallScore}/100)</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                      <Upload className="h-4 w-4" />
                      Upload PDF/DOCX
                      <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.text) setContractB(data.text);
                      }} />
                    </label>
                  </div>
                  <textarea
                    rows={10}
                    value={contractB}
                    onChange={(e) => setContractB(e.target.value)}
                    placeholder="Paste the second contract here..."
                    className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Shared Deal Details */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-1 text-sm font-semibold text-[#111827]">Shared Deal Details</h2>
                <p className="mb-6 text-xs text-[#9CA3AF]">These apply to both contracts for a fair comparison.</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="mb-1.5 block text-xs font-medium text-[#4B5563]">Project Scope</label>
                    <textarea
                      rows={2}
                      value={projectScope}
                      onChange={(e) => setProjectScope(e.target.value)}
                      placeholder="Describe the work..."
                      className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4B5563]">Quoted Price</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        placeholder="5000"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4B5563]">Estimated Hours</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="80"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#4B5563]">Currency</label>
                    <div className="relative">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 pr-10 text-sm text-[#111827] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.25)] transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Comparing contracts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Compare Contracts
                    </>
                  )}
                </span>
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Verdict */}
              <div className={`rounded-2xl border p-6 text-center ${resultA.overallScore > resultB.overallScore ? 'border-emerald-200 bg-emerald-50' : resultA.overallScore < resultB.overallScore ? 'border-indigo-200 bg-indigo-50' : 'border-[#E5E7EB] bg-white'}`}>
                <h2 className="mb-2 text-xl font-bold text-[#111827]">Comparison Verdict</h2>
                <p className="text-sm text-[#4B5563]">{verdict}</p>
              </div>

              {/* Side by Side Scores */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Contract A */}
                <div className={`rounded-2xl border-2 p-6 shadow-sm ${resultA.overallScore >= resultB.overallScore ? 'border-emerald-300 bg-white' : 'border-[#E5E7EB] bg-white'}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#111827]">Contract A</h3>
                    {resultA.overallScore > resultB.overallScore && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">BETTER</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className={`rounded-xl border p-4 text-center ${getScoreBg(resultA.overallScore)}`}>
                      <span className={`text-4xl font-bold ${getScoreColor(resultA.overallScore).text}`}>{resultA.overallScore}</span>
                      <span className="text-sm text-[#9CA3AF]"> / 100</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFBFE] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Quoted Rate</p>
                        <p className="text-lg font-bold text-[#111827]">{currencySymbol}{resultA.nominalHourlyRate.toFixed(2)}/hr</p>
                      </div>
                      <div className={`rounded-lg border p-3 ${resultA.effectiveHourlyRate < resultA.nominalHourlyRate ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                        <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Real Rate</p>
                        <p className={`text-lg font-bold ${resultA.effectiveHourlyRate < resultA.nominalHourlyRate ? 'text-red-600' : 'text-emerald-600'}`}>
                          {currencySymbol}{resultA.effectiveHourlyRate.toFixed(2)}/hr
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const rc = getRecommendationConfig(resultA.recommendation);
                      const RcIcon = getRecommendationIcon(resultA.recommendation);
                      return (
                        <div className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 ${rc.bg} ${rc.border}`}>
                          <RcIcon className={`h-5 w-5 ${rc.text}`} />
                          <span className={`font-bold ${rc.text}`}>{rc.label}</span>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-red-50 p-2">
                        <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-red-500" />
                        <span className="text-sm font-bold text-[#111827]">{resultA.redFlags.length}</span>
                        <p className="text-[10px] text-[#9CA3AF]">Red Flags</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2">
                        <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-[#111827]">{resultA.missingClauses.length}</span>
                        <p className="text-[10px] text-[#9CA3AF]">Missing</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2">
                        <Shield className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold text-[#111827]">{resultA.greenFlags.length}</span>
                        <p className="text-[10px] text-[#9CA3AF]">Green</p>
                      </div>
                    </div>

                    {resultA.rateReduction > 0 && (
                      <p className="text-center text-sm font-semibold text-red-600">
                        -{resultA.rateReduction.toFixed(1)}% rate reduction
                      </p>
                    )}
                  </div>
                </div>

                {/* Contract B */}
                <div className={`rounded-2xl border-2 p-6 shadow-sm ${resultB.overallScore > resultA.overallScore ? 'border-emerald-300 bg-white' : 'border-[#E5E7EB] bg-white'}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#111827]">Contract B</h3>
                    {resultB.overallScore > resultA.overallScore && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">BETTER</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className={`rounded-xl border p-4 text-center ${getScoreBg(resultB.overallScore)}`}>
                      <span className={`text-4xl font-bold ${getScoreColor(resultB.overallScore).text}`}>{resultB.overallScore}</span>
                      <span className="text-sm text-[#9CA3AF]"> / 100</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFBFE] p-3">
                        <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Quoted Rate</p>
                        <p className="text-lg font-bold text-[#111827]">{currencySymbol}{resultB.nominalHourlyRate.toFixed(2)}/hr</p>
                      </div>
                      <div className={`rounded-lg border p-3 ${resultB.effectiveHourlyRate < resultB.nominalHourlyRate ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                        <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Real Rate</p>
                        <p className={`text-lg font-bold ${resultB.effectiveHourlyRate < resultB.nominalHourlyRate ? 'text-red-600' : 'text-emerald-600'}`}>
                          {currencySymbol}{resultB.effectiveHourlyRate.toFixed(2)}/hr
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const rc = getRecommendationConfig(resultB.recommendation);
                      const RcIcon = getRecommendationIcon(resultB.recommendation);
                      return (
                        <div className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 ${rc.bg} ${rc.border}`}>
                          <RcIcon className={`h-5 w-5 ${rc.text}`} />
                          <span className={`font-bold ${rc.text}`}>{rc.label}</span>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-red-50 p-2">
                        <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-red-500" />
                        <span className="text-sm font-bold text-[#111827]">{resultB.redFlags.length}</span>
                        <p className="text-[10px] text-[#9CA3AF]">Red Flags</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2">
                        <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-[#111827]">{resultB.missingClauses.length}</span>
                        <p className="text-[10px] text-[#9CA3AF]">Missing</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2">
                        <Shield className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold text-[#111827]">{resultB.greenFlags.length}</span>
                        <p className="text-[10px] text-[#9CA3AF]">Green</p>
                      </div>
                    </div>

                    {resultB.rateReduction > 0 && (
                      <p className="text-center text-sm font-semibold text-red-600">
                        -{resultB.rateReduction.toFixed(1)}% rate reduction
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Comparison Table */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-[#111827]">Detailed Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                        <th className="px-4 py-3">Metric</th>
                        <th className="px-4 py-3 text-center">Contract A</th>
                        <th className="px-4 py-3 text-center">Contract B</th>
                        <th className="px-4 py-3 text-center">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Overall Score', a: resultA.overallScore, b: resultB.overallScore, fmt: (v: number) => `${v}/100`, higherBetter: true },
                        { label: 'Effective Rate', a: resultA.effectiveHourlyRate, b: resultB.effectiveHourlyRate, fmt: (v: number) => `${currencySymbol}${v.toFixed(2)}/hr`, higherBetter: true },
                        { label: 'Rate Reduction', a: resultA.rateReduction, b: resultB.rateReduction, fmt: (v: number) => `${v.toFixed(1)}%`, higherBetter: false },
                        { label: 'Red Flags', a: resultA.redFlags.length, b: resultB.redFlags.length, fmt: (v: number) => `${v}`, higherBetter: false },
                        { label: 'Missing Clauses', a: resultA.missingClauses.length, b: resultB.missingClauses.length, fmt: (v: number) => `${v}`, higherBetter: false },
                        { label: 'Green Flags', a: resultA.greenFlags.length, b: resultB.greenFlags.length, fmt: (v: number) => `${v}`, higherBetter: true },
                      ].map((row) => (
                        <tr key={row.label} className="border-b border-[#E5E7EB]">
                          <td className="px-4 py-3 font-medium text-[#111827]">{row.label}</td>
                          <td className="px-4 py-3 text-center text-[#4B5563]">{row.fmt(row.a)}</td>
                          <td className="px-4 py-3 text-center text-[#4B5563]">{row.fmt(row.b)}</td>
                          <td className="px-4 py-3 text-center">
                            <ComparisonBadge aVal={row.a} bVal={row.b} higherIsBetter={row.higherBetter} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Compare Again
                </button>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#4B5563] transition-all hover:bg-gray-50"
                >
                  Analyze Single Contract
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </ProtectedRoute>
  );
}
