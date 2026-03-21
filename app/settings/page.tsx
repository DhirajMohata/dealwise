'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Key,
  Globe,
  DollarSign,
  Sparkles,
  Trash2,
  Info,
  Check,
  Eye,
  EyeOff,
  CreditCard,
} from 'lucide-react';
import { getSettings, saveSettings, type Settings } from '@/lib/settings';
import { clearHistory } from '@/lib/auth';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CURRENCIES, COUNTRIES } from '@/lib/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

interface CreditData {
  credits: number;
  totalUsed: number;
  plan: 'free' | 'pro' | 'admin';
}

const CREDIT_COSTS_TABLE = [
  { action: 'Contract Analysis', cost: '1 credit' },
  { action: 'AI-Enhanced Analysis', cost: '2 credits' },
  { action: 'Chat Message', cost: '1 credit' },
  { action: 'Contract Comparison', cost: '2 credits' },
  { action: 'Bulk Analysis (per file)', cost: '1 credit' },
  { action: 'PDF Export', cost: 'Free' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [creditData, setCreditData] = useState<CreditData | null>(null);

  useEffect(() => {
    setSettings(getSettings());
    fetch('/api/credits')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setCreditData({ credits: data.credits, totalUsed: data.totalUsed, plan: data.plan });
      })
      .catch(() => {});
  }, []);

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    const updated = saveSettings({ [key]: value });
    setSettings(updated);
  }

  function handleApiKeySave(key: string) {
    updateSetting('savedApiKey', key);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  function handleClearHistory() {
    if (window.confirm('Are you sure? This will delete all your analysis history.')) {
      clearHistory();
      alert('Analysis history cleared.');
    }
  }

  if (!settings) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAFBFE]">
      <Nav />
      <div className="relative mx-auto max-w-2xl px-6 py-20">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={fadeUp}>
            <h1 className="text-3xl font-bold text-[#111827]">Settings</h1>
            <p className="mt-2 text-[#4B5563]">Customize your DEALWISE experience.</p>
          </motion.div>

          {/* -- AI API Key -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Key className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-[#111827]">AI API Key</h2>
            </div>
            <p className="mb-4 text-xs text-[#4B5563]">
              Save your Claude/Anthropic API key so you don&apos;t need to re-enter it every time.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.savedApiKey}
                  onChange={(e) => updateSetting('savedApiKey', e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 pr-10 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={() => handleApiKeySave(settings.savedApiKey)}
                className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                {keySaved ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" /> Saved
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <Info className="h-3 w-3" />
              Key saved securely in your browser. Never sent to our servers.
            </p>
          </motion.section>

          {/* -- Credits -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-[#111827]">Credits</h2>
            </div>
            {creditData ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFBFE] p-4">
                    <p className="text-xs font-medium text-[#9CA3AF]">Current Balance</p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">
                      {creditData.plan === 'admin' ? 'Unlimited' : creditData.credits}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFBFE] p-4">
                    <p className="text-xs font-medium text-[#9CA3AF]">Total Used</p>
                    <p className="mt-1 text-2xl font-bold text-[#111827]">{creditData.totalUsed}</p>
                  </div>
                  <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFBFE] p-4">
                    <p className="text-xs font-medium text-[#9CA3AF]">Plan</p>
                    <p className="mt-1 text-2xl font-bold capitalize text-[#111827]">{creditData.plan}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-[#4B5563]">Credit Costs</p>
                  <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {CREDIT_COSTS_TABLE.map((row) => (
                          <tr key={row.action}>
                            <td className="px-4 py-2.5 text-sm text-[#111827]">{row.action}</td>
                            <td className="px-4 py-2.5 text-right text-sm font-medium text-[#4B5563]">{row.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#9CA3AF]">Loading credit information...</p>
            )}
          </motion.section>

          {/* -- Default Currency & Country -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-[#111827]">Defaults</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#4B5563]">
                  <DollarSign className="mr-1 inline h-3 w-3" />
                  Default Currency
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#4B5563]">
                  <Globe className="mr-1 inline h-3 w-3" />
                  Default Country
                </label>
                <select
                  value={settings.defaultCountry}
                  onChange={(e) => updateSetting('defaultCountry', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.section>

          {/* -- Analysis Preferences -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-[#111827]">Analysis Preferences</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-[#111827]">Show AI insights</span>
                <button
                  onClick={() => updateSetting('showAiInsights', !settings.showAiInsights)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.showAiInsights ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      settings.showAiInsights ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-[#111827]">Show country context</span>
                <button
                  onClick={() => updateSetting('showCountryContext', !settings.showCountryContext)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.showCountryContext ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      settings.showCountryContext ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>
          </motion.section>

          {/* -- Data -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h2 className="text-sm font-semibold text-[#111827]">Data</h2>
            </div>
            <button
              onClick={handleClearHistory}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Clear Analysis History
            </button>
            <p className="mt-2 text-xs text-[#9CA3AF]">
              This will remove all locally saved analysis history from your browser.
            </p>
          </motion.section>

          {/* -- About -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Info className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-[#111827]">About</h2>
            </div>
            <div className="space-y-2 text-sm text-[#4B5563]">
              <p>
                <span className="font-medium text-[#111827]">DEALWISE</span> v0.1.0
              </p>
              <p>
                Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.
              </p>
              <p>
                AI analysis powered by Anthropic Claude.
              </p>
              <Link
                href="/"
                className="mt-2 inline-block text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Visit landing page &rarr;
              </Link>
            </div>
          </motion.section>
        </motion.div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
