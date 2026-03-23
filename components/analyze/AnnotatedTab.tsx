'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { RedFlag } from '@/lib/analyzer';

/* ------------------------------------------------------------------ */
/*  Annotated Contract Highlighting helper                              */
/* ------------------------------------------------------------------ */

interface AnnotatedFlag {
  severity: string;
  clause: string;
  issue: string;
  impact?: string;
  hourlyRateImpact?: number;
  suggestion?: string;
}

function getAnnotatedText(text: string, flags: AnnotatedFlag[]): React.ReactNode[] {
  // Sort flags by clause position in text
  const highlights: { start: number; end: number; flag: AnnotatedFlag }[] = [];

  for (const flag of flags) {
    if (!flag.clause) continue;
    // Find the clause in the contract text (case-insensitive, partial match)
    const clauseClean = flag.clause.replace(/\.\.\./g, '').trim();
    if (clauseClean.length < 10) continue;
    const idx = text.toLowerCase().indexOf(clauseClean.toLowerCase().slice(0, 50));
    if (idx >= 0) {
      highlights.push({ start: idx, end: idx + clauseClean.length, flag });
    }
  }

  highlights.sort((a, b) => a.start - b.start);

  // Remove overlapping highlights
  const filtered: typeof highlights = [];
  for (const h of highlights) {
    const last = filtered[filtered.length - 1];
    if (!last || h.start >= last.end) {
      filtered.push(h);
    }
  }

  // Build annotated text
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;

  filtered.forEach((h, i) => {
    if (h.start > lastIdx) {
      parts.push(text.slice(lastIdx, h.start));
    }
    parts.push(
      <span key={i} className="relative group inline">
        <mark className={`rounded px-0.5 cursor-pointer ${
          h.flag.severity === 'critical' ? 'bg-red-100 text-red-900' :
          h.flag.severity === 'high' ? 'bg-orange-100 text-orange-900' :
          h.flag.severity === 'medium' ? 'bg-amber-100 text-amber-900' :
          'bg-blue-100 text-blue-900'
        }`}>
          {text.slice(h.start, h.end)}
        </mark>
        <span className="absolute bottom-full left-0 z-50 mb-1 hidden w-64 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-lg group-hover:block">
          <span className="font-semibold text-gray-900">[{h.flag.severity.toUpperCase()}] {h.flag.issue}</span>
          <br />
          <span className="text-gray-500 mt-1 block">{h.flag.impact?.slice(0, 100)}</span>
        </span>
      </span>
    );
    lastIdx = h.end;
  });

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts.length > 0 ? parts : [text];
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

interface AnnotatedTabProps {
  contractText: string;
  redFlags: RedFlag[];
}

export default function AnnotatedTab({ contractText, redFlags }: AnnotatedTabProps) {
  return (
    <motion.div
      key="tab-annotated"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
    >
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="mb-4 text-sm text-gray-500">Red flag clauses are highlighted in the original contract text. Hover over highlights to see details.</p>
        {contractText ? (
          <div className="font-mono text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
            {getAnnotatedText(contractText, redFlags)}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
            Original contract text is not available. This tab works when you paste or upload a contract directly.
          </div>
        )}
      </div>
    </motion.div>
  );
}
