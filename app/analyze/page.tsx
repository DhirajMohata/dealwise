'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileWarning,
  TrendingDown,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Share2,
  FileDown,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Upload,
  FileText,
  X,
  Filter,
  Eye,
  Brain,
  MessageSquare,
  Highlighter,
  Mail,
  Award,
  Calculator,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Nav from '@/components/Nav';
import HistoryPanel from '@/components/HistoryPanel';
import ReviewPrompt from '@/components/ReviewPrompt';
import OnboardingBanner from '@/components/OnboardingBanner';
import ErrorFallback from '@/components/ErrorFallback';
import { addHistoryEntry } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import type { AnalysisResult } from '@/lib/analyzer';
import { simpleMarkdownToHtml } from '@/lib/markdown';
import { extractMetadataFromText, type ContractMetadata } from '@/lib/extract-metadata';
import { CURRENCIES, getScoreColor, getRecommendationConfig, getCurrencySymbol } from '@/lib/constants';
// export-pdf is imported dynamically to avoid SSR issues with jspdf

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const SEVERITY_LEFT_BORDER: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-blue-500',
};

const IMPORTANCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  important: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  nice_to_have: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const LIKELIHOOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */


function getRecommendationIcon(rec: string) {
  switch (rec) {
    case 'sign': return CheckCircle2;
    case 'negotiate': return AlertCircle;
    case 'walk_away': return XCircle;
    default: return AlertCircle;
  }
}

function getSeverityStyle(severity: string) {
  return SEVERITY_STYLES[severity.toLowerCase()] ?? SEVERITY_STYLES.medium;
}

function getSeverityLeftBorder(severity: string) {
  return SEVERITY_LEFT_BORDER[severity.toLowerCase()] ?? SEVERITY_LEFT_BORDER.medium;
}

function getImportanceStyle(importance: string) {
  return IMPORTANCE_STYLES[importance.toLowerCase()] ?? IMPORTANCE_STYLES.important;
}

function getLikelihoodStyle(likelihood: string) {
  return LIKELIHOOD_STYLES[likelihood.toLowerCase()] ?? LIKELIHOOD_STYLES.medium;
}

/* ------------------------------------------------------------------ */
/*  Annotated Contract Highlighting                                    */
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ------------------------------------------------------------------ */
/*  Tiny reusable components                                           */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [text]);

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  color = 'text-gray-900',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count?: number;
  color?: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {count}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated Score Circle                                              */
/* ------------------------------------------------------------------ */

