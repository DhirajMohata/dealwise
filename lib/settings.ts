export interface Settings {
  defaultCurrency: string;
  defaultCountry: string;
  savedApiKey: string;
  showAiInsights: boolean;
  showCountryContext: boolean;
  webhookUrl?: string;
  slackWebhookUrl?: string;
}

const DEFAULTS: Settings = {
  defaultCurrency: 'USD',
  defaultCountry: '',
  savedApiKey: '',
  showAiInsights: true,
  showCountryContext: true,
  webhookUrl: '',
  slackWebhookUrl: '',
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem('dealwise-settings');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: Partial<Settings>): Settings {
  const current = getSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem('dealwise-settings', JSON.stringify(merged));
  return merged;
}
