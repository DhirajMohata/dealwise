'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Upload,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { AnalysisResult } from '@/lib/analyzer';
import { getHistory, type HistoryEntry } from '@/lib/auth';
import { getScoreColor, getRecommendationConfig, getCurrencySymbol } from '@/lib/constants';
import { extractMetadataFromText, type ContractMetadata } from '@/lib/extract-metadata';
import { FadeIn, serifStyle } from '@/components/ui/index';

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
  if (aVal === bVal) return <span className="text-xs text-gray-400">Tied</span>;
  const aIsBetter = higherIsBetter ? aVal > bVal : aVal < bVal;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${aIsBetter ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
      {aIsBetter ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {aIsBetter ? 'A Better' : 'B Better'}
    </span>
  );
}

function MetadataBadge({ meta }: { meta: ContractMetadata }) {
  const parts: string[] = [];
  if (meta.detectedCurrency) parts.push(meta.detectedCurrency);
  if (meta.contractType) parts.push(meta.contractType.replace('-', ' '));
  if (meta.detectedPrice) parts.push(`${getCurrencySymbol(meta.detectedCurrency ?? 'USD')}${meta.detectedPrice.toLocaleString()}`);
  if (meta.detectedPaymentTerms) parts.push(meta.detectedPaymentTerms);
  if (parts.length === 0) return null;
  return (
    <p className="mt-2 text-xs text-gray-400">
      Detected: {parts.join(' \u00b7 ')}
    </p>
  );
}

