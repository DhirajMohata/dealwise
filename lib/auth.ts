'use client';

// ---------------------------------------------------------------------------
// Types (kept for backward compatibility with localStorage history)
// ---------------------------------------------------------------------------

export interface User {
  name: string;
  email: string;
  createdAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// localStorage helpers (kept for backward compatibility)
// ---------------------------------------------------------------------------

const USER_KEY = 'dealwise_user';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function storeUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------------
// History helpers
// ---------------------------------------------------------------------------

export interface HistoryEntry {
  id: string;
  date: string; // ISO
  overallScore: number;
  recommendation: 'sign' | 'negotiate' | 'walk_away';
  summary: string;
  contractSnippet: string; // first ~80 chars
  currency: string;
  nominalHourlyRate: number;
  effectiveHourlyRate: number;
  rateReduction: number;
  // full result stored for re-viewing
  fullResult: string; // JSON stringified AnalysisResult
}

const HISTORY_KEY = 'dealwise_history';

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry) {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  // prepend new entry (newest first)
  history.unshift(entry);
  // keep max 50 entries
  if (history.length > 50) history.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function removeHistoryEntry(id: string) {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const filtered = history.filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}
