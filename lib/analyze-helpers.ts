// ============================================================
// Shared style constants and pure utility functions for the
// analyze page and its extracted sub-components.
// ============================================================

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Style constant maps                                                */
/* ------------------------------------------------------------------ */

export const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export const SEVERITY_LEFT_BORDER: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-blue-500',
};

export const IMPORTANCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  important: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  nice_to_have: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export const LIKELIHOOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

/* ------------------------------------------------------------------ */
/*  Lookup helpers                                                      */
/* ------------------------------------------------------------------ */

export function getRecommendationIcon(rec: string) {
  switch (rec) {
    case 'sign': return CheckCircle2;
    case 'negotiate': return AlertCircle;
    case 'walk_away': return XCircle;
    default: return AlertCircle;
  }
}

export function getSeverityStyle(severity: string) {
  return SEVERITY_STYLES[severity.toLowerCase()] ?? SEVERITY_STYLES.medium;
}

export function getSeverityLeftBorder(severity: string) {
  return SEVERITY_LEFT_BORDER[severity.toLowerCase()] ?? SEVERITY_LEFT_BORDER.medium;
}

export function getImportanceStyle(importance: string) {
  return IMPORTANCE_STYLES[importance.toLowerCase()] ?? IMPORTANCE_STYLES.important;
}

export function getLikelihoodStyle(likelihood: string) {
  return LIKELIHOOD_STYLES[likelihood.toLowerCase()] ?? LIKELIHOOD_STYLES.medium;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