export default function ComparePage() {
  const { data: session } = useSession();
  const [contractA, setContractA] = useState('');
  const [contractB, setContractB] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [history, setHistoryState] = useState<HistoryEntry[]>([]);

  const [metaA, setMetaA] = useState<ContractMetadata | null>(null);
  const [metaB, setMetaB] = useState<ContractMetadata | null>(null);

  // Track whether each contract was uploaded via PDF (for auto-trigger)
  const uploadedA = useRef(false);
  const uploadedB = useRef(false);

  useEffect(() => {
    setHistoryState(getHistory(session?.user?.email ?? undefined));
  }, [session?.user?.email]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);

  const currencySymbol = getCurrencySymbol(currency);

  const runComparison = useCallback(async (textA: string, textB: string, cur: string) => {
    if (!textA.trim() || !textB.trim()) return;

    setLoading(true);
    setError('');
    setResultA(null);
    setResultB(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractText: textA, currency: cur }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractText: textB, currency: cur }),
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
  }, []);

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();

    if (!contractA.trim() || !contractB.trim()) {
      setError('Please paste both contracts.');
      return;
    }

    await runComparison(contractA, contractB, currency);
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
    <div className={hasResults ? "h-dvh overflow-hidden flex flex-col bg-white" : "min-h-screen bg-white"}>
      <Nav />

      <div className={hasResults ? "flex-1 overflow-y-auto px-4 pb-16 pt-8 sm:px-6 lg:px-8" : "mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8"}>
        <FadeIn>
          <div className={hasResults ? "mb-10 mx-auto max-w-6xl" : "mb-10"}>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" style={serifStyle}>
              Compare Contracts
            </h1>
            <p className="mt-2 max-w-2xl text-gray-400">
              Upload or paste two contracts side by side. We will analyze both and show you which one is the better deal.
            </p>
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {!hasResults ? (
            <FadeIn delay={0.1}>
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
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm font-semibold text-gray-900">Contract A</label>
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
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white outline-none focus:border-indigo-500"
                        >
                          <option value="">Load from history...</option>
                          {history.map(h => (
                            <option key={h.id} value={h.id}>{h.contractSnippet?.substring(0, 40)}... ({h.overallScore}/100)</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                        <Upload className="h-5 w-5" />
                        Upload PDF/DOCX
                        <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.text) {
                            setContractA(data.text);
                            const meta = extractMetadataFromText(data.text);
                            setMetaA(meta);
                            if (meta.detectedCurrency) setCurrency(meta.detectedCurrency);
                            uploadedA.current = true;
                            // Auto-trigger if both contracts are uploaded via PDF
                            if (uploadedB.current && contractB.trim()) {
                              await runComparison(data.text, contractB, meta.detectedCurrency ?? currency);
                            }
                          }
                        }} />
                      </label>
                    </div>
                    {metaA && <MetadataBadge meta={metaA} />}
                    <textarea
                      rows={5}
                      value={contractA}
                      onChange={(e) => setContractA(e.target.value)}
                      placeholder="Paste the first contract here..."
                      className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm font-semibold text-gray-900">Contract B</label>
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
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white outline-none focus:border-indigo-500"
                        >
                          <option value="">Load from history...</option>
                          {history.map(h => (
                            <option key={h.id} value={h.id}>{h.contractSnippet?.substring(0, 40)}... ({h.overallScore}/100)</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                        <Upload className="h-5 w-5" />
                        Upload PDF/DOCX
                        <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.text) {
                            setContractB(data.text);
                            const meta = extractMetadataFromText(data.text);
                            setMetaB(meta);
                            if (meta.detectedCurrency) setCurrency(meta.detectedCurrency);
                            uploadedB.current = true;
                            // Auto-trigger if both contracts are uploaded via PDF
                            if (uploadedA.current && contractA.trim()) {
                              await runComparison(contractA, data.text, meta.detectedCurrency ?? currency);
                            }
                          }
                        }} />
                      </label>
                    </div>
                    {metaB && <MetadataBadge meta={metaB} />}
                    <textarea
                      rows={5}
                      value={contractB}
                      onChange={(e) => setContractB(e.target.value)}
                      placeholder="Paste the second contract here..."
                      className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
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
                  className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.25)] transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
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
            </FadeIn>
          ) : (
            <FadeIn delay={0.1}>
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Verdict */}
                <div className={`rounded-2xl border p-6 text-center ${resultA.overallScore > resultB.overallScore ? 'border-emerald-200 bg-emerald-50' : resultA.overallScore < resultB.overallScore ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                  <h2 className="mb-2 text-xl font-bold text-gray-900">Comparison Verdict</h2>
                  <p className="text-sm text-gray-600">{verdict}</p>
                </div>

                {/* Side by Side Scores */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Contract A */}
                  <div className={`rounded-2xl border-2 p-6 shadow-md ${resultA.overallScore >= resultB.overallScore ? 'border-emerald-300 bg-white' : 'border-gray-200 bg-white'}`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Contract A</h3>
                      {resultA.overallScore > resultB.overallScore && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">BETTER</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className={`rounded-xl border p-4 text-center ${getScoreBg(resultA.overallScore)}`}>
                        <span className={`text-4xl font-bold ${getScoreColor(resultA.overallScore).text}`}>{resultA.overallScore}</span>
                        <span className="text-sm text-gray-400"> / 100</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Quoted Rate</p>
                          <p className="text-lg font-bold text-gray-900">{currencySymbol}{resultA.nominalHourlyRate.toFixed(2)}/hr</p>
                        </div>
                        <div className={`rounded-lg border p-3 ${resultA.effectiveHourlyRate < resultA.nominalHourlyRate ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Real Rate</p>
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

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-center">
                        <div className="rounded-lg bg-red-50 p-2">
                          <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-red-500" />
                          <span className="text-sm font-bold text-gray-900">{resultA.redFlags.length}</span>
                          <p className="text-[10px] text-gray-400">Red Flags</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2">
                          <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                          <span className="text-sm font-bold text-gray-900">{resultA.missingClauses.length}</span>
                          <p className="text-[10px] text-gray-400">Missing</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2">
                          <Shield className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-bold text-gray-900">{resultA.greenFlags.length}</span>
                          <p className="text-[10px] text-gray-400">Green</p>
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
                  <div className={`rounded-2xl border-2 p-6 shadow-md ${resultB.overallScore > resultA.overallScore ? 'border-emerald-300 bg-white' : 'border-gray-200 bg-white'}`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Contract B</h3>
                      {resultB.overallScore > resultA.overallScore && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">BETTER</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className={`rounded-xl border p-4 text-center ${getScoreBg(resultB.overallScore)}`}>
                        <span className={`text-4xl font-bold ${getScoreColor(resultB.overallScore).text}`}>{resultB.overallScore}</span>
                        <span className="text-sm text-gray-400"> / 100</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Quoted Rate</p>
                          <p className="text-lg font-bold text-gray-900">{currencySymbol}{resultB.nominalHourlyRate.toFixed(2)}/hr</p>
                        </div>
                        <div className={`rounded-lg border p-3 ${resultB.effectiveHourlyRate < resultB.nominalHourlyRate ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Real Rate</p>
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

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-center">
                        <div className="rounded-lg bg-red-50 p-2">
                          <ShieldAlert className="mx-auto mb-1 h-4 w-4 text-red-500" />
                          <span className="text-sm font-bold text-gray-900">{resultB.redFlags.length}</span>
                          <p className="text-[10px] text-gray-400">Red Flags</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2">
                          <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-amber-500" />
                          <span className="text-sm font-bold text-gray-900">{resultB.missingClauses.length}</span>
                          <p className="text-[10px] text-gray-400">Missing</p>
                        </div>
                        <div className="rounded-lg bg-emerald-50 p-2">
                          <Shield className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-bold text-gray-900">{resultB.greenFlags.length}</span>
                          <p className="text-[10px] text-gray-400">Green</p>
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
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Detailed Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                          <th className="px-2 py-2 sm:px-4 sm:py-3">Metric</th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-center">Contract A</th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-center">Contract B</th>
                          <th className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-center">Winner</th>
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
                          <tr key={row.label} className="border-b border-gray-200">
                            <td className="px-2 py-2 sm:px-4 sm:py-3 font-medium text-gray-900">{row.label}</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-center text-gray-600">{row.fmt(row.a)}</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-center text-gray-600">{row.fmt(row.b)}</td>
                            <td className="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-center">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    Compare Again
                  </button>
                  <Link
                    href="/analyze"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                  >
                    Analyze Single Contract
                  </Link>
                </div>
              </motion.div>
            </FadeIn>
          )}
        </AnimatePresence>
      </div>
    </div>
    </ProtectedRoute>
  );
}
