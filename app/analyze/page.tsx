'use client';

declare global { interface Window { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } } }

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  GitBranch,
  Copy,
  Check,
  Loader2,
  Sparkles,
  RefreshCw,
  Share2,
  FileDown,
  Upload,
  FileText,
  X,
  Eye,
  Brain,
  MessageSquare,
  Highlighter,
  Mail,
  Award,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { useCredits } from '@/components/CreditsProvider';
import HistoryPanel from '@/components/HistoryPanel';
import ReviewPrompt from '@/components/ReviewPrompt';
import OnboardingBanner from '@/components/OnboardingBanner';
import ErrorFallback from '@/components/ErrorFallback';
import ProtectedRoute from '@/components/ProtectedRoute';
import UpgradeModal from '@/components/UpgradeModal';
import { addHistoryEntry, contractHash } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import type { AnalysisResult } from '@/lib/analyzer';
import { extractMetadataFromText, type ContractMetadata } from '@/lib/extract-metadata';
import { CURRENCIES } from '@/lib/constants';
import { formatFileSize } from '@/lib/analyze-helpers';
// export-pdf is imported dynamically to avoid SSR issues with jspdf

/* -- Extracted sub-components -- */
import OverviewTab from '@/components/analyze/OverviewTab';
import RedFlagsTab from '@/components/analyze/RedFlagsTab';
import MissingGoodTab from '@/components/analyze/MissingGoodTab';
import AIAnalysisTab from '@/components/analyze/AIAnalysisTab';
import AnnotatedTab from '@/components/analyze/AnnotatedTab';
import VersionsTab from '@/components/analyze/VersionsTab';

