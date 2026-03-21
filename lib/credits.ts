import { supabase } from './supabase';

export interface UserCredits {
  email: string;
  credits: number;
  totalUsed: number;
  plan: 'free' | 'pro' | 'admin';
  createdAt: string;
  lastUsedAt?: string;
}

// Credit costs per action
export const CREDIT_COSTS = {
  analyze: 1,      // 1 credit per analysis
  aiAnalyze: 2,    // 2 credits if AI enhancement used
  chat: 1,         // 1 credit per chat message
  compare: 2,      // 2 credits per comparison (2 analyses)
  bulk: 1,         // 1 credit per file in bulk
  pdfExport: 0,    // free
} as const;

export const DEFAULT_CREDITS = 50;

interface CreditRow {
  email: string;
  credits: number;
  total_used: number;
  plan: 'free' | 'pro' | 'admin';
  created_at: string;
  last_used_at: string | null;
}

function rowToUserCredits(row: CreditRow): UserCredits {
  return {
    email: row.email,
    credits: row.credits,
    totalUsed: row.total_used,
    plan: row.plan,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at || undefined,
  };
}

async function ensureUser(email: string): Promise<void> {
  const { data } = await supabase
    .from('credits')
    .select('email')
    .eq('email', email)
    .single();

  if (!data) {
    await supabase.from('credits').insert({
      email,
      credits: DEFAULT_CREDITS,
      total_used: 0,
      plan: 'free',
      created_at: new Date().toISOString(),
    });
  }
}

export async function getUserCredits(email: string): Promise<UserCredits> {
  await ensureUser(email);
  const { data: row } = await supabase
    .from('credits')
    .select('*')
    .eq('email', email)
    .single();

  return rowToUserCredits(row as CreditRow);
}

export async function deductCredits(email: string, amount: number): Promise<{ success: boolean; remaining: number; error?: string }> {
  await ensureUser(email);
  const { data: row } = await supabase
    .from('credits')
    .select('*')
    .eq('email', email)
    .single();

  const credit = row as CreditRow;

  if (credit.plan === 'admin') {
    // Admins have unlimited credits
    await supabase
      .from('credits')
      .update({
        total_used: credit.total_used + amount,
        last_used_at: new Date().toISOString(),
      })
      .eq('email', email);
    return { success: true, remaining: 999999 };
  }

  if (credit.credits < amount) {
    return { success: false, remaining: credit.credits, error: `Not enough credits. You have ${credit.credits}, need ${amount}.` };
  }

  await supabase
    .from('credits')
    .update({
      credits: credit.credits - amount,
      total_used: credit.total_used + amount,
      last_used_at: new Date().toISOString(),
    })
    .eq('email', email);

  return { success: true, remaining: credit.credits - amount };
}

export async function addCredits(email: string, amount: number): Promise<UserCredits> {
  await ensureUser(email);
  const { data: row } = await supabase
    .from('credits')
    .select('credits')
    .eq('email', email)
    .single();

  await supabase
    .from('credits')
    .update({ credits: (row as { credits: number }).credits + amount })
    .eq('email', email);

  return getUserCredits(email);
}

export async function setUserPlan(email: string, plan: 'free' | 'pro' | 'admin'): Promise<UserCredits> {
  await ensureUser(email);
  await supabase
    .from('credits')
    .update({ plan })
    .eq('email', email);

  return getUserCredits(email);
}

export async function getAllUsers(): Promise<UserCredits[]> {
  const { data: rows } = await supabase.from('credits').select('*');
  return (rows as CreditRow[] || []).map(rowToUserCredits);
}

export async function deleteUser(email: string): Promise<boolean> {
  const { error } = await supabase
    .from('credits')
    .delete()
    .eq('email', email);

  return !error;
}

export async function isAdmin(email: string): Promise<boolean> {
  const user = await getUserCredits(email);
  return user.plan === 'admin';
}
