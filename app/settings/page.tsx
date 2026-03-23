'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe,
  DollarSign,
  Sparkles,
  Trash2,
  Check,
  CreditCard,
  Users,
  UserPlus,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getSettings, saveSettings, type Settings } from '@/lib/settings';
import { clearHistory } from '@/lib/auth';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmModal from '@/components/ConfirmModal';
import { useCredits } from '@/components/CreditsProvider';
import { CURRENCIES, COUNTRIES } from '@/lib/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};


export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [keySaved, setKeySaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { credits, plan } = useCredits();

  // Team state
  const [teamName, setTeamName] = useState('');
  const [teamLoading, setTeamLoading] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<{ id: string; name: string; owner_email: string } | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; email: string; role: string; accepted: boolean }>>([]);
  const [userTeamRole, setUserTeamRole] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamMessage, setTeamMessage] = useState('');

  async function loadTeams() {
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) return;
      const data = await res.json();
      // Pick the first team (owned or membership)
      const owned = data.ownedTeams?.[0];
      const membership = data.memberships?.[0];
      const team = owned || membership?.teams;
      if (team) {
        setCurrentTeam(team);
        loadMembers(team.id);
      }
    } catch {}
  }

  async function loadMembers(teamId: string) {
    try {
      const res = await fetch(`/api/teams/members?teamId=${teamId}`);
      if (!res.ok) return;
      const data = await res.json();
      setTeamMembers(data.members || []);
      setUserTeamRole(data.userRole || '');
    } catch {}
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setTeamLoading(true);
    setTeamMessage('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentTeam(data.team);
        setTeamName('');
        loadMembers(data.team.id);
        setTeamMessage('Team created!');
      } else {
        setTeamMessage('Failed to create team.');
      }
    } catch {
      setTeamMessage('Failed to create team.');
    }
    setTeamLoading(false);
  }

  async function handleInviteMember() {
    if (!inviteEmail.trim() || !currentTeam) return;
    setTeamLoading(true);
    setTeamMessage('');
    try {
      const res = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: currentTeam.id, email: inviteEmail.trim() }),
      });
      if (res.ok) {
        setInviteEmail('');
        loadMembers(currentTeam.id);
        setTeamMessage('Invitation sent!');
      } else {
        const err = await res.json();
        setTeamMessage(err.error || 'Failed to invite.');
      }
    } catch {
      setTeamMessage('Failed to invite member.');
    }
    setTeamLoading(false);
  }

  async function handleRemoveMember(email: string) {
    if (!currentTeam) return;
    try {
      await fetch('/api/teams/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: currentTeam.id, email }),
      });
      loadMembers(currentTeam.id);
    } catch {}
  }

  useEffect(() => {
    setSettings(getSettings());
    loadTeams();
  }, []);

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    const updated = saveSettings({ [key]: value });
    setSettings(updated);
  }

  function handleClearHistory() {
    setShowClearConfirm(true);
  }

  function handleClearHistoryConfirm() {
    setShowClearConfirm(false);
    clearHistory(session?.user?.email ?? undefined);
  }

  if (!settings) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-dvh bg-white">
      <Nav />
      <div className="relative mx-auto max-w-4xl px-6 py-10">

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={fadeUp}>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Settings</h1>
            <p className="mt-2 text-gray-600">Customize your DEALWISE experience.</p>
          </motion.div>

          {/* -- Team (moved to top for visibility) -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">Team</h2>
            </div>

            {!currentTeam ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">Create a team to collaborate on contract analyses with your colleagues.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Team name"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    onClick={handleCreateTeam}
                    disabled={teamLoading || !teamName.trim()}
                    className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Create Team
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs font-medium text-gray-400">Team Name</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{currentTeam.name}</p>
                </div>

                {['owner', 'admin'].includes(userTeamRole) && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      <UserPlus className="mr-1 inline h-3 w-3" />
                      Invite Member
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="member@example.com"
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        onClick={handleInviteMember}
                        disabled={teamLoading || !inviteEmail.trim()}
                        className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-medium text-gray-600">Members</p>
                  <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-200 overflow-hidden">
                    {teamMembers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">No members yet</div>
                    ) : (
                      teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{member.email}</span>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              member.role === 'owner' ? 'bg-purple-50 text-purple-700' :
                              member.role === 'admin' ? 'bg-indigo-50 text-indigo-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {member.role}
                            </span>
                            {!member.accepted && (
                              <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                pending
                              </span>
                            )}
                          </div>
                          {['owner', 'admin'].includes(userTeamRole) && member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.email)}
                              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Remove member"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {teamMessage && (
              <p className="mt-3 text-xs font-medium text-indigo-600">{teamMessage}</p>
            )}
          </motion.section>



          {/* -- Billing & Plan -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">Billing &amp; Plan</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400">Current Plan</p>
                <div className="mt-1">
                  {plan === 'free' && (
                    <span className="inline-block rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">Free Plan</span>
                  )}
                  {plan === 'pro' && (
                    <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">Pro Plan</span>
                  )}
                  {plan === 'admin' && (
                    <span className="inline-block rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">Admin</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Credits</p>
                <p className="mt-1 text-sm text-gray-900">
                  {plan === 'admin' ? 'Unlimited' : credits !== null ? credits : '...'} credits remaining
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {plan === 'free' && 'Your free plan includes 5 analyses. Upgrade for unlimited access.'}
                  {plan === 'pro' && "You're on a paid plan with monthly analyses."}
                  {plan === 'admin' && 'Unlimited access.'}
                </p>
              </div>
              {plan === 'free' && (
                <Link href="/pricing" className="inline-block text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
                  Upgrade to Pro &rarr;
                </Link>
              )}
              {plan === 'pro' && (
                <Link href="/pricing" className="inline-block text-sm font-medium text-gray-500 transition-colors hover:text-gray-700">
                  Manage Plan &rarr;
                </Link>
              )}
              <p className="text-xs text-gray-400">Billing history will be available once payments launch.</p>
            </div>
          </motion.section>

          {/* -- Default Currency & Country -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">Defaults</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  <DollarSign className="mr-1 inline h-3 w-3" />
                  Default Currency
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  <Globe className="mr-1 inline h-3 w-3" />
                  Default Country
                </label>
                <select
                  value={settings.defaultCountry}
                  onChange={(e) => updateSetting('defaultCountry', e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
          <motion.section variants={fadeUp} className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">Analysis Preferences</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-900">Show AI insights</span>
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
                <span className="text-sm text-gray-900">Show country context</span>
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


          {/* -- Integrations -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">Integrations</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.webhookUrl || ''}
                  onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                  placeholder="https://your-server.com/webhook"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Receive a POST request with analysis results after each contract analysis.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Slack Webhook URL
                </label>
                <input
                  type="url"
                  value={settings.slackWebhookUrl || ''}
                  onChange={(e) => updateSetting('slackWebhookUrl', e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Get Slack notifications when a contract analysis completes.
                </p>
              </div>
              <button
                onClick={() => {
                  saveSettings({
                    webhookUrl: settings.webhookUrl,
                    slackWebhookUrl: settings.slackWebhookUrl,
                  });
                  setKeySaved(true);
                  setTimeout(() => setKeySaved(false), 2000);
                }}
                className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
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
          </motion.section>

          {/* -- Data -- */}
          <motion.section variants={fadeUp} className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h2 className="text-sm font-semibold text-gray-900">Data</h2>
            </div>
            <button
              onClick={handleClearHistory}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Clear Analysis History
            </button>
            <p className="mt-2 text-xs text-gray-400">
              This will remove all locally saved analysis history from your browser.
            </p>
          </motion.section>

        </motion.div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear Analysis History"
        message="Are you sure? This will delete all your analysis history. This action cannot be undone."
        confirmText="Clear History"
        danger
        onConfirm={handleClearHistoryConfirm}
        onCancel={() => setShowClearConfirm(false)}
      />
      </div>
    </ProtectedRoute>
  );
}
