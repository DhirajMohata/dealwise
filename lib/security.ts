import { supabase } from './supabase';

// Input sanitization
export function sanitizeInput(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests = 10,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Persistent rate limiter backed by Supabase
export async function checkRateLimitPersistent(
  ip: string,
  endpoint: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<boolean> {
  const key = `${ip}:${endpoint}`;

  const { data } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('id', key)
    .single();

  if (!data || new Date(data.window_start).getTime() < Date.now() - windowMs) {
    await supabase.from('rate_limits').upsert({ id: key, count: 1, window_start: new Date().toISOString() });
    return true;
  }

  if (data.count >= maxRequests) return false;

  await supabase.from('rate_limits').update({ count: data.count + 1 }).eq('id', key);
  return true;
}
