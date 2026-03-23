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
  fullResult: string; // JSON stringified AnalysisResult (includes contractText)
  contractHash?: string; // fingerprint for version matching
}

/**
 * Generate a SHA-256 fingerprint of the FULL contract text for version matching.
 * Same contract text = same hash. Even a one-character change = completely different hash.
 * Uses Web Crypto API (available in browser, Node.js 18+, and Vercel Edge Runtime).
 */
export async function contractHash(text: string): Promise<string> {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getHistoryKey(email?: string): string {
  return email ? `dealwise_history_${email}` : 'dealwise_history_anon';
}

export function getHistory(email?: string): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getHistoryKey(email));
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry, email?: string) {
  if (typeof window === 'undefined') return;
  const key = getHistoryKey(email);
  const history = getHistory(email);
  // prepend new entry (newest first)
  history.unshift(entry);
  // keep max 50 entries
  if (history.length > 50) history.length = 50;
  localStorage.setItem(key, JSON.stringify(history));
}

export function removeHistoryEntry(id: string, email?: string) {
  if (typeof window === 'undefined') return;
  const key = getHistoryKey(email);
  const history = getHistory(email);
  const filtered = history.filter((h) => h.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function clearHistory(email?: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getHistoryKey(email));
}
