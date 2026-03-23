'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CreditsState {
  credits: number | null;
  plan: string | null;
  loading: boolean;
  refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsState>({
  credits: null,
  plan: null,
  loading: false,
  refreshCredits: async () => {},
});

const CACHE_KEY = 'dealwise_credits';
const STALE_MS = 5 * 60 * 1000; // 5 minutes

function readCache(): { credits: number; plan: string; ts: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(credits: number, plan: string) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ credits, plan, ts: Date.now() }));
  } catch {}
}

function clearCache() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/credits');
      if (!res.ok) return;
      const data = await res.json();
      setCredits(data.credits);
      setPlan(data.plan);
      writeCache(data.credits, data.plan);
    } catch {}
  }, []);

  const refreshCredits = useCallback(async () => {
    await fetchCredits();
  }, [fetchCredits]);

  // On login: read cache immediately (no flicker), then background fetch if stale
  useEffect(() => {
    if (status === 'loading') return;

    if (!isLoggedIn) {
      setCredits(null);
      setPlan(null);
      clearCache();
      return;
    }

    // Read from cache instantly
    const cached = readCache();
    if (cached) {
      setCredits(cached.credits);
      setPlan(cached.plan);

      // If stale, refetch in background
      if (Date.now() - cached.ts > STALE_MS) {
        fetchCredits();
      }
    } else {
      // No cache — fetch (show loading briefly only on first load)
      setLoading(true);
      fetchCredits().finally(() => setLoading(false));
    }
  }, [isLoggedIn, status, fetchCredits]);

  return (
    <CreditsContext.Provider value={{ credits, plan, loading, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
