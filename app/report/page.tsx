'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import {
  Zap,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { getScoreColor, getRecommendationConfig } from '@/lib/constants';

interface ShareData {
  s: number; // score
  nr: number; // nominal rate
  er: number; // effective rate
  rr: number; // rate reduction
  rec: string; // recommendation
  rf: number; // red flag count
  mc: number; // missing clause count
  gf: number; // green flag count
  sum: string; // summary
  cur: string; // currency symbol
  top: { sev: string; issue: string }[];
}

function getRecommendationIcon(rec: string) {
  switch (rec) {
    case 'sign': return CheckCircle2;
    case 'negotiate': return AlertCircle;
    case 'walk_away': return XCircle;
    default: return AlertCircle;
  }
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

function ReportContent() {
  const searchParams = useSearchParams();
  const d = searchParams.get('d');

  const data = useMemo<ShareData | null>(() => {
    if (!d) return null;
    try {
      return JSON.parse(decodeURIComponent(atob(d)));
    } catch {
      return null;
    }
  }, [d]);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFBFE] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#111827]">Invalid Report Link</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            This link is invalid or has expired.
          </p>
          <Link
            href="/analyze"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            Analyze Your Own Contract
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const colors = getScoreColor(data.s);
  const recConfig = getRecommendationConfig(data.rec);
  const RecIcon = getRecommendationIcon(data.rec);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.s / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#FAFBFE]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">DEALWISE</span>
          </Link>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Shared Report
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-center text-3xl font-bold text-[#111827]">Contract Analysis Report</h1>

        {/* Score + Rate + Recommendation */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {/* Score */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="relative h-36 w-36">
              <svg className="-rotate-90" viewBox="0 0 120 120" width="144" height="144">
                <circle cx="60" cy="60" r={radius} fill="none" className="stroke-gray-100" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  className={colors.ring}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${colors.text}`}>{data.s}</span>
                <span className="text-xs text-[#9CA3AF]">/ 100</span>
              </div>
            </div>
            <span className={`mt-2 text-sm font-medium ${colors.text}`}>{colors.label}</span>
          </div>

          {/* Rate Comparison */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Rate Comparison</h3>
            <div className="rounded-xl border border-[#E5E7EB] px-4 py-3">
              <p className="text-xs text-[#9CA3AF]">Quoted Rate</p>
              <p className="text-xl font-bold text-[#111827]">
                {data.cur}{data.nr.toFixed(2)}<span className="text-sm font-normal text-[#9CA3AF]">/hr</span>
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${data.er < data.nr ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className={`text-xs ${data.er < data.nr ? 'text-red-500' : 'text-emerald-500'}`}>Real Rate</p>
              <p className={`text-xl font-bold ${data.er < data.nr ? 'text-red-600' : 'text-emerald-600'}`}>
                {data.cur}{data.er.toFixed(2)}<span className="text-sm font-normal opacity-60">/hr</span>
              </p>
            </div>
            {data.rr > 0 && (
              <p className="text-center">
                <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                  -{data.rr.toFixed(1)}% rate reduction
                </span>
              </p>
            )}
          </div>

          {/* Recommendation */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Recommendation</h3>
            <div className={`flex items-center gap-3 rounded-xl border px-6 py-4 ${recConfig.bg} ${recConfig.border}`}>
              <RecIcon className={`h-7 w-7 ${recConfig.text}`} />
              <span className={`text-2xl font-extrabold ${recConfig.text}`}>{recConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <ShieldAlert className="mb-2 h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-[#111827]">{data.rf}</span>
            <span className="text-xs text-[#6B7280]">Red Flags</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <AlertTriangle className="mb-2 h-5 w-5 text-amber-500" />
            <span className="text-2xl font-bold text-[#111827]">{data.mc}</span>
            <span className="text-xs text-[#6B7280]">Missing Clauses</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <Shield className="mb-2 h-5 w-5 text-emerald-500" />
            <span className="text-2xl font-bold text-[#111827]">{data.gf}</span>
            <span className="text-xs text-[#6B7280]">Green Flags</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#9CA3AF]">Summary</h3>
          <p className="text-sm leading-relaxed text-[#4B5563]">{data.sum}</p>
        </div>

        {/* Top Red Flags */}
        {data.top && data.top.length > 0 && (
          <div className="mb-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#9CA3AF]">Top Red Flags</h3>
            <div className="space-y-3">
              {data.top.map((flag, i) => {
                const sev = SEVERITY_STYLES[flag.sev?.toLowerCase()] ?? SEVERITY_STYLES.medium;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFBFE] p-4">
                    <span className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${sev.bg} ${sev.text} ${sev.border}`}>
                      {flag.sev}
                    </span>
                    <p className="text-sm text-[#4B5563]">{flag.issue}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-[#111827]">Analyze Your Own Contract</h3>
          <p className="mb-6 text-sm text-[#6B7280]">
            Know your real rate before you sign. Free, instant, and private.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:brightness-105"
          >
            Analyze My Contract -- Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-[#111827]">DEALWISE</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">Know your real rate</p>
        </div>
      </footer>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFBFE]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