function ScoreCircle({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const colors = getScoreColor(score);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-40 w-40">
        <svg className="-rotate-90" viewBox="0 0 120 120" width="160" height="160" role="img" aria-label={`Deal score: ${displayed} out of 100`}>
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
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${colors.text}`}>{displayed}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-medium ${colors.text}`}>{colors.label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function AnalyzePage() {
  const { status } = useSession();
  const router = useRouter();

  /* ---------- form state ---------- */
  const [contractText, setContractText] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showAiSettings, setShowAiSettings] = useState(false);

  /* ---------- file upload state ---------- */
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMode, setUploadMode] = useState<'paste' | 'file'>('paste');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; pages: number; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- ui state ---------- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [reportCopied, setReportCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  /* ---------- form validation state (FIX 2) ---------- */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  /* ---------- loading timer state ---------- */
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  /* ---------- clause filter states (FIX 1) ---------- */
  const [redFlagFilter, setRedFlagFilter] = useState<string>('all');
  const [missingClauseFilter, setMissingClauseFilter] = useState<string>('all');

  /* ---------- credit state ---------- */
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  /* ---------- auto-detected metadata from PDF ---------- */
  const [autoDetected, setAutoDetected] = useState<ContractMetadata | null>(null);

  /* ---------- tabbed results ---------- */
  const [activeTab, setActiveTab] = useState<string>('overview');

  /* ---------- killer feature states ---------- */
  const [negotiationEmail, setNegotiationEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [simRevisions, setSimRevisions] = useState(0);
  const [simPayDelay, setSimPayDelay] = useState(0);
  const [simScopeCreep, setSimScopeCreep] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '$';

  /* ---------- "What If" simulator computed values ---------- */
  const baseHours = parseFloat(estimatedHours) || 80;
  const basePrice = parseFloat(quotedPrice) || (result?.nominalHourlyRate || 0) * baseHours;
  const simTotalHours = baseHours + (simRevisions * baseHours * 0.15) + simScopeCreep;
  const simFloatCost = (simPayDelay / 365) * 0.1 * basePrice; // 10% annual cost of capital
  const simEffectiveRate = simTotalHours > 0 ? Math.max(0, (basePrice - simFloatCost) / simTotalHours) : 0;

  /* ---------- load from dashboard "View" / templates "Analyze" / settings defaults ---------- */
  useEffect(() => {
    // Load result from dashboard "View" button
    const viewResult = localStorage.getItem('dealwise_view_result');
    if (viewResult) {
      try {
        const parsed = JSON.parse(viewResult);
        setResult(parsed);
        localStorage.removeItem('dealwise_view_result');
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch { /* ignore */ }
    }

    // Load template from templates "Analyze" button
    const templateText = localStorage.getItem('dealwise_template_text');
    if (templateText) {
      setContractText(templateText);
      localStorage.removeItem('dealwise_template_text');
    }

    // Load defaults from settings
    const settings = getSettings();
    if (settings.savedApiKey) setClaudeApiKey(settings.savedApiKey);
    if (settings.defaultCurrency) setCurrency(settings.defaultCurrency);
    if (settings.defaultCountry) setCountry(settings.defaultCountry);
  }, []);

  /* ---------- elapsed time counter for loading ---------- */
  useEffect(() => {
    if (!loading || !analysisStartTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - analysisStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, analysisStartTime]);

  /* ---------- fetch user credits ---------- */
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/credits')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUserCredits(data.credits);
            setUserPlan(data.plan);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  /* ---------- keyboard shortcut: Cmd/Ctrl + Enter to submit (FIX 5) ---------- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading && !result) {
          formRef.current?.requestSubmit();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, result]);

  /* ---------- form validation (FIX 2) ---------- */
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!contractText.trim()) {
      newErrors.contractText = 'Contract text is required';
    }
    if (!projectScope.trim()) {
      newErrors.projectScope = 'Please describe your project';
    }
    // Price and hours are now optional — only reject negative values
    if (quotedPrice && parseFloat(quotedPrice) < 0) {
      newErrors.quotedPrice = 'Price cannot be negative';
    }
    if (estimatedHours && parseFloat(estimatedHours) < 0) {
      newErrors.estimatedHours = 'Hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ---------- clear individual error on typing (FIX 2) ---------- */
  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  /* ---------- fill sample contract ---------- */
  function fillSample() {
    setContractText(`FREELANCE SERVICE AGREEMENT

This Agreement is entered into between Client Corp ("Client") and Freelancer ("Contractor").

1. SCOPE OF WORK
The Contractor shall design and develop a responsive website including homepage, about page, services page, portfolio page, and contact page. Additional duties as directed by the Client may also be required.

2. COMPENSATION
The total project fee shall be $6,000 USD, payable upon final delivery and client approval. Payment terms are Net-60 from invoice date.

3. REVISIONS
The Client shall be entitled to unlimited revisions until fully satisfied with the deliverables.

4. INTELLECTUAL PROPERTY
All work product shall be considered work-for-hire. All intellectual property rights transfer to the Client upon creation, regardless of payment status.

5. TIMELINE
The project shall be completed within 8 weeks of signing. Reasonable changes and modifications shall be made at no additional cost.

6. TERMINATION
Either party may terminate this agreement at any time without cause. Upon termination, no further payment shall be due to the Contractor.

7. NON-COMPETE
The Contractor agrees not to work with any competing businesses for a period of 24 months following the completion of this project.

8. LIABILITY
The Contractor shall be fully liable for any and all damages, losses, or claims arising from the work performed under this agreement.

9. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information shared during the project.`);
    setProjectScope('Website redesign and development');
    setQuotedPrice('6000');
    setEstimatedHours('80');
    setCurrency('USD');
    setShowOptional(true);
    setErrors({});
  }

  /* ---------- loading timer helper ---------- */

  /* ---------- submit ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    setAnalysisStartTime(Date.now());
    setElapsedSeconds(0);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          projectScope,
          quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          currency,
          country: country || undefined,
          claudeApiKey: claudeApiKey || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      // Update credits from response
      if (data.creditsRemaining !== undefined) {
        setUserCredits(data.creditsRemaining);
      }
      setResult(data as AnalysisResult);

      // After analysis, prompt signup if not logged in
      if (status === "unauthenticated") {
        setShowSignupPrompt(true);
      }

      // After analysis, prompt review for logged-in users
      if (status === "authenticated") {
        setTimeout(() => setShowReview(true), 3000);
      }

      // Reset filters and tab when new results arrive
      setRedFlagFilter('all');
      setMissingClauseFilter('all');
      setActiveTab('overview');

      // Save to history (localStorage)
      addHistoryEntry({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        overallScore: data.overallScore,
        recommendation: data.recommendation,
        summary: data.summary,
        contractSnippet: contractText.slice(0, 80).replace(/\s+/g, ' ').trim(),
        currency,
        nominalHourlyRate: data.nominalHourlyRate,
        effectiveHourlyRate: data.effectiveHourlyRate,
        rateReduction: data.rateReduction,
        fullResult: JSON.stringify(data),
      });

      // Save to server if authenticated
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          contractSnippet: contractText.slice(0, 200),
          overallScore: data.overallScore,
          recommendation: data.recommendation,
          nominalRate: data.nominalHourlyRate,
          effectiveRate: data.effectiveHourlyRate,
          rateReduction: data.rateReduction,
          currency,
          contractType: data.contractType,
          fullResult: JSON.stringify({ ...data, contractText }),
        }),
      }).catch(() => {}); // Don't block on server save failure

      // scroll to results after a short delay for the animation to start
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setAnalysisStartTime(null);
      setElapsedSeconds(0);
    }
  }

  /* ---------- share ---------- */
  function handleShare() {
    if (!result) return;
    const shareData = {
      s: result.overallScore,
      nr: result.nominalHourlyRate,
      er: result.effectiveHourlyRate,
      rr: result.rateReduction,
      rec: result.recommendation,
      rf: result.redFlags.length,
      mc: result.missingClauses.length,
      gf: result.greenFlags.length,
      sum: result.summary,
      cur: currencySymbol,
      top: result.redFlags.slice(0, 3).map(f => ({ sev: f.severity, issue: f.issue })),
    };
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const url = `${window.location.origin}/report?d=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }).catch(() => {});
    } catch {
      // Fallback: copy text summary
      const text = [
        `Deal Score: ${result.overallScore}/100`,
        `Recommendation: ${result.recommendation.toUpperCase().replace('_', ' ')}`,
        `Quoted Rate: ${currencySymbol}${result.nominalHourlyRate.toFixed(2)}/hr`,
        `Real Rate: ${currencySymbol}${result.effectiveHourlyRate.toFixed(2)}/hr`,
        '',
        result.summary,
        '',
        'Analyzed with DEALWISE',
      ].join('\n');
      navigator.clipboard.writeText(text).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }).catch(() => {});
    }
  }

  /* ---------- reset ---------- */
  function handleReset() {
    setResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- file upload ---------- */
  async function handleFileUpload(file: File) {
    setUploadError('');
    setUploadedFile(null);

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum 5MB.');
      return;
    }

    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setUploadError('Only PDF, DOCX, and TXT files are supported.');
      return;
    }

    setUploadLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await new Promise<{ text: string; pages: number }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener('load', () => {
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed?.error ?? `Upload failed (${xhr.status})`));
            }
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.open('POST', '/api/parse-pdf');
        xhr.send(formData);
      });

      const metadata = extractMetadataFromText(data.text);

      setContractText(data.text);
      setUploadMode('file');
      setUploadedFile({ name: file.name, pages: data.pages, size: formatFileSize(file.size) });

      // Auto-fill detected fields
      if (metadata.detectedScope) setProjectScope(metadata.detectedScope);
      if (metadata.detectedPrice) setQuotedPrice(String(metadata.detectedPrice));
      if (metadata.detectedCurrency) setCurrency(metadata.detectedCurrency);
      if (metadata.estimatedHours) setEstimatedHours(String(metadata.estimatedHours));

      // Expand optional section if price/hours were detected
      if (metadata.detectedPrice || metadata.estimatedHours) setShowOptional(true);

      // Show what was auto-detected
      setAutoDetected(metadata);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to parse file.');
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  /* ---------- copy full report ---------- */
  function handleCopyReport() {
    if (!result) return;

    const lines: string[] = [
      '========================================',
      '  DEALWISE - Contract Analysis Report',
      '========================================',
      '',
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      '--- DEAL SCORE ---',
      `Score: ${result.overallScore}/100`,
      `Recommendation: ${result.recommendation.toUpperCase().replace('_', ' ')}`,
      '',
      '--- RATE COMPARISON ---',
      `Quoted Rate: ${currencySymbol}${result.nominalHourlyRate.toFixed(2)}/hr`,
      `Effective (Real) Rate: ${currencySymbol}${result.effectiveHourlyRate.toFixed(2)}/hr`,
      `Rate Reduction: ${result.rateReduction.toFixed(1)}%`,
      '',
    ];

    if (result.redFlags.length > 0) {
      lines.push(`--- RED FLAGS (${result.redFlags.length}) ---`);
      result.redFlags.forEach((flag, i) => {
        lines.push(`  ${i + 1}. [${flag.severity.toUpperCase()}] ${flag.issue}`);
        lines.push(`     Clause: "${flag.clause}"`);
        lines.push(`     Impact: ${flag.impact}`);
        if (flag.hourlyRateImpact !== 0) {
          lines.push(`     Rate Impact: ${flag.hourlyRateImpact > 0 ? '-' : '+'}${currencySymbol}${Math.abs(flag.hourlyRateImpact).toFixed(2)}/hr`);
        }
        lines.push(`     Suggestion: ${flag.suggestion}`);
        lines.push('');
      });
    }

    if (result.missingClauses.length > 0) {
      lines.push(`--- MISSING CLAUSES (${result.missingClauses.length}) ---`);
      result.missingClauses.forEach((clause, i) => {
        lines.push(`  ${i + 1}. [${clause.importance.toUpperCase()}] ${clause.name}`);
        lines.push(`     ${clause.description}`);
        lines.push(`     Suggested Language: ${clause.suggestedLanguage}`);
        lines.push('');
      });
    }

    if (result.scopeRisks.length > 0) {
      lines.push(`--- SCOPE CREEP RISKS (${result.scopeRisks.length}) ---`);
      result.scopeRisks.forEach((risk, i) => {
        lines.push(`  ${i + 1}. [${risk.likelihood.toUpperCase()} likelihood] ${risk.risk}`);
        lines.push(`     Potential Cost: ${risk.potentialCost}`);
        lines.push('');
      });
    }

    if (result.aiInsights) {
      lines.push('--- AI-POWERED INSIGHTS ---');
      lines.push(result.aiInsights);
      lines.push('');
    }

    lines.push('--- SUMMARY ---');
    lines.push(result.summary);
    lines.push('');
    lines.push('========================================');
    lines.push('  Generated by DEALWISE');
    lines.push('========================================');

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2500);
    }).catch(() => {});
  }

  /* ---------- stagger helpers ---------- */
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  /* ---------- load from history ---------- */
  function handleLoadFromHistory(historicalResult: AnalysisResult) {
    setResult(historicalResult);
    // Try to set currency from the result if available
    if ((historicalResult as unknown as Record<string, unknown>).currency) {
      setCurrency((historicalResult as unknown as Record<string, unknown>).currency as string);
    }
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <HistoryPanel onSelectResult={handleLoadFromHistory} />

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <AnimatePresence mode="wait">
          {/* ====================================================== */}
          {/*  STATE 1 — INPUT FORM                                   */}
          {/* ====================================================== */}
          {!result && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Page header */}
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Analyze Your Deal
                </h1>
                <p className="mt-2 max-w-2xl text-gray-400">
                  Paste your contract and deal details below. Our AI will uncover hidden costs, red flags, and scope-creep risks so you know your{' '}
                  <span className="text-gray-600">real</span> hourly rate.
                </p>
              </div>

              {/* Onboarding banner for first-time users */}
              <OnboardingBanner />

              {/* Try with a sample contract */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={fillSample}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Try with a sample contract
                </button>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                {/* ---- Section A: Contract Text ---- */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <label htmlFor="contract" className="mb-1 block text-sm font-semibold text-gray-900">
                    Your Contract
                  </label>
                  <p className="mb-4 text-xs text-gray-400">
                    Upload a file or paste the full contract text. Your data is processed securely and never stored.
                  </p>

                  {/* Upload error */}
                  {uploadError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                      {uploadError}
                    </div>
                  )}

                  {uploadMode === 'file' && uploadedFile ? (
                    /* File confirmation card */
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-100 p-2.5">
                            <FileText className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-400">{uploadedFile.pages} page{uploadedFile.pages !== 1 ? 's' : ''} &middot; {uploadedFile.size} &middot; Parsed successfully</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <button
                            type="button"
                            onClick={() => { setUploadMode('paste'); setUploadedFile(null); setContractText(''); }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {autoDetected && (
                        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                          <p className="text-xs font-medium text-indigo-600 mb-2">Auto-detected from your contract:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {autoDetected.detectedPrice && <div>Price: {autoDetected.detectedCurrency || '$'}{autoDetected.detectedPrice.toLocaleString()}</div>}
                            {autoDetected.contractType && <div>Type: {autoDetected.contractType}</div>}
                            {autoDetected.estimatedHours && <div>Est. hours: {autoDetected.estimatedHours}</div>}
                            {autoDetected.detectedPaymentTerms && <div>Payment: {autoDetected.detectedPaymentTerms}</div>}
                            {autoDetected.detectedParties?.client && <div>Client: {autoDetected.detectedParties.client}</div>}
                            {autoDetected.detectedScope && <div className="col-span-2">Scope: {autoDetected.detectedScope.substring(0, 100)}...</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Paste / upload mode */
                    <>
                      {/* File Upload Zone */}
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
                          isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.txt,.docx,.doc,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                            e.target.value = '';
                          }}
                        />

                        {uploadLoading ? (
                          <div className="flex flex-col items-center gap-2 w-full px-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                              <span className="text-sm text-indigo-600">Parsing file...</span>
                            </div>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <Upload className={`h-8 w-8 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                            <div className="text-center">
                              <p className={`text-sm font-medium ${isDragging ? 'text-indigo-600' : 'text-gray-600'}`}>
                                Upload PDF, DOCX, or TXT
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                Drag and drop or click to browse (max 5MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="relative my-4 flex items-center">
                        <div className="flex-grow border-t border-gray-200" />
                        <span className="mx-4 text-xs text-gray-400">or paste your contract text</span>
                        <div className="flex-grow border-t border-gray-200" />
                      </div>

                      <textarea
                        id="contract"
                        rows={8}
                        value={contractText}
                        onChange={(e) => { setContractText(e.target.value); clearError('contractText'); }}
                        placeholder="Paste your contract, agreement, or terms here..."
                        className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${errors.contractText ? 'border-red-400' : 'border-gray-200'}`}
                      />
                    </>
                  )}
                  {errors.contractText && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.contractText}</p>
                  )}
                </div>

                {/* ---- Section B: Deal Details ---- */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="mb-1 text-sm font-semibold text-gray-900">Your Deal Details</h2>
                  <p className="mb-6 text-xs text-gray-400">Tell us about the project so we can calculate your real rate.</p>

                  {/* Always visible: Project Scope */}
                  <div>
                    <label htmlFor="scope" className="mb-1.5 block text-xs font-medium text-gray-600">
                      Project Scope
                    </label>
                    <textarea
                      id="scope"
                      rows={2}
                      value={projectScope}
                      onChange={(e) => { setProjectScope(e.target.value); clearError('projectScope'); }}
                      placeholder="Briefly describe the work — e.g., 'Design and build a 5-page React website with CMS integration'"
                      className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${errors.projectScope ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.projectScope && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.projectScope}</p>
                    )}
                  </div>

                  {/* Collapsible: Optional details */}
                  <button
                    type="button"
                    onClick={() => setShowOptional(!showOptional)}
                    className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                    {showOptional ? 'Hide' : 'Add'} pricing details (optional)
                  </button>

                  <AnimatePresence>
                    {showOptional && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          {/* Quoted Price */}
                          <div>
                            <label htmlFor="price" className="mb-1.5 block text-xs font-medium text-gray-600">
                              Quoted Price (optional — we&apos;ll auto-detect)
                            </label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                {currencySymbol}
                              </span>
                              <input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={quotedPrice}
                                onChange={(e) => { setQuotedPrice(e.target.value); clearError('quotedPrice'); }}
                                placeholder="5000"
                                className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${errors.quotedPrice ? 'border-red-400' : 'border-gray-200'}`}
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Leave blank and we&apos;ll try to detect from your contract text</p>
                            {errors.quotedPrice && (
                              <p className="mt-1.5 text-xs text-red-600">{errors.quotedPrice}</p>
                            )}
                          </div>

                          {/* Estimated Hours */}
                          <div>
                            <label htmlFor="hours" className="mb-1.5 block text-xs font-medium text-gray-600">
                              Estimated Hours (optional)
                            </label>
                            <input
                              id="hours"
                              type="number"
                              min="0"
                              step="0.5"
                              value={estimatedHours}
                              onChange={(e) => { setEstimatedHours(e.target.value); clearError('estimatedHours'); }}
                              placeholder="80"
                              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${errors.estimatedHours ? 'border-red-400' : 'border-gray-200'}`}
                            />
                            <p className="mt-1 text-xs text-gray-400">Leave blank and we&apos;ll try to detect from your contract text</p>
                            {errors.estimatedHours && (
                              <p className="mt-1.5 text-xs text-red-600">{errors.estimatedHours}</p>
                            )}
                          </div>

                          {/* Currency */}
                          <div>
                            <label htmlFor="currency" className="mb-1.5 block text-xs font-medium text-gray-600">
                              Currency
                            </label>
                            <div className="relative">
                              <select
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                              >
                                {CURRENCIES.map((c) => (
                                  <option key={c.value} value={c.value} className="bg-white text-gray-900">
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                          </div>

                          {/* Country */}
                          <div>
                            <label htmlFor="country" className="mb-1.5 block text-xs font-medium text-gray-600">
                              Your Country <span className="text-gray-400">(for legal context)</span>
                            </label>
                            <div className="relative">
                              <select
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                              >
                                <option value="" className="bg-white text-gray-900">Auto-detect from currency</option>
                                <option value="US" className="bg-white text-gray-900">United States</option>
                                <option value="IN" className="bg-white text-gray-900">India</option>
                                <option value="GB" className="bg-white text-gray-900">United Kingdom</option>
                                <option value="EU" className="bg-white text-gray-900">European Union</option>
                                <option value="AU" className="bg-white text-gray-900">Australia</option>
                                <option value="CA" className="bg-white text-gray-900">Canada</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* AI Settings */}
                <div className="space-y-4">

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAiSettings(!showAiSettings)}
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      {showAiSettings ? 'Hide' : 'Enable'} AI-Enhanced Analysis (Claude API)
                      <ChevronDown className={`h-3 w-3 transition-transform ${showAiSettings ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showAiSettings && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                            <p className="mb-3 text-xs text-gray-600">
                              Add your Claude API key for deeper AI-powered analysis. The key is sent only to Anthropic&apos;s API and never stored.
                            </p>
                            <input
                              type="password"
                              value={claudeApiKey}
                              onChange={(e) => setClaudeApiKey(e.target.value)}
                              placeholder="sk-ant-api03-..."
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400"
                            />
                            <p className="mt-2 text-[10px] text-gray-400">
                              Without an API key, you get heuristic analysis (regex-based). With it, you get AI-powered insights from Claude that catch subtle legal nuances.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ErrorFallback
                      error={error}
                      reset={() => setError('')}
                    />
                  </motion.div>
                )}

                {/* Loading progress card */}
                {loading && (
                  <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                    <p className="mt-4 text-sm font-medium text-gray-900">Analyzing your contract...</p>
                    <p className="mt-1 text-xs text-gray-400">{elapsedSeconds}s elapsed</p>
                  </div>
                )}

                {/* Credit Info */}
                {status === 'authenticated' && userCredits !== null && userPlan !== 'admin' && (
                  <div className={`rounded-lg border p-3 text-sm ${userCredits < 5 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        This analysis will use <span className="font-medium text-gray-900">{claudeApiKey ? '2' : '1'} credit(s)</span>
                      </span>
                      <span className="text-gray-600">
                        Balance: <span className="font-medium text-gray-900">{userCredits}</span>
                      </span>
                    </div>
                    {userCredits < 5 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Low credits remaining. Contact admin for more credits.
                      </p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Analyze My Deal
                        <kbd className="ml-2 hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-normal text-white/60 sm:inline-block" suppressHydrationWarning>
                          {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}+{'\u21B5'}
                        </kbd>
                      </>
                    )}
                  </span>
                  {/* shimmer overlay */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </form>
            </motion.div>
          )}

          {/* ====================================================== */}
          {/*  STATE 2 — RESULTS DASHBOARD (TABBED)                   */}
          {/* ====================================================== */}
          {result && (
            <motion.div
              key="results"
              ref={resultsRef}
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {/* Page header */}
              <motion.div variants={fadeUp}>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Analysis Results</h1>
                <p className="mt-2 text-gray-400">
                  Here&apos;s what we found in your contract.
                </p>
              </motion.div>

              {/* Result summary headline */}
              <motion.div variants={fadeUp} className="mb-6 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  Your contract scored <span className={getScoreColor(result.overallScore).text}>{result.overallScore}/100</span>
                  {' — '}
                  we found <span className="text-red-600">{result.redFlags.length} red flag{result.redFlags.length !== 1 ? 's' : ''}</span>
                  {result.missingClauses.length > 0 && <>{' '}and <span className="text-orange-600">{result.missingClauses.length} missing clause{result.missingClauses.length !== 1 ? 's' : ''}</span></>}
                </p>
              </motion.div>

              {/* -------------------------------------------------- */}
              {/*  TAB BAR                                             */}
              {/* -------------------------------------------------- */}
              <motion.div variants={fadeUp}>
                <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex gap-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'redflags', label: 'Red Flags', icon: ShieldAlert, count: result.redFlags.length },
                    { id: 'missing', label: 'Missing & Good', icon: FileWarning, count: result.missingClauses.length },
                    { id: 'ai', label: 'AI Analysis', icon: Brain },
                    { id: 'annotated', label: 'Annotated', icon: Highlighter, count: result.redFlags.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          activeTab === tab.id ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* -------------------------------------------------- */}
              {/*  TAB CONTENT                                         */}
              {/* -------------------------------------------------- */}
              <AnimatePresence mode="wait">
                {/* ============ OVERVIEW TAB ============ */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="tab-overview"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    {/* Score + Rate Comparison + Recommendation */}
                    <div className="grid gap-6 sm:grid-cols-3">
                      {/* Score */}
                      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <ScoreCircle score={result.overallScore} />
                      </div>

                      {/* Rate Comparison */}
                      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rate Comparison</h3>

                        {/* Quoted */}
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                          <p className="text-xs text-gray-400">Your Quoted Rate</p>
                          <p className="text-xl font-bold text-gray-900">
                            {currencySymbol}{result.nominalHourlyRate.toFixed(2)}
                            <span className="text-sm font-normal text-gray-400">/hr</span>
                          </p>
                        </div>

                        {/* Real */}
                        <div
                          className={`rounded-xl border px-4 py-3 ${
                            result.effectiveHourlyRate < result.nominalHourlyRate
                              ? 'border-red-200 bg-red-50'
                              : 'border-emerald-200 bg-emerald-50'
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              result.effectiveHourlyRate < result.nominalHourlyRate
                                ? 'text-red-500'
                                : 'text-emerald-500'
                            }`}
                          >
                            Your REAL Rate
                          </p>
                          <p
                            className={`text-xl font-bold ${
                              result.effectiveHourlyRate < result.nominalHourlyRate
                                ? 'text-red-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {currencySymbol}{result.effectiveHourlyRate.toFixed(2)}
                            <span className="text-sm font-normal opacity-60">/hr</span>
                          </p>
                        </div>

                        {result.rateReduction > 0 && (
                          <p className="text-center">
                            <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                              You&apos;re losing {result.rateReduction.toFixed(1)}% to contract terms
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Recommendation Badge */}
                      {(() => {
                        const config = getRecommendationConfig(result.recommendation);
                        const RecIcon = getRecommendationIcon(result.recommendation);
                        return (
                          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recommendation</h3>
                            <div
                              className={`flex items-center gap-3 rounded-xl border px-6 py-4 ${config.bg} ${config.border}`}
                            >
                              <RecIcon className={`h-7 w-7 ${config.text}`} />
                              <span className={`text-2xl font-extrabold ${config.text}`}>{config.label}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Contextual Score Message */}
                    <div className={`rounded-xl border px-5 py-4 text-sm font-medium ${
                      result.overallScore >= 70
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : result.overallScore >= 40
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}>
                      {result.overallScore >= 70
                        ? 'This contract looks solid. Review the minor issues below.'
                        : result.overallScore >= 40
                        ? 'This contract needs negotiation. Use the counter-proposals below.'
                        : 'This contract is risky. We strongly recommend not signing without major changes.'}
                    </div>

                    {/* Summary */}
                    <div>
                      <SectionHeader icon={Info} title="Analysis Summary" color="text-indigo-600" />
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                        <p className="text-sm leading-relaxed text-gray-600">{result.summary}</p>
                      </div>
                    </div>

                    {/* Walk Away Calculator */}
                    {result.rateReduction > 10 && result.nominalHourlyRate > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          The Real Cost of This Deal
                        </h3>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg bg-white p-3 border border-amber-100">
                            <p className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">What You Expect</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">
                              {currencySymbol}{(result.nominalHourlyRate * (parseFloat(estimatedHours) || 80)).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">{currencySymbol}{result.nominalHourlyRate}/hr x {estimatedHours || 80} hrs</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 border border-red-100">
                            <p className="text-[10px] uppercase tracking-wider text-red-600 font-medium">What You&apos;ll Actually Earn</p>
                            <p className="mt-1 text-xl font-bold text-red-600">
                              {currencySymbol}{(result.effectiveHourlyRate * (parseFloat(estimatedHours) || 80)).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">{currencySymbol}{result.effectiveHourlyRate.toFixed(2)}/hr x {estimatedHours || 80} hrs</p>
                          </div>
                          <div className="rounded-lg bg-white p-3 border border-gray-200">
                            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">Money Left on Table</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">
                              {currencySymbol}{((result.nominalHourlyRate - result.effectiveHourlyRate) * (parseFloat(estimatedHours) || 80)).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">{result.rateReduction.toFixed(0)}% lost to contract terms</p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-amber-700">
                          Negotiate the red flags above to close this gap. Use the &quot;Generate Negotiation Email&quot; button to get a ready-to-send message.
                        </p>
                      </div>
                    )}

                    {/* "What If" Scenario Simulator */}
                    {result.nominalHourlyRate > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                          &quot;What If&quot; Scenario Simulator
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-xs text-gray-500">Extra revision rounds</label>
                            <input type="range" min="0" max="10" value={simRevisions} onChange={e => setSimRevisions(parseInt(e.target.value))} className="w-full mt-1 accent-indigo-600" />
                            <span className="text-xs text-gray-700">{simRevisions} extra rounds</span>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Payment delay (days late)</label>
                            <input type="range" min="0" max="90" step="15" value={simPayDelay} onChange={e => setSimPayDelay(parseInt(e.target.value))} className="w-full mt-1 accent-indigo-600" />
                            <span className="text-xs text-gray-700">{simPayDelay} days late</span>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Scope creep (extra hours)</label>
                            <input type="range" min="0" max="100" step="5" value={simScopeCreep} onChange={e => setSimScopeCreep(parseInt(e.target.value))} className="w-full mt-1 accent-indigo-600" />
                            <span className="text-xs text-gray-700">+{simScopeCreep} hours</span>
                          </div>
                          <div className="flex flex-col justify-end">
                            <p className="text-xs text-gray-500 mb-1">Simulated effective rate:</p>
                            <p className="text-2xl font-bold" style={{ color: simEffectiveRate < result.nominalHourlyRate * 0.5 ? '#DC2626' : simEffectiveRate < result.nominalHourlyRate * 0.75 ? '#D97706' : '#059669' }}>
                              {currencySymbol}{simEffectiveRate.toFixed(2)}/hr
                            </p>
                            <p className="text-xs text-gray-400">vs {currencySymbol}{result.nominalHourlyRate}/hr quoted</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ============ RED FLAGS TAB ============ */}
                {activeTab === 'redflags' && (
                  <motion.div
                    key="tab-redflags"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {result.redFlags.length > 0 ? (() => {
                      const severityCounts = {
                        all: result.redFlags.length,
                        critical: result.redFlags.filter((f) => f.severity === 'critical').length,
                        high: result.redFlags.filter((f) => f.severity === 'high').length,
                        medium: result.redFlags.filter((f) => f.severity === 'medium').length,
                        low: result.redFlags.filter((f) => f.severity === 'low').length,
                      };
                      const filteredRedFlags = redFlagFilter === 'all'
                        ? result.redFlags
                        : result.redFlags.filter((f) => f.severity === redFlagFilter);

                      return (
                        <>
                          <SectionHeader icon={ShieldAlert} title="Red Flags Found" count={result.redFlags.length} color="text-red-600" />

                          {/* Filter bar */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
                              const count = severityCounts[sev];
                              if (sev !== 'all' && count === 0) return null;
                              const isActive = redFlagFilter === sev;
                              return (
                                <button
                                  key={sev}
                                  type="button"
                                  onClick={() => setRedFlagFilter(sev)}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                                    isActive
                                      ? sev === 'all'
                                        ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-300'
                                        : sev === 'critical'
                                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                        : sev === 'high'
                                        ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                                        : sev === 'medium'
                                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                        : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {sev === 'all' ? 'All' : sev}
                                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    isActive ? 'bg-black/10' : 'bg-gray-100'
                                  }`}>
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                              {filteredRedFlags.map((flag, i) => {
                                const sev = getSeverityStyle(flag.severity);
                                const leftBorder = getSeverityLeftBorder(flag.severity);
                                return (
                                  <motion.div
                                    key={`${flag.severity}-${flag.clause}-${i}`}
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    layout
                                    className={`rounded-xl border border-gray-200 border-l-4 ${leftBorder} bg-white p-5 shadow-sm`}
                                  >
                                    {/* Top row: severity + rate impact */}
                                    <div className="mb-4 flex flex-wrap items-center gap-3">
                                      <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${sev.bg} ${sev.text} ${sev.border}`}>
                                        {flag.severity}
                                      </span>
                                      {flag.hourlyRateImpact !== 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                          <TrendingDown className="h-3 w-3" />
                                          {flag.hourlyRateImpact > 0 ? '-' : '+'}
                                          {currencySymbol}{Math.abs(flag.hourlyRateImpact).toFixed(2)}/hr
                                        </span>
                                      )}
                                    </div>

                                    {/* Clause quote */}
                                    <div className="mb-4 rounded-lg bg-gray-50 p-3">
                                      <p className="text-sm font-mono text-gray-600 italic">
                                        &ldquo;{flag.clause}&rdquo;
                                      </p>
                                    </div>

                                    {/* Issue & Impact */}
                                    <div className="mb-4 space-y-2 text-sm">
                                      <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">Issue: </span>
                                        {flag.issue}
                                      </p>
                                      <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">Financial Impact: </span>
                                        {flag.impact}
                                      </p>
                                    </div>

                                    {/* Suggestion */}
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                      <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-emerald-700">Suggested Counter-Proposal</span>
                                        <CopyButton text={flag.suggestion} label="Copy" />
                                      </div>
                                      <p className="text-sm leading-relaxed text-gray-600">{flag.suggestion}</p>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            {filteredRedFlags.length === 0 && (
                              <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                                No red flags match this filter.
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })() : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-sm text-emerald-700">
                        No red flags found in this contract. That&apos;s a good sign!
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ============ MISSING & GOOD TAB ============ */}
                {activeTab === 'missing' && (
                  <motion.div
                    key="tab-missing"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-10"
                  >
                    {/* Missing Clauses */}
                    {result.missingClauses.length > 0 ? (() => {
                      const importanceCounts = {
                        all: result.missingClauses.length,
                        critical: result.missingClauses.filter((c) => c.importance === 'critical').length,
                        important: result.missingClauses.filter((c) => c.importance === 'important').length,
                        nice_to_have: result.missingClauses.filter((c) => c.importance === 'nice_to_have').length,
                      };
                      const importanceLabels: Record<string, string> = {
                        all: 'All',
                        critical: 'Critical',
                        important: 'Important',
                        nice_to_have: 'Nice to Have',
                      };
                      const filteredClauses = missingClauseFilter === 'all'
                        ? result.missingClauses
                        : result.missingClauses.filter((c) => c.importance === missingClauseFilter);

                      return (
                        <section>
                          <SectionHeader icon={FileWarning} title="Missing Protections" count={result.missingClauses.length} color="text-amber-600" />

                          {/* Filter bar */}
                          <div className="mb-5 flex flex-wrap items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            {(['all', 'critical', 'important', 'nice_to_have'] as const).map((imp) => {
                              const count = importanceCounts[imp];
                              if (imp !== 'all' && count === 0) return null;
                              const isActive = missingClauseFilter === imp;
                              return (
                                <button
                                  key={imp}
                                  type="button"
                                  onClick={() => setMissingClauseFilter(imp)}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                    isActive
                                      ? imp === 'all'
                                        ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-300'
                                        : imp === 'critical'
                                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                        : imp === 'important'
                                        ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                                        : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {importanceLabels[imp]}
                                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    isActive ? 'bg-black/10' : 'bg-gray-100'
                                  }`}>
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                              {filteredClauses.map((clause, i) => {
                                const imp = getImportanceStyle(clause.importance);
                                return (
                                  <motion.div
                                    key={`${clause.importance}-${clause.name}-${i}`}
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    layout
                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                  >
                                    <div className="mb-3 flex flex-wrap items-center gap-3">
                                      <h3 className="text-sm font-semibold text-gray-900">{clause.name}</h3>
                                      <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${imp.bg} ${imp.text} ${imp.border}`}>
                                        {clause.importance}
                                      </span>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-600">{clause.description}</p>

                                    {/* Suggested language */}
                                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                                      <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-indigo-700">Add This Language</span>
                                        <CopyButton text={clause.suggestedLanguage} label="Copy" />
                                      </div>
                                      <p className="text-sm leading-relaxed text-gray-600">{clause.suggestedLanguage}</p>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            {filteredClauses.length === 0 && (
                              <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                                No missing clauses match this filter.
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })() : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-sm text-emerald-700">
                        No missing protections detected.
                      </div>
                    )}

                    {/* Green Flags */}
                    <section>
                      <SectionHeader icon={ShieldCheck} title="Green Flags" count={result.greenFlags.length} color="text-emerald-600" />

                      {result.greenFlags.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {result.greenFlags.map((flag, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                            >
                              <p className="mb-2 text-sm font-semibold text-emerald-700">{flag.clause}</p>
                              <p className="text-sm leading-relaxed text-gray-600">{flag.benefit}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                            <p className="text-sm leading-relaxed text-gray-600">
                              No positive protections found in this contract. This is a red flag in itself — a well-drafted contract should include protections for both parties.
                            </p>
                          </div>
                        </div>
                      )}
                    </section>
                  </motion.div>
                )}

                {/* ============ AI ANALYSIS TAB ============ */}
                {activeTab === 'ai' && (
                  <motion.div
                    key="tab-ai"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    {/* AI-Enhanced Insights */}
                    {getSettings().showAiInsights !== false && (
                      <>
                        {result.aiInsights ? (
                          <section>
                            <SectionHeader icon={Sparkles} title="AI-Powered Deep Analysis" color="text-indigo-600" />
                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
                              <div
                                className="text-sm leading-relaxed text-gray-600 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_em]:text-gray-900 [&_ul]:my-2 [&_li]:text-gray-600"
                                dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(result.aiInsights) }}
                              />
                            </div>
                          </section>
                        ) : (
                          <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                            AI insights are available when you provide a Claude API key. Enable it in the analysis form to get deeper contract analysis.
                          </div>
                        )}
                      </>
                    )}

                    {/* Country-Specific Legal Context */}
                    {getSettings().showCountryContext !== false && result.countryContext && (
                      <section>
                        <SectionHeader icon={Info} title="Legal Context for Your Country" color="text-blue-600" />
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                          <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                            {result.countryContext}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Scope Risks */}
                    {result.scopeRisks.length > 0 && (
                      <section>
                        <SectionHeader icon={AlertTriangle} title="Scope Creep Risks" count={result.scopeRisks.length} color="text-orange-600" />

                        <div className="grid gap-4 sm:grid-cols-2">
                          {result.scopeRisks.map((risk, i) => {
                            const lk = getLikelihoodStyle(risk.likelihood);
                            return (
                              <div
                                key={i}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                              >
                                <div className="mb-3 flex items-center gap-2">
                                  <span className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${lk.bg} ${lk.text} ${lk.border}`}>
                                    {risk.likelihood} likelihood
                                  </span>
                                </div>
                                <p className="mb-2 text-sm text-gray-900">{risk.risk}</p>
                                <p className="text-sm text-gray-400">
                                  <span className="font-semibold text-gray-600">Potential cost: </span>
                                  {risk.potentialCost}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </motion.div>
                )}

                {/* ============ ANNOTATED CONTRACT TAB ============ */}
                {activeTab === 'annotated' && (
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
                        <div className="font-mono text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                          {getAnnotatedText(contractText, result.redFlags)}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
                          Original contract text is not available. This tab works when you paste or upload a contract directly.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* -------------------------------------------------- */}
              {/*  ACTIONS                                             */}
              {/* -------------------------------------------------- */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Analyze Another Contract
                </button>

                <button
                  onClick={async () => {
                    const { exportAnalysisPDF } = await import('@/lib/export-pdf');
                    await exportAnalysisPDF(result, currencySymbol);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </button>

                <button
                  onClick={() => {
                    if (!result) return;
                    const lines: string[] = [
                      '========================================',
                      '  DEALWISE - Contract Analysis Report',
                      '========================================',
                      '',
                      `Date: ${new Date().toLocaleDateString()}`,
                      '',
                      '--- DEAL SCORE ---',
                      `Score: ${result.overallScore}/100`,
                      `Recommendation: ${result.recommendation.toUpperCase().replace('_', ' ')}`,
                      '',
                      '--- RATE COMPARISON ---',
                      `Quoted Rate: ${currencySymbol}${result.nominalHourlyRate.toFixed(2)}/hr`,
                      `Effective (Real) Rate: ${currencySymbol}${result.effectiveHourlyRate.toFixed(2)}/hr`,
                      `Rate Reduction: ${result.rateReduction.toFixed(1)}%`,
                      '',
                    ];
                    if (result.redFlags.length > 0) {
                      lines.push(`--- RED FLAGS (${result.redFlags.length}) ---`);
                      result.redFlags.forEach((flag, i) => {
                        lines.push(`  ${i + 1}. [${flag.severity.toUpperCase()}] ${flag.issue}`);
                        lines.push(`     Clause: "${flag.clause}"`);
                        lines.push(`     Impact: ${flag.impact}`);
                        lines.push(`     Suggestion: ${flag.suggestion}`);
                        lines.push('');
                      });
                    }
                    if (result.missingClauses.length > 0) {
                      lines.push(`--- MISSING CLAUSES (${result.missingClauses.length}) ---`);
                      result.missingClauses.forEach((clause, i) => {
                        lines.push(`  ${i + 1}. [${clause.importance.toUpperCase()}] ${clause.name}`);
                        lines.push(`     ${clause.description}`);
                        lines.push(`     Suggested Language: ${clause.suggestedLanguage}`);
                        lines.push('');
                      });
                    }
                    if (result.greenFlags.length > 0) {
                      lines.push(`--- GREEN FLAGS (${result.greenFlags.length}) ---`);
                      result.greenFlags.forEach((flag, i) => {
                        lines.push(`  ${i + 1}. ${flag.clause}: ${flag.benefit}`);
                      });
                      lines.push('');
                    }
                    if (result.aiInsights) {
                      lines.push('--- AI INSIGHTS ---');
                      lines.push(result.aiInsights);
                      lines.push('');
                    }
                    lines.push('--- SUMMARY ---');
                    lines.push(result.summary);
                    lines.push('');
                    lines.push('========================================');
                    lines.push('  Generated by DEALWISE');
                    lines.push('========================================');
                    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dealwise-report.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  <FileDown className="h-4 w-4" />
                  Download .txt
                </button>

                <button
                  onClick={() => {
                    import('@/lib/export-docx').then(m => m.exportAnalysisDOCX(result, currencySymbol));
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4" />
                  Export Word
                </button>

                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  {reportCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600">Report Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Report
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  {shareCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share Link
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    // Save current contract + result to localStorage for chat page
                    localStorage.setItem('dealwise_chat_context', JSON.stringify({
                      contractText: contractText,
                      result: result,
                      date: new Date().toISOString()
                    }));
                    router.push('/chat');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat About This Contract
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch('/api/generate-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        redFlags: result.redFlags,
                        missingClauses: result.missingClauses,
                        contractType: result.contractType,
                      }),
                    });
                    const data = await res.json();
                    setNegotiationEmail(data.email);
                    setShowEmailModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4" />
                  Generate Negotiation Email
                </button>

                <button
                  onClick={() => setShowBadge(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  <Award className="h-4 w-4" />
                  Get Score Badge
                </button>
              </motion.div>

              {/* Review prompt for authenticated users after analysis */}
              <div className="mt-6">
                <ReviewPrompt show={showReview && !!result} onClose={() => setShowReview(false)} />
              </div>

              {/* Signup prompt for unauthenticated users after analysis */}
              {showSignupPrompt && status === "unauthenticated" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Save your analysis &amp; unlock all features</h3>
                  <p className="mt-1 text-sm text-gray-600">Create a free account to save results, access AI chat, templates, and more.</p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/analyze'))}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                    >
                      Create Free Account
                    </button>
                    <button
                      onClick={() => setShowSignupPrompt(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:bg-gray-100"
                    >
                      Maybe Later
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Negotiation Email Modal */}
              {showEmailModal && negotiationEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowEmailModal(false)}>
                  <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-xl p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Negotiation Email</h3>
                      <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Copy this email and send it to your client. Edit the [brackets] with your details.</p>
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
                      {negotiationEmail}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => { navigator.clipboard.writeText(negotiationEmail); }} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        <Copy className="h-4 w-4" /> Copy Email
                      </button>
                      <button onClick={() => setShowEmailModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">Close</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Score Badge Modal */}
              {showBadge && result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowBadge(false)}>
                  <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                    {/* The badge card — designed for screenshots */}
                    <div id="score-badge" className="rounded-2xl bg-white border border-gray-200 shadow-xl p-8 text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M14 2L4 7V14C4 20 8.3 25.7 14 27C19.7 25.7 24 20 24 14V7L14 2Z" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5"/></svg>
                        <span className="text-lg font-semibold text-gray-900">dealwise</span>
                      </div>
                      <div className="text-6xl font-bold mb-2" style={{ color: result.overallScore >= 65 ? '#059669' : result.overallScore >= 35 ? '#D97706' : '#DC2626' }}>
                        {result.overallScore}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">Contract Score out of 100</p>
                      <div className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
                        result.recommendation === 'sign' ? 'bg-emerald-50 text-emerald-700' :
                        result.recommendation === 'negotiate' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {result.recommendation === 'sign' ? 'SAFE TO SIGN' : result.recommendation === 'negotiate' ? 'NEGOTIATE FIRST' : 'WALK AWAY'}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                        Analyzed by dealwise.app &middot; {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3 justify-center">
                      <button onClick={() => { navigator.clipboard.writeText(`My contract scored ${result.overallScore}/100 on dealwise.app — ${result.recommendation === 'sign' ? 'Safe to sign!' : result.recommendation === 'negotiate' ? 'Needs negotiation' : 'Walking away'}`); }} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Copy Text</button>
                      <button onClick={() => setShowBadge(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
