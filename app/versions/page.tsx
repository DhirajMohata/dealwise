'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, TrendingUp, TrendingDown, Minus, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface VersionEntry {
  id: string;
  contractName: string;
  versionNumber: number;
  overallScore: number;
  recommendation: string;
  createdAt: string;
  analysisId: string;
}

interface ContractGroup {
  name: string;
  versions: VersionEntry[];
}

export default function VersionsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<ContractGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/versions');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/versions')
        .then(res => res.ok ? res.json() : { groups: [] })
        .then(data => setGroups(data.groups || []))
        .catch(() => setGroups([]))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  // Build demo data from localStorage history if no server data
  useEffect(() => {
    if (!loading && groups.length === 0) {
      try {
        const history = JSON.parse(localStorage.getItem('dealwise_history') || '[]');
        if (history.length > 0) {
          // Group by contractSnippet similarity (first 30 chars)
          const grouped: Record<string, VersionEntry[]> = {};
          history.forEach((entry: Record<string, unknown>, i: number) => {
            const snippet = (entry.contractSnippet as string || 'Contract').slice(0, 30).trim();
            const key = snippet || `Contract ${i + 1}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({
              id: entry.id as string || String(i),
              contractName: key,
              versionNumber: grouped[key].length + 1,
              overallScore: entry.overallScore as number || 0,
              recommendation: entry.recommendation as string || 'negotiate',
              createdAt: entry.date as string || new Date().toISOString(),
              analysisId: entry.id as string || String(i),
            });
          });
          setGroups(Object.entries(grouped).map(([name, versions]) => ({ name, versions })));
        }
      } catch {
        // ignore
      }
    }
  }, [loading, groups.length]);

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  }

  function getScoreBg(score: number) {
    if (score >= 70) return 'bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  }

  function getScoreTrend(prev: number, curr: number) {
    if (curr > prev) return { icon: TrendingUp, color: 'text-emerald-600', label: `+${curr - prev}` };
    if (curr < prev) return { icon: TrendingDown, color: 'text-red-600', label: `${curr - prev}` };
    return { icon: Minus, color: 'text-gray-400', label: '0' };
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFE]">
        <Nav />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFE]">
      <Nav />

      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#9CA3AF] transition-colors hover:text-[#4B5563]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#111827] sm:text-4xl">
            Contract Versions
          </h1>
          <p className="mt-2 text-[#9CA3AF]">
            Track how your contract scores improve across revisions.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
            <GitBranch className="mx-auto mb-4 h-12 w-12 text-[#9CA3AF]" />
            <h3 className="text-lg font-semibold text-[#111827]">No versions yet</h3>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Analyze a contract multiple times to see how your score improves across versions.
            </p>
            <Link
              href="/analyze"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.25)] transition-all hover:shadow-lg"
            >
              Analyze a Contract
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group, gi) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.1 }}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-[#111827] truncate">{group.name}</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-[#4B5563]">
                    {group.versions.length} version{group.versions.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Version timeline */}
                <div className="relative">
                  {/* Timeline line */}
                  {group.versions.length > 1 && (
                    <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gray-200" />
                  )}

                  <div className="space-y-4">
                    {group.versions.map((version, vi) => {
                      const prev = vi > 0 ? group.versions[vi - 1] : null;
                      const trend = prev ? getScoreTrend(prev.overallScore, version.overallScore) : null;
                      const TrendIcon = trend?.icon;

                      return (
                        <div key={version.id} className="flex items-start gap-4">
                          {/* Timeline dot */}
                          <div className={`relative z-10 mt-1 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-2 ${getScoreBg(version.overallScore)}`}>
                            <span className={`text-sm font-bold ${getScoreColor(version.overallScore)}`}>
                              {version.overallScore}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#FAFBFE] p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-[#111827]">
                                  v{version.versionNumber}
                                </span>
                                {trend && TrendIcon && (
                                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.color}`}>
                                    <TrendIcon className="h-3 w-3" />
                                    {trend.label}
                                  </span>
                                )}
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  version.recommendation === 'sign' ? 'bg-emerald-50 text-emerald-700' :
                                  version.recommendation === 'negotiate' ? 'bg-amber-50 text-amber-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                  {version.recommendation.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                <Clock className="h-3 w-3" />
                                {new Date(version.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score improvement summary */}
                {group.versions.length > 1 && (() => {
                  const first = group.versions[0].overallScore;
                  const last = group.versions[group.versions.length - 1].overallScore;
                  const diff = last - first;
                  return (
                    <div className={`mt-4 rounded-xl border p-3 text-sm font-medium ${
                      diff > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                      diff < 0 ? 'border-red-200 bg-red-50 text-red-700' :
                      'border-gray-200 bg-gray-50 text-gray-700'
                    }`}>
                      {diff > 0 ? `Score improved by ${diff} points across ${group.versions.length} versions` :
                       diff < 0 ? `Score decreased by ${Math.abs(diff)} points across ${group.versions.length} versions` :
                       `Score unchanged across ${group.versions.length} versions`}
                    </div>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
