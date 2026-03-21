import { supabase } from './supabase';

export interface AdminSettings {
  siteName: string;
  supportEmail: string;
  defaultCredits: number;
  anonymousFreeLimit: number;
  maxContractLength: number;
  features: {
    aiAnalysis: boolean;
    chat: boolean;
    bulkAnalysis: boolean;
    compare: boolean;
    templates: boolean;
  };
}

const DEFAULTS: AdminSettings = {
  siteName: 'dealwise',
  supportEmail: 'support@dealwise.app',
  defaultCredits: 50,
  anonymousFreeLimit: 3,
  maxContractLength: 500000,
  features: {
    aiAnalysis: true,
    chat: true,
    bulkAnalysis: true,
    compare: true,
    templates: true,
  },
};

export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const { data: rows, error } = await supabase
      .from('admin_settings')
      .select('key, value');

    if (error || !rows || rows.length === 0) return DEFAULTS;

    const stored: Record<string, string> = {};
    for (const row of rows) {
      stored[row.key] = row.value;
    }

    return {
      siteName: stored.siteName || DEFAULTS.siteName,
      supportEmail: stored.supportEmail || DEFAULTS.supportEmail,
      defaultCredits: stored.defaultCredits ? Number(stored.defaultCredits) : DEFAULTS.defaultCredits,
      anonymousFreeLimit: stored.anonymousFreeLimit ? Number(stored.anonymousFreeLimit) : DEFAULTS.anonymousFreeLimit,
      maxContractLength: stored.maxContractLength ? Number(stored.maxContractLength) : DEFAULTS.maxContractLength,
      features: stored.features ? JSON.parse(stored.features) : DEFAULTS.features,
    };
  } catch { return DEFAULTS; }
}

export async function saveAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  const current = await getAdminSettings();
  const merged = { ...current, ...settings };

  const entries: Array<{ key: string; value: string; updated_at: string }> = [
    { key: 'siteName', value: merged.siteName, updated_at: new Date().toISOString() },
    { key: 'supportEmail', value: merged.supportEmail, updated_at: new Date().toISOString() },
    { key: 'defaultCredits', value: String(merged.defaultCredits), updated_at: new Date().toISOString() },
    { key: 'anonymousFreeLimit', value: String(merged.anonymousFreeLimit), updated_at: new Date().toISOString() },
    { key: 'maxContractLength', value: String(merged.maxContractLength), updated_at: new Date().toISOString() },
    { key: 'features', value: JSON.stringify(merged.features), updated_at: new Date().toISOString() },
  ];

  await supabase.from('admin_settings').upsert(entries, { onConflict: 'key' });

  return merged;
}