/* ------------------------------------------------------------------ */
/*  (Style constants, helpers, ScoreCircle, CopyButton, SectionHeader  */
/*   have been extracted to lib/analyze-helpers.ts and                  */
/*   components/analyze/*.tsx)                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function AnalyzePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { refreshCredits } = useCredits();

  /* ---------- form state ---------- */
  const [contractText, setContractText] = useState('');
  const [currency, setCurrency] = useState('USD');

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

  /* ---------- version history ---------- */
  const [versions, setVersions] = useState<Array<{id: string; score: number; rec: string; date: string}>>([]);

  /* ---------- tabbed results ---------- */
  const [activeTab, setActiveTab] = useState<string>('overview');

  /* ---------- upgrade modal state ---------- */
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissedNudge, setDismissedNudge] = useState(false);

  /* ---------- killer feature states ---------- */
  const [negotiationEmail, setNegotiationEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [simRevisions, setSimRevisions] = useState(0);
  const [simPayDelay, setSimPayDelay] = useState(0);
  const [simScopeCreep, setSimScopeCreep] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '$';

  /* ---------- "What If" simulator computed values ---------- */
  const baseHours = 80;
  const basePrice = (result?.nominalHourlyRate || 0) * baseHours;
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
        // Restore contractText if it was stored in the fullResult
        if (parsed.contractText) {
          setContractText(parsed.contractText);
        }
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
    if (settings.defaultCurrency) setCurrency(settings.defaultCurrency);

    // Version history loaded separately in its own useEffect (depends on result)
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

  /* ---------- Load versions for the CURRENT contract ---------- */
  useEffect(() => {
    if (!result) { setVersions([]); return; }
    const currentText = contractText || ((result as unknown as Record<string, unknown>).contractText as string) || '';
    if (!currentText) { setVersions([]); return; }

    const hash = contractHash(currentText);

    fetch(`/api/history?hash=${encodeURIComponent(hash)}`)
      .then(r => r.ok ? r.json() : { versions: [] })
      .then(data => {
        setVersions((data.versions || []).map((v: { id: string; overall_score: number; recommendation: string; created_at: string }) => ({
          id: v.id,
          score: v.overall_score,
          rec: v.recommendation,
          date: v.created_at,
        })));
      })
      .catch(() => setVersions([]));
  }, [result, contractText]);

  /* ---------- keyboard shortcut: Cmd/Ctrl + Enter to submit (FIX 5) ---------- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading && !result && contractText.trim()) {
          handleAnalyze(contractText);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, result, contractText]);

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
    const sampleText = `FREELANCE SERVICE AGREEMENT

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
Both parties agree to maintain confidentiality of proprietary information shared during the project.`;
    setContractText(sampleText);
    setCurrency('USD');
    setErrors({});
    // Auto-submit the sample
    handleAnalyze(sampleText);
  }

  /* ---------- auto-analyze (zero-form) ---------- */
  async function handleAnalyze(text: string) {
    if (!text.trim()) {
      setErrors({ contractText: 'Contract text is required' });
      return;
    }

    setError('');
    setErrors({});
    setLoading(true);
    setAnalysisStartTime(Date.now());
    setElapsedSeconds(0);

    try {
      const currentSettings = getSettings();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: text,
          currency,
          webhookUrl: currentSettings.webhookUrl || undefined,
          slackWebhookUrl: currentSettings.slackWebhookUrl || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 402) {
          setShowUpgradeModal(true);
          setUserCredits(body?.creditsRemaining ?? 0);
          throw new Error(body?.error ?? 'No credits remaining.');
        }
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      // Update credits from response
      if (data.creditsRemaining !== undefined) {
        setUserCredits(data.creditsRemaining);
      }
      setResult(data as AnalysisResult);
      refreshCredits();

      // Track analysis event with PostHog
      if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('analysis_completed', {
          score: data.overallScore,
          recommendation: data.recommendation,
          contractType: data.contractType,
          redFlags: data.redFlags?.length,
        });
      }

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

      // Generate a single ID for both localStorage and server saves
      const analysisId = crypto.randomUUID();

      // Save to history (localStorage)
      addHistoryEntry({
        id: analysisId,
        date: new Date().toISOString(),
        overallScore: data.overallScore,
        recommendation: data.recommendation,
        summary: data.summary,
        contractSnippet: text.slice(0, 80).replace(/\s+/g, ' ').trim(),
        currency,
        nominalHourlyRate: data.nominalHourlyRate,
        effectiveHourlyRate: data.effectiveHourlyRate,
        rateReduction: data.rateReduction,
        fullResult: JSON.stringify({ ...data, contractText: text }),
        contractHash: contractHash(text),
      }, session?.user?.email ?? undefined);

      // Save to server if authenticated
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: analysisId,
          contractSnippet: text.slice(0, 200),
          overallScore: data.overallScore,
          recommendation: data.recommendation,
          nominalRate: data.nominalHourlyRate,
          effectiveRate: data.effectiveHourlyRate,
          rateReduction: data.rateReduction,
          currency,
          contractType: data.contractType,
          fullResult: JSON.stringify({ ...data, contractText: text }),
          contractHash: contractHash(text),
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

      // Set currency if detected
      if (metadata.detectedCurrency) setCurrency(metadata.detectedCurrency);

      // Show what was auto-detected
      setAutoDetected(metadata);

      // AUTO-SUBMIT: analyze immediately after file upload
      handleAnalyze(data.text);
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
    // Restore contractText if stored in result
    const resultAny = historicalResult as unknown as Record<string, unknown>;
    if (resultAny.contractText) {
      setContractText(resultAny.contractText as string);
    }
    if (resultAny.currency) {
      setCurrency(resultAny.currency as string);
    }
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  return (
    <ProtectedRoute>
    <div className={`bg-white ${result ? 'h-dvh overflow-hidden flex flex-col' : 'min-h-screen'}`}>
      <Nav />
      <HistoryPanel onSelectResult={handleLoadFromHistory} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* Input form: constrained width */}
      {!result && (
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* ====================================================== */}
          {/*  STATE 1 — ZERO-FORM INPUT                               */}
          {/* ====================================================== */}
          {!result && !loading && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Page header */}
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                  Analyze Your Contract
                </h1>
                <p className="mt-2 max-w-2xl text-gray-400">
                  Upload a PDF or paste your contract text. We&apos;ll analyze everything automatically.
                </p>
              </div>

              {/* Onboarding banner for first-time users */}
              <OnboardingBanner />

              <div className="space-y-8">
                {/* ---- Upload Zone ---- */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
                  {/* Upload error */}
                  {uploadError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                      {uploadError}
                    </div>
                  )}

                  {/* File Upload Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all ${
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
                        <Upload className={`h-10 w-10 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <div className="text-center">
                          <p className={`text-base font-medium ${isDragging ? 'text-indigo-600' : 'text-gray-600'}`}>
                            Upload PDF, DOCX, or TXT
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            Drag and drop or click to browse (max 5MB)
                          </p>
                          <p className="mt-2 text-xs text-indigo-500 font-medium">
                            Analysis starts automatically after upload
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative my-6 flex items-center">
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
                  {errors.contractText && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.contractText}</p>
                  )}

                  {/* Analyze button for paste mode */}
                  <button
                    type="button"
                    disabled={loading || !contractText.trim()}
                    onClick={() => handleAnalyze(contractText)}
                    className="group relative mt-4 w-full cursor-pointer overflow-hidden rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Analyze Contract
                      <kbd className="ml-2 hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-normal text-white/60 sm:inline-block" suppressHydrationWarning>
                        {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}+{'\u21B5'}
                      </kbd>
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
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

                {/* Credit Info */}
                {status === 'authenticated' && userCredits !== null && userPlan !== 'admin' && (
                  <div className={`rounded-lg border p-3 text-sm ${userCredits < 5 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Each analysis uses <span className="font-medium text-gray-900">1 credit</span>
                      </span>
                      <span className="text-gray-600">
                        Balance: <span className="font-medium text-gray-900">{userCredits}</span>
                      </span>
                    </div>
                    {userCredits === 0 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        No credits remaining.{' '}
                        <Link href="/pricing" className="underline font-medium hover:text-red-700">Upgrade to keep analyzing &rarr;</Link>
                      </p>
                    )}
                    {userCredits >= 1 && userCredits <= 2 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Running low!{' '}
                        <Link href="/pricing" className="underline font-medium hover:text-amber-700">Upgrade to Freelancer &rarr;</Link>
                      </p>
                    )}
                    {userCredits >= 3 && userCredits <= 4 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Running low on credits.
                      </p>
                    )}
                  </div>
                )}

                {/* Try with a sample contract */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={fillSample}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try with a sample contract
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====================================================== */}
          {/*  STATE 1.5 — LOADING                                     */}
          {/* ====================================================== */}
          {!result && loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="py-20"
            >
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                <p className="mt-6 text-lg font-semibold text-gray-900">Analyzing your contract...</p>
                <p className="mt-2 text-sm text-gray-400">
                  {elapsedSeconds < 5
                    ? 'Scanning for red flags and hidden costs...'
                    : elapsedSeconds < 15
                    ? 'Running AI-powered deep analysis...'
                    : elapsedSeconds < 30
                    ? 'Checking legal clauses and compliance...'
                    : 'Almost done, finalizing your report...'}
                </p>
                <p className="mt-4 text-xs text-gray-300">{elapsedSeconds}s elapsed</p>

                {uploadedFile && (
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-xs text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    {uploadedFile.name}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* ====================================================== */}
      {/*  STATE 2 — RESULTS DASHBOARD (full-width, fixed height) */}
      {/* ====================================================== */}
      {result && (
        <motion.div
          key="results"
          ref={resultsRef}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-1 flex-col min-h-0"
        >
              {/* ---- TOP BAR: Score + Info + Actions ---- */}
              <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3">
                  {/* Left: Score + Summary */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Score badge */}
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-bold text-lg ${
                      result.overallScore >= 65 ? 'bg-emerald-50 text-emerald-700' :
                      result.overallScore >= 35 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {result.overallScore}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-base font-semibold text-gray-900 truncate">Analysis Results</h1>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          result.recommendation === 'sign' ? 'bg-emerald-50 text-emerald-700' :
                          result.recommendation === 'negotiate' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {result.recommendation === 'sign' ? 'Safe to Sign' : result.recommendation === 'negotiate' ? 'Negotiate' : 'Walk Away'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {result.redFlags.length} red flag{result.redFlags.length !== 1 ? 's' : ''}
                        {result.missingClauses.length > 0 && ` · ${result.missingClauses.length} missing`}
                        {result.greenFlags.length > 0 && ` · ${result.greenFlags.length} good`}
                        {result.contractType && result.contractType !== 'unknown' && ` · ${result.contractType}`}
                        {result.nominalHourlyRate > 0 && ` · ${currencySymbol}${result.nominalHourlyRate.toFixed(0)}/hr`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action buttons */}
                  <div className="flex sm:hidden items-center gap-1">
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/generate-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ redFlags: result.redFlags, missingClauses: result.missingClauses, contractType: result.contractType }),
                        });
                        const data = await res.json();
                        setNegotiationEmail(data.email);
                        setShowEmailModal(true);
                      }}
                      className="rounded-lg p-2 text-gray-500"
                      title="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => { try { const { exportAnalysisPDF } = await import('@/lib/export-pdf'); await exportAnalysisPDF(result, currencySymbol); } catch(e) { console.error('PDF export error:', e); alert('PDF export failed. Please try again.'); } }}
                      className="rounded-lg p-2 text-gray-500"
                      title="PDF"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="rounded-lg p-2 text-gray-500"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/generate-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ redFlags: result.redFlags, missingClauses: result.missingClauses, contractType: result.contractType }),
                        });
                        const data = await res.json();
                        setNegotiationEmail(data.email);
                        setShowEmailModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Negotiation Email</span>
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('dealwise_chat_context', JSON.stringify({ contractText, result, date: new Date().toISOString() }));
                        router.push('/chat');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Chat</span>
                    </button>
                    <div className="h-5 w-px bg-gray-200" />
                    <button
                      onClick={async () => { try { const { exportAnalysisPDF } = await import('@/lib/export-pdf'); await exportAnalysisPDF(result, currencySymbol); } catch(e) { console.error('PDF export error:', e); alert('PDF export failed. Please try again.'); } }}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Export PDF"
                    >
                      <FileDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCopyReport}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Copy Report"
                    >
                      {reportCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleShare}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Share"
                    >
                      {shareCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setShowBadge(true)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Score Badge">
                      <Award className="h-4 w-4" />
                    </button>
                    <div className="h-5 w-px bg-gray-200" />
                    <button onClick={handleReset} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">New Analysis</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ---- Mobile horizontal tab bar (OUTSIDE the flex row) ---- */}
              <div className="flex overflow-x-auto border-b border-gray-200 bg-white px-3 md:hidden">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'redflags', label: 'Flags', icon: ShieldAlert, count: result.redFlags.length },
                  { id: 'missing', label: 'Missing', icon: FileWarning, count: result.missingClauses.length },
                  { id: 'ai', label: 'AI', icon: Brain },
                  { id: 'annotated', label: 'Text', icon: Highlighter },
                  { id: 'versions', label: 'History', icon: GitBranch, count: versions.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ---- MAIN: Left Sidebar Tabs + Right Content ---- */}
              <div className="flex flex-1 min-h-0">
                {/* Left sidebar: vertical tabs (desktop only) */}
                <div className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50/50">
                  <div className="flex-1 p-3 space-y-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'redflags', label: 'Red Flags', icon: ShieldAlert, count: result.redFlags.length, color: 'text-red-600' },
                      { id: 'missing', label: 'Missing & Good', icon: FileWarning, count: result.missingClauses.length, color: 'text-orange-600' },
                      { id: 'ai', label: 'AI Analysis', icon: Brain },
                      { id: 'annotated', label: 'Annotated', icon: Highlighter },
                      { id: 'versions', label: 'Versions', icon: GitBranch, count: versions.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                        }`}
                      >
                        <tab.icon className={`h-4 w-4 flex-shrink-0 ${activeTab === tab.id ? 'text-indigo-600' : ''}`} />
                        <span className="flex-1 text-left">{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : `bg-gray-100 ${tab.color || 'text-gray-600'}`
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Sidebar bottom: detected info */}
                  {(result.contractType || result.nominalHourlyRate > 0 || autoDetected?.detectedParties?.client) && (
                    <div className="border-t border-gray-200 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Contract Info</p>
                      <div className="space-y-1.5 text-xs text-gray-600">
                        {autoDetected?.detectedParties?.client && <p className="truncate">Client: <span className="text-gray-900">{autoDetected.detectedParties.client}</span></p>}
                        {autoDetected?.detectedParties?.contractor && <p className="truncate">Contractor: <span className="text-gray-900">{autoDetected.detectedParties.contractor}</span></p>}
                        {result.contractType && result.contractType !== 'unknown' && <p>Type: <span className="text-gray-900 capitalize">{result.contractType}</span></p>}
                        {result.nominalHourlyRate > 0 && <p>Rate: <span className="text-gray-900">{currencySymbol}{result.nominalHourlyRate.toFixed(2)}/hr</span></p>}
                        {result.detectedPrice != null && result.detectedPrice > 0 && <p>Total: <span className="text-gray-900">{currencySymbol}{result.detectedPrice.toLocaleString()}</span></p>}
                        {autoDetected?.detectedPaymentTerms && <p>Payment: <span className="text-gray-900">{autoDetected.detectedPaymentTerms}</span></p>}
                      </div>
                    </div>
                  )}

                  {/* Sidebar bottom: more exports */}
                  <div className="border-t border-gray-200 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Export</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button onClick={async () => { const { exportAnalysisPDF } = await import('@/lib/export-pdf'); await exportAnalysisPDF(result, currencySymbol); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">PDF</button>
                      <button onClick={() => { import('@/lib/export-docx').then(m => m.exportAnalysisDOCX(result, currencySymbol)); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Word</button>
                      <button onClick={() => {
                        if (!result) return;
                        const lines: string[] = ['========================================','  DEALWISE - Contract Analysis Report','========================================','',`Date: ${new Date().toLocaleDateString()}`,'','--- DEAL SCORE ---',`Score: ${result.overallScore}/100`,`Recommendation: ${result.recommendation.toUpperCase().replace('_', ' ')}`,'','--- RATE COMPARISON ---',`Quoted Rate: ${currencySymbol}${result.nominalHourlyRate.toFixed(2)}/hr`,`Effective (Real) Rate: ${currencySymbol}${result.effectiveHourlyRate.toFixed(2)}/hr`,`Rate Reduction: ${result.rateReduction.toFixed(1)}%`,''];
                        if (result.redFlags.length > 0) { lines.push(`--- RED FLAGS (${result.redFlags.length}) ---`); result.redFlags.forEach((flag, i) => { lines.push(`  ${i + 1}. [${flag.severity.toUpperCase()}] ${flag.issue}`); lines.push(`     Clause: "${flag.clause}"`); lines.push(`     Impact: ${flag.impact}`); lines.push(`     Suggestion: ${flag.suggestion}`); lines.push(''); }); }
                        if (result.missingClauses.length > 0) { lines.push(`--- MISSING CLAUSES (${result.missingClauses.length}) ---`); result.missingClauses.forEach((clause, i) => { lines.push(`  ${i + 1}. [${clause.importance.toUpperCase()}] ${clause.name}`); lines.push(`     ${clause.description}`); lines.push(`     Suggested Language: ${clause.suggestedLanguage}`); lines.push(''); }); }
                        if (result.greenFlags.length > 0) { lines.push(`--- GREEN FLAGS (${result.greenFlags.length}) ---`); result.greenFlags.forEach((flag, i) => { lines.push(`  ${i + 1}. ${flag.clause}: ${flag.benefit}`); }); lines.push(''); }
                        if (result.aiInsights) { lines.push('--- AI INSIGHTS ---'); lines.push(result.aiInsights); lines.push(''); }
                        lines.push('--- SUMMARY ---'); lines.push(result.summary); lines.push(''); lines.push('========================================'); lines.push('  Generated by DEALWISE'); lines.push('========================================');
                        const blob = new Blob([lines.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dealwise-report.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                      }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">.txt</button>
                      <button onClick={handleCopyReport} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">{reportCopied ? '✓' : 'Copy'}</button>
                    </div>
                  </div>
                </div>

                {/* Right: scrollable content area */}
                <div className="flex-1 overflow-y-auto pb-16 md:pb-8">
                  <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
                  {/* Mobile-only: Contract info + Export (hidden on desktop where sidebar shows these) */}
                  <div className="mb-4 space-y-3 md:hidden">
                    {/* Contract info badges */}
                    {(result.contractType || result.nominalHourlyRate > 0 || autoDetected?.detectedParties?.client) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {autoDetected?.detectedParties?.client && <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">Client: {autoDetected.detectedParties.client}</span>}
                        {result.contractType && result.contractType !== 'unknown' && <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600 capitalize">{result.contractType}</span>}
                        {result.nominalHourlyRate > 0 && <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">{currencySymbol}{result.nominalHourlyRate.toFixed(0)}/hr</span>}
                        {result.detectedPrice != null && result.detectedPrice > 0 && <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">Total: {currencySymbol}{result.detectedPrice.toLocaleString()}</span>}
                        {autoDetected?.detectedPaymentTerms && <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">{autoDetected.detectedPaymentTerms}</span>}
                      </div>
                    )}
                    {/* Export row */}
                    <div className="flex gap-2">
                      <button onClick={async () => { try { const { exportAnalysisPDF } = await import('@/lib/export-pdf'); await exportAnalysisPDF(result, currencySymbol); } catch(e) { console.error('PDF export error:', e); alert('PDF export failed. Please try again.'); } }} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">PDF</button>
                      <button onClick={() => { import('@/lib/export-docx').then(m => m.exportAnalysisDOCX(result, currencySymbol)); }} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">Word</button>
                      <button onClick={handleCopyReport} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">{reportCopied ? '✓ Copied' : 'Copy'}</button>
                      <button onClick={handleShare} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">{shareCopied ? '✓ Shared' : 'Share'}</button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <OverviewTab
                        result={result}
                        currencySymbol={currencySymbol}
                        simRevisions={simRevisions}
                        setSimRevisions={setSimRevisions}
                        simPayDelay={simPayDelay}
                        setSimPayDelay={setSimPayDelay}
                        simScopeCreep={simScopeCreep}
                        setSimScopeCreep={setSimScopeCreep}
                        simEffectiveRate={simEffectiveRate}
                      />
                    )}
                    {activeTab === 'redflags' && (
                      <RedFlagsTab
                        result={result}
                        currencySymbol={currencySymbol}
                        redFlagFilter={redFlagFilter}
                        setRedFlagFilter={setRedFlagFilter}
                      />
                    )}
                    {activeTab === 'missing' && (
                      <MissingGoodTab
                        result={result}
                        missingClauseFilter={missingClauseFilter}
                        setMissingClauseFilter={setMissingClauseFilter}
                      />
                    )}
                    {activeTab === 'ai' && (
                      <AIAnalysisTab result={result} />
                    )}
                    {activeTab === 'annotated' && (
                      <AnnotatedTab contractText={contractText} redFlags={result.redFlags} />
                    )}
                    {activeTab === 'versions' && (
                      <VersionsTab versions={versions} />
                    )}
                  </AnimatePresence>

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

                  {/* Post-analysis upgrade nudge */}
                  {result && userCredits !== null && userCredits <= 2 && userPlan !== 'admin' && !dismissedNudge && (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-amber-800">
                          You have <span className="font-semibold">{userCredits}</span> {userCredits === 1 ? 'analysis' : 'analyses'} left.{' '}
                          <Link href="/pricing" className="underline font-medium text-amber-900 hover:text-amber-700">
                            Upgrade to Freelancer for 30/month &rarr;
                          </Link>
                        </p>
                        <button
                          onClick={() => setDismissedNudge(true)}
                          className="flex-shrink-0 rounded p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                          aria-label="Dismiss"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              {/* Mobile bottom action bar */}
              <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-4 py-2 md:hidden">
                <div className="flex items-center justify-around">
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
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Generate Negotiation Email"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-[10px]">Email</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('dealwise_chat_context', JSON.stringify({
                        contractText: contractText,
                        result: result,
                        date: new Date().toISOString()
                      }));
                      router.push('/chat');
                    }}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Chat About This Contract"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-[10px]">Chat</span>
                  </button>
                  <button
                    onClick={async () => {
                      const { exportAnalysisPDF } = await import('@/lib/export-pdf');
                      await exportAnalysisPDF(result, currencySymbol);
                    }}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Export PDF"
                  >
                    <FileDown className="h-5 w-5" />
                    <span className="text-[10px]">PDF</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Share Link"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-[10px]">Share</span>
                  </button>
                  <button
                    onClick={() => setShowBadge(true)}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Get Score Badge"
                  >
                    <Award className="h-5 w-5" />
                    <span className="text-[10px]">Badge</span>
                  </button>
                </div>
              </div>

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
    </div>
    </ProtectedRoute>
  );
}
