'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  FileDown,
} from 'lucide-react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { AnalysisResult } from '@/lib/analyzer';
import { CURRENCIES, getScoreColor as getScoreColorObj, getRecommendationConfig, getCurrencySymbol } from '@/lib/constants';

interface BulkFile {
  id: string;
  file: File;
  name: string;
  status: 'pending' | 'parsing' | 'parsed' | 'analyzing' | 'done' | 'error';
  text?: string;
  result?: AnalysisResult;
  error?: string;
}

function getScoreColor(score: number) {
  return getScoreColorObj(score).text;
}

export default function BulkPage() {
  const [files, setFiles] = useState<BulkFile[]>([]);
  const [projectScope, setProjectScope] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '$';

  const completedCount = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const progress = files.length > 0 ? ((completedCount + errorCount) / files.length) * 100 : 0;

  function handleFilesSelected(selectedFiles: FileList | null) {
    if (!selectedFiles) return;
    const newFiles: BulkFile[] = Array.from(selectedFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function parseFile(bf: BulkFile): Promise<string> {
    const ext = bf.name.toLowerCase().slice(bf.name.lastIndexOf('.'));
    if (ext === '.txt') {
      return await bf.file.text();
    }
    // PDF or DOCX - use server parser
    const formData = new FormData();
    formData.append('file', bf.file);
    const res = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? `Parse failed (${res.status})`);
    }
    const data = await res.json();
    return data.text;
  }

  async function handleAnalyzeAll() {
    if (files.length === 0) {
      setError('Please add at least one file.');
      return;
    }
    if (!projectScope.trim() || !quotedPrice || !estimatedHours) {
      setError('Please fill in project scope, quoted price, and estimated hours.');
      return;
    }

    setError('');
    setIsRunning(true);

    for (let i = 0; i < files.length; i++) {
      const bf = files[i];
      if (bf.status === 'done') continue;

      // Parse
      setFiles((prev) =>
        prev.map((f) => (f.id === bf.id ? { ...f, status: 'parsing' as const } : f))
      );

      let text: string;
      try {
        text = bf.text || await parseFile(bf);
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, status: 'parsed' as const, text } : f))
        );
      } catch (err: unknown) {
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : 'Parse failed' } : f))
        );
        continue;
      }

      // Analyze
      setFiles((prev) =>
        prev.map((f) => (f.id === bf.id ? { ...f, status: 'analyzing' as const } : f))
      );

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractText: text,
            projectScope,
            quotedPrice: parseFloat(quotedPrice),
            estimatedHours: parseFloat(estimatedHours),
            currency,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Analysis failed (${res.status})`);
        }

        const result: AnalysisResult = await res.json();
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, status: 'done' as const, result } : f))
        );
      } catch (err: unknown) {
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : 'Analysis failed' } : f))
        );
      }
    }

    setIsRunning(false);
  }

  function handleExportCSV() {
    const header = 'File Name,Score,Recommendation,Nominal Rate,Effective Rate,Rate Reduction,Red Flags,Missing Clauses\n';
    const rows = files.filter(f => f.status === 'done' && f.result).map(f => {
      const r = f.result!;
      return `"${f.name}",${r.overallScore},${r.recommendation},${r.nominalHourlyRate},${r.effectiveHourlyRate},${r.rateReduction}%,${r.redFlags.length},${r.missingClauses.length}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dealwise-bulk-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportAll() {
    const doneFiles = files.filter((f) => f.status === 'done' && f.result);
    if (doneFiles.length === 0) return;

    const lines: string[] = [
      'DEALWISE - Bulk Analysis Report',
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Contracts: ${doneFiles.length}`,
      '',
      '='.repeat(60),
    ];

    doneFiles.forEach((f, i) => {
      const r = f.result!;
      lines.push('');
      lines.push(`Contract ${i + 1}: ${f.name}`);
      lines.push('-'.repeat(40));
      lines.push(`Score: ${r.overallScore}/100`);
      lines.push(`Recommendation: ${r.recommendation.toUpperCase().replace('_', ' ')}`);
      lines.push(`Quoted Rate: ${currencySymbol}${r.nominalHourlyRate.toFixed(2)}/hr`);
      lines.push(`Effective Rate: ${currencySymbol}${r.effectiveHourlyRate.toFixed(2)}/hr`);
      lines.push(`Rate Reduction: ${r.rateReduction.toFixed(1)}%`);
      lines.push(`Red Flags: ${r.redFlags.length}`);
      lines.push(`Missing Clauses: ${r.missingClauses.length}`);
      lines.push(`Summary: ${r.summary}`);
      lines.push('');
    });

    lines.push('='.repeat(60));
    lines.push('Generated by DEALWISE');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dealwise-bulk-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const hasResults = files.some((f) => f.status === 'done');

  return (
    <ProtectedRoute>
    <div className="min-h-dvh bg-white">
      <Nav />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Bulk Analysis</h1>
          <p className="mt-2 max-w-2xl text-gray-400">
            Upload multiple contracts at once. We will analyze each one and show you results in a summary table.
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Upload Contracts</h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 transition-all hover:border-indigo-300 hover:bg-indigo-50/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.doc"
              className="hidden"
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Upload PDF, DOCX, or TXT files</p>
              <p className="mt-1 text-xs text-gray-400">Select multiple files at once (max 5MB each)</p>
            </div>
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {files.map((bf) => (
                  <div
                    key={bf.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm text-gray-900">{bf.name}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        bf.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                        bf.status === 'error' ? 'bg-red-100 text-red-700' :
                        bf.status === 'analyzing' || bf.status === 'parsing' ? 'bg-indigo-100 text-indigo-700' :
                        bf.status === 'parsed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {bf.status === 'pending' && 'Pending'}
                        {bf.status === 'parsing' && 'Parsing...'}
                        {bf.status === 'parsed' && 'Parsed'}
                        {bf.status === 'analyzing' && 'Analyzing...'}
                        {bf.status === 'done' && 'Done'}
                        {bf.status === 'error' && 'Error'}
                      </span>
                      {(bf.status === 'parsing' || bf.status === 'analyzing') && (
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(bf.id)}
                      disabled={isRunning}
                      className="text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shared Deal Details */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Shared Deal Details</h2>
          <p className="mb-6 text-xs text-gray-400">Applied to all contracts for consistent comparison.</p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Project Scope</label>
              <textarea
                rows={2}
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
                placeholder="Describe the type of work..."
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Quoted Price</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Estimated Hours</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="80"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Progress */}
        {isRunning && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">Analyzing contracts...</span>
              <span className="font-medium text-gray-900">{completedCount + errorCount} / {files.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={handleAnalyzeAll}
            disabled={isRunning || files.length === 0}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.25)] transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isRunning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze All ({files.length})
                </>
              )}
            </span>
          </button>

          {hasResults && (
            <>
              <button
                onClick={handleExportAll}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
              >
                <FileDown className="h-4 w-4" />
                Export All (.txt)
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </button>
            </>
          )}
        </div>

        {/* Results Table */}
        {hasResults && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">File</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Effective Rate</th>
                    <th className="px-6 py-3">Reduction</th>
                    <th className="px-6 py-3">Red Flags</th>
                    <th className="px-6 py-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {files
                    .filter((f) => f.status === 'done' && f.result)
                    .map((f, idx) => {
                      const r = f.result!;
                      const rc = getRecommendationConfig(r.recommendation);
                      return (
                        <tr
                          key={f.id}
                          className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-white'}`}
                        >
                          <td className="max-w-[180px] truncate px-6 py-4 font-medium text-gray-900">{f.name}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${getScoreColor(r.overallScore)}`}>{r.overallScore}/100</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{currencySymbol}{r.effectiveHourlyRate.toFixed(2)}/hr</td>
                          <td className="px-6 py-4">
                            <span className={r.rateReduction > 0 ? 'text-red-600' : 'text-emerald-600'}>
                              {r.rateReduction > 0 ? '-' : ''}{r.rateReduction.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{r.redFlags.length}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${rc.bg} ${rc.text}`}>
                              {rc.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {errorCount > 0 && (
              <div className="border-t border-gray-200 p-4">
                <p className="text-sm text-red-600">
                  {errorCount} file{errorCount > 1 ? 's' : ''} failed to analyze:
                </p>
                <ul className="mt-1 space-y-1">
                  {files
                    .filter((f) => f.status === 'error')
                    .map((f) => (
                      <li key={f.id} className="text-xs text-red-500">
                        {f.name}: {f.error}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
