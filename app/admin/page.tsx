'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Users,
  Zap,
  Activity,
  DollarSign,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  Server,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
  X,
  Menu,
  Download,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  HardDrive,
  Globe,
  Mail,
  FileText,
  Hash,
  Loader2,
  MessageSquare,
  Bug,
  Star,
  ChevronUp,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface UserCredits {
  email: string;
  credits: number;
  totalUsed: number;
  plan: 'free' | 'pro' | 'admin';
  createdAt: string;
  lastUsedAt?: string;
}

interface Stats {
  totalUsers: number;
  totalAuthUsers: number;
  totalCreditsUsed: number;
  totalCreditsRemaining: number;
  activeToday: number;
  adminCount: number;
  proCount: number;
  freeCount: number;
  avgCreditsPerUser: number;
  usersWithZeroCredits: number;
  recentSignups: Array<{ name: string; email: string; id: string }>;
}

interface AdminSettings {
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

type TabId = 'overview' | 'users' | 'credits' | 'analytics' | 'settings' | 'system' | 'messages' | 'reports' | 'reviews';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

interface IssueReport {
  id: string;
  description: string;
  page_url: string;
  user_email: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_notes: string;
  created_at: string;
}

interface Review {
  id: string;
  user_email: string;
  user_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

// ── Sidebar Nav Items ──────────────────────────────────────────────────────────

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'credits', label: 'Credits', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: Bug },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'system', label: 'System', icon: Server },
];

// ── Helper: plan badge classes ─────────────────────────────────────────────────

function planBadgeClass(plan: string) {
  switch (plan) {
    case 'admin':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'pro':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data
  const [users, setUsers] = useState<UserCredits[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

  // Users tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'joined' | 'credits' | 'usage' | 'lastActive'>('joined');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 15;

  // Modal states
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkAction, setBulkAction] = useState<'credits' | 'plan'>('credits');
  const [bulkPlan, setBulkPlan] = useState<'free' | 'pro' | 'admin'>('free');

  // Settings tab state
  const [settingsForm, setSettingsForm] = useState<AdminSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Messages tab state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Reports tab state
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Reviews tab state
  const [reviews, setReviews] = useState<Review[]>([]);

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
      setIsAdmin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setAdminSettings(data);
        setSettingsForm(data);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) setMessages(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) setReports(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) setReviews(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUsers();
      fetchStats();
      fetchSettings();
      fetchMessages();
      fetchReports();
      fetchReviews();
    }
  }, [session, fetchUsers, fetchStats, fetchSettings, fetchMessages, fetchReports, fetchReviews]);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleAddCredits() {
    if (!selectedUser || !creditAmount) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addCredits', email: selectedUser, amount: parseInt(creditAmount) }),
      });
      if (!res.ok) throw new Error('Failed to add credits');
      await fetchUsers();
      await fetchStats();
      setShowAddCreditsModal(false);
      setSelectedUser('');
      setCreditAmount('');
      showSuccess(`Added ${creditAmount} credits to ${selectedUser}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credits');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetPlan(email: string, plan: 'free' | 'pro' | 'admin') {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setPlan', email, plan }),
      });
      if (!res.ok) throw new Error('Failed to change plan');
      await fetchUsers();
      await fetchStats();
      showSuccess(`Changed ${email} to ${plan} plan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser(email: string) {
    if (!window.confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', email }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      await fetchUsers();
      await fetchStats();
      setExpandedUser(null);
      showSuccess(`Deleted user ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBulkAddCredits() {
    if (!bulkAmount && bulkAction === 'credits') return;
    setActionLoading(true);
    try {
      const targetUsers = selectedUsers.size > 0
        ? users.filter(u => selectedUsers.has(u.email))
        : users;
      for (const user of targetUsers) {
        if (bulkAction === 'credits') {
          await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addCredits', email: user.email, amount: parseInt(bulkAmount) }),
          });
        } else {
          await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'setPlan', email: user.email, plan: bulkPlan }),
          });
        }
      }
      await fetchUsers();
      await fetchStats();
      setShowBulkModal(false);
      setBulkAmount('');
      setSelectedUsers(new Set());
      showSuccess(bulkAction === 'credits'
        ? `Added ${bulkAmount} credits to ${targetUsers.length} users`
        : `Changed ${targetUsers.length} users to ${bulkPlan} plan`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuickAddCredits(email: string, amount: number) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addCredits', email, amount }),
      });
      if (!res.ok) throw new Error('Failed');
      await fetchUsers();
      await fetchStats();
      showSuccess(`Added ${amount} credits to ${email}`);
    } catch {
      setError('Failed to add credits');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!settingsForm) return;
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      const data = await res.json();
      setAdminSettings(data);
      showSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  }

  function handleExportCSV() {
    const headers = ['Email', 'Plan', 'Credits', 'Total Used', 'Created At', 'Last Used At'];
    const rows = users.map(u => [
      u.email, u.plan, u.credits.toString(), u.totalUsed.toString(),
      u.createdAt, u.lastUsedAt || 'Never'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dealwise-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('User data exported as CSV');
  }

  async function handleUpdateMessageStatus(id: string, status: string) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update message');
      await fetchMessages();
      showSuccess(`Message marked as ${status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateReportStatus(id: string, status: string) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update report');
      await fetchReports();
      showSuccess(`Report status changed to ${status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveReportNotes(id: string, admin_notes: string) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_notes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
      await fetchReports();
      setEditingNotes(null);
      showSuccess('Notes saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReviewAction(id: string, action: string) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error('Failed to update review');
      await fetchReviews();
      showSuccess(`Review ${action}d`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
    } finally {
      setActionLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  // ── Filtered & Sorted Users ────────────────────────────────────────────────

  const filteredUsers = users
    .filter(u => {
      if (planFilter !== 'all' && u.plan !== planFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return u.email.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'credits': return b.credits - a.credits;
        case 'usage': return b.totalUsed - a.totalUsed;
        case 'lastActive':
          return (b.lastUsedAt || '').localeCompare(a.lastUsedAt || '');
        case 'joined':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const userTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

  function toggleUserSelection(email: string) {
    const next = new Set(selectedUsers);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedUsers(next);
  }

  function toggleAllSelection() {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.email)));
    }
  }

  // ── Loading / Access Denied ────────────────────────────────────────────────

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading admin panel...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">You do not have admin privileges to access this page.</p>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-white">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-gray-50 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-5">
            <div>
              <span className="text-sm font-semibold text-gray-900">dealwise</span>
              <span className="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                admin
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-5 py-3">
            <p className="truncate text-xs text-gray-400">{session?.user?.email}</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-semibold text-gray-900">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchUsers(); fetchStats(); fetchSettings(); fetchMessages(); fetchReports(); fetchReviews(); }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Alerts */}
          <div className="px-4 lg:px-6">
            {error && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-2 font-medium underline">Dismiss</button>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                {successMsg}
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'credits' && renderCredits()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'system' && renderSystem()}
          </div>
        </main>

        {/* Modals */}
        {showAddCreditsModal && renderAddCreditsModal()}
        {showBulkModal && renderBulkModal()}
      </div>
    </ProtectedRoute>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: OVERVIEW
  // ══════════════════════════════════════════════════════════════════════════════

  function renderOverview() {
    const revenuePotential = stats
      ? stats.totalUsers * stats.avgCreditsPerUser
      : 0;

    return (
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers ?? users.length}
            color="blue"
          />
          <StatCard
            icon={Zap}
            label="Credits Used"
            value={stats?.totalCreditsUsed ?? 0}
            color="purple"
          />
          <StatCard
            icon={Activity}
            label="Active Today"
            value={stats?.activeToday ?? 0}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Revenue Potential"
            value={revenuePotential}
            color="orange"
          />
        </div>

        {/* Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">User Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Free', count: stats?.freeCount ?? 0, color: 'bg-gray-400' },
                { label: 'Pro', count: stats?.proCount ?? 0, color: 'bg-blue-500' },
                { label: 'Admin', count: stats?.adminCount ?? 0, color: 'bg-purple-500' },
              ].map(item => {
                const total = (stats?.totalUsers ?? users.length) || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="tabular-nums font-medium text-gray-900">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent signups */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Signups</h3>
            {stats?.recentSignups && stats.recentSignups.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSignups.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{u.name || 'Unknown'}</p>
                      <p className="truncate text-xs text-gray-500">{u.email}</p>
                    </div>
                    <UserPlus className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No recent signups</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setBulkAction('credits'); setShowBulkModal(true); }}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Credits to All Users
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export User Data
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: USERS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderUsers() {
    return (
      <div className="space-y-4">
        {/* Search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
              />
            </div>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value as typeof planFilter)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="joined">Sort: Joined</option>
              <option value="credits">Sort: Credits</option>
              <option value="usage">Sort: Usage</option>
              <option value="lastActive">Sort: Last Active</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {selectedUsers.size > 0 && (
              <span className="text-xs text-gray-500">{selectedUsers.size} selected</span>
            )}
            <button
              onClick={() => {
                setBulkAction('credits');
                setShowBulkModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              <Plus className="h-4 w-4" />
              Bulk Actions
            </button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5">
            <span className="text-sm font-medium text-indigo-700">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => { setBulkAction('credits'); setShowBulkModal(true); }}
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
            >
              Add Credits
            </button>
            <button
              onClick={() => { setBulkAction('plan'); setShowBulkModal(true); }}
              className="rounded bg-white px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50"
            >
              Change Plan
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="ml-auto text-xs text-indigo-500 hover:text-indigo-700"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Used
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Active
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(user => (
                    <UserRow
                      key={user.email}
                      user={user}
                      expanded={expandedUser === user.email}
                      selected={selectedUsers.has(user.email)}
                      onToggleExpand={() => setExpandedUser(expandedUser === user.email ? null : user.email)}
                      onToggleSelect={() => toggleUserSelection(user.email)}
                      onAddCredits={() => { setSelectedUser(user.email); setShowAddCreditsModal(true); }}
                      onSetPlan={(plan) => handleSetPlan(user.email, plan)}
                      onDelete={() => handleDeleteUser(user.email)}
                      onQuickAdd={(amt) => handleQuickAddCredits(user.email, amt)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {userTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing {(userPage - 1) * USERS_PER_PAGE + 1} to {Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30">Prev</button>
                {Array.from({ length: userTotalPages }, (_, i) => (
                  <button key={i} onClick={() => setUserPage(i + 1)} className={`px-3 py-1 text-sm border rounded-lg ${userPage === i + 1 ? 'bg-gray-900 text-white' : ''}`}>{i + 1}</button>
                ))}
                <button onClick={() => setUserPage(p => Math.min(userTotalPages, p + 1))} disabled={userPage === userTotalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-30">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: CREDITS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderCredits() {
    const totalDistributed = users.reduce((s, u) => s + (u.plan === 'admin' ? 0 : u.credits), 0) +
      users.reduce((s, u) => s + u.totalUsed, 0);
    const totalUsed = users.reduce((s, u) => s + u.totalUsed, 0);
    const zeroUsers = users.filter(u => u.credits <= 0 && u.plan !== 'admin');
    const topUsers = [...users].sort((a, b) => b.credits - a.credits).slice(0, 10);

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-500">Total Distributed</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {totalDistributed.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-500">Total Used</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {totalUsed.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-500">Remaining</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {stats?.totalCreditsRemaining?.toLocaleString() ?? 0}
            </p>
          </div>
        </div>

        {/* Credit distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Top 10 by Credits Remaining</h3>
          <div className="space-y-2">
            {topUsers.map(u => {
              const maxCredits = topUsers[0]?.credits || 1;
              const pct = Math.round((u.credits / maxCredits) * 100);
              return (
                <div key={u.email} className="flex items-center gap-3">
                  <span className="w-44 truncate text-xs text-gray-600">{u.email}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs tabular-nums font-medium text-gray-900">
                    {u.plan === 'admin' ? 'Inf' : u.credits}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Credit costs */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Credit Costs per Action</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-medium text-gray-500">Action</th>
                  <th className="py-2 text-right font-medium text-gray-500">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { action: 'Contract Analysis', cost: 1 },
                  { action: 'AI-Enhanced Analysis', cost: 2 },
                  { action: 'Chat Message', cost: 1 },
                  { action: 'Contract Comparison', cost: 2 },
                  { action: 'Bulk Analysis (per file)', cost: 1 },
                  { action: 'PDF Export', cost: 0 },
                ].map(item => (
                  <tr key={item.action}>
                    <td className="py-2 text-gray-700">{item.action}</td>
                    <td className="py-2 text-right tabular-nums text-gray-900">
                      {item.cost === 0 ? (
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">Free</span>
                      ) : (
                        `${item.cost} credit${item.cost > 1 ? 's' : ''}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add credits form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Add Credits</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">User</label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select user...</option>
                {users.map(u => (
                  <option key={u.email} value={u.email}>{u.email}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="mb-1 block text-xs font-medium text-gray-500">Amount</label>
              <input
                type="number"
                min="1"
                value={creditAmount}
                onChange={e => setCreditAmount(e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              onClick={handleAddCredits}
              disabled={!selectedUser || !creditAmount || actionLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Zero credit users */}
        {zeroUsers.length > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
            <h3 className="mb-3 text-sm font-semibold text-orange-800">
              Users with 0 Credits ({zeroUsers.length})
            </h3>
            <div className="space-y-2">
              {zeroUsers.map(u => (
                <div key={u.email} className="flex items-center justify-between">
                  <span className="text-sm text-orange-700">{u.email}</span>
                  <button
                    onClick={() => handleQuickAddCredits(u.email, 10)}
                    className="rounded bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700"
                  >
                    +10 Credits
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: ANALYTICS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderAnalytics() {
    const totalAnalyses = users.reduce((s, u) => s + u.totalUsed, 0);
    const avgUsage = users.length > 0 ? Math.round(totalAnalyses / users.length) : 0;
    const topUsersData = [...users].sort((a, b) => b.totalUsed - a.totalUsed).slice(0, 5);
    const maxUsage = topUsersData[0]?.totalUsed || 1;

    // Simulated daily usage from user lastUsedAt data
    const last7Days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = users.filter(u => u.lastUsedAt?.startsWith(dateStr)).length;
      last7Days.push({ label: dayLabel, count });
    }
    const maxDay = Math.max(...last7Days.map(d => d.count), 1);

    return (
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-500">Total Analyses Performed</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {totalAnalyses.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-500">Average Usage / User</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{avgUsage}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-medium text-gray-500">Users with Zero Credits</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
              {stats?.usersWithZeroCredits ?? 0}
            </p>
          </div>
        </div>

        {/* Daily activity chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Active Users (Last 7 Days)</h3>
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {last7Days.map((day, i) => {
              const h = day.count > 0 ? Math.max((day.count / maxDay) * 140, 8) : 4;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums font-medium text-gray-700">
                    {day.count}
                  </span>
                  <div
                    className="w-full rounded-t bg-indigo-500"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[10px] text-gray-400">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most active users */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Most Active Users</h3>
          <div className="space-y-3">
            {topUsersData.map((u, i) => (
              <div key={u.email} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {i + 1}
                </span>
                <span className="w-48 truncate text-sm text-gray-700">{u.email}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${(u.totalUsed / maxUsage) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 text-right text-xs tabular-nums font-medium text-gray-900">
                  {u.totalUsed} used
                </span>
              </div>
            ))}
            {topUsersData.length === 0 && (
              <p className="text-sm text-gray-400">No usage data yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: SETTINGS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderSettings() {
    if (!settingsForm) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Site settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-5 text-sm font-semibold text-gray-900">Site Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsInput
              icon={Globe}
              label="Site Name"
              value={settingsForm.siteName}
              onChange={v => setSettingsForm({ ...settingsForm, siteName: v })}
            />
            <SettingsInput
              icon={Mail}
              label="Support Email"
              value={settingsForm.supportEmail}
              onChange={v => setSettingsForm({ ...settingsForm, supportEmail: v })}
            />
            <SettingsInput
              icon={CreditCard}
              label="Default Credits for New Users"
              value={String(settingsForm.defaultCredits)}
              onChange={v => setSettingsForm({ ...settingsForm, defaultCredits: parseInt(v) || 0 })}
              type="number"
            />
            <SettingsInput
              icon={Users}
              label="Anonymous Free Analysis Limit"
              value={String(settingsForm.anonymousFreeLimit)}
              onChange={v => setSettingsForm({ ...settingsForm, anonymousFreeLimit: parseInt(v) || 0 })}
              type="number"
            />
            <SettingsInput
              icon={FileText}
              label="Max Contract Length (chars)"
              value={String(settingsForm.maxContractLength)}
              onChange={v => setSettingsForm({ ...settingsForm, maxContractLength: parseInt(v) || 0 })}
              type="number"
            />
          </div>
        </div>

        {/* Feature toggles */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-5 text-sm font-semibold text-gray-900">Feature Toggles</h3>
          <div className="space-y-3">
            {([
              { key: 'aiAnalysis' as const, label: 'AI Analysis' },
              { key: 'chat' as const, label: 'Chat' },
              { key: 'bulkAnalysis' as const, label: 'Bulk Analysis' },
              { key: 'compare' as const, label: 'Contract Comparison' },
              { key: 'templates' as const, label: 'Templates' },
            ]).map(item => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <span className="text-sm text-gray-700">{item.label}</span>
                <button
                  onClick={() => {
                    setSettingsForm({
                      ...settingsForm,
                      features: {
                        ...settingsForm.features,
                        [item.key]: !settingsForm.features[item.key],
                      },
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  {settingsForm.features[item.key] ? (
                    <ToggleRight className="h-6 w-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-300" />
                  )}
                  <span className={`text-xs font-medium ${settingsForm.features[item.key] ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {settingsForm.features[item.key] ? 'On' : 'Off'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {settingsSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Maintenance */}
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-red-800">Maintenance</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (!window.confirm('Reset all user credits to default? This cannot be undone.')) return;
                handleResetAllCredits();
              }}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Reset All Credits to Default
            </button>
            <button
              onClick={handleExportCSV}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Export All Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleResetAllCredits() {
    setActionLoading(true);
    try {
      const defaultCredits = adminSettings?.defaultCredits ?? 50;
      for (const user of users) {
        if (user.plan !== 'admin') {
          // Reset by setting credits: we can use addCredits with negative and then positive
          const diff = defaultCredits - user.credits;
          if (diff !== 0) {
            await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'addCredits', email: user.email, amount: diff }),
            });
          }
        }
      }
      await fetchUsers();
      await fetchStats();
      showSuccess('All credits reset to default');
    } catch {
      setError('Failed to reset credits');
    } finally {
      setActionLoading(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: SYSTEM
  // ══════════════════════════════════════════════════════════════════════════════

  function renderSystem() {
    const apiEndpoints = [
      { method: 'GET', path: '/api/admin/users', desc: 'List all users' },
      { method: 'POST', path: '/api/admin/users', desc: 'User actions (addCredits, setPlan, deleteUser)' },
      { method: 'GET', path: '/api/admin/stats', desc: 'Dashboard statistics' },
      { method: 'GET', path: '/api/admin/settings', desc: 'Get admin settings' },
      { method: 'POST', path: '/api/admin/settings', desc: 'Save admin settings' },
      { method: 'GET', path: '/api/credits', desc: 'Get current user credits' },
      { method: 'POST', path: '/api/analyze', desc: 'Analyze a contract' },
    ];

    const envVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'GEMINI_API_KEY',
    ];

    return (
      <div className="space-y-6">
        {/* System info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">System Information</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon={Server} label="Framework" value="Next.js 16.2.0" />
            <InfoRow icon={HardDrive} label="Runtime" value="Node.js (Edge-compatible)" />
            <InfoRow icon={Hash} label="React" value="19.2.4" />
            <InfoRow icon={Shield} label="Auth" value="NextAuth v5 (beta)" />
          </div>
        </div>

        {/* Database info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Database (JSON Files)</h3>
          <div className="space-y-2">
            {[
              { file: 'data/credits.json', desc: 'User credits & plans' },
              { file: 'data/users.json', desc: 'Auth user accounts' },
              { file: 'data/admin-settings.json', desc: 'Admin settings' },
            ].map(item => (
              <div key={item.file} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.file}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">API Endpoints</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-medium text-gray-500">Method</th>
                  <th className="py-2 text-left font-medium text-gray-500">Path</th>
                  <th className="py-2 text-left font-medium text-gray-500">Description</th>
                  <th className="py-2 text-right font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apiEndpoints.map((ep, i) => (
                  <tr key={i}>
                    <td className="py-2">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        ep.method === 'GET' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-xs text-gray-700">{ep.path}</td>
                    <td className="py-2 text-gray-500">{ep.desc}</td>
                    <td className="py-2 text-right">
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">OK</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Environment Variables</h3>
          <div className="space-y-2">
            {envVars.map(v => (
              <EnvVarRow key={v} name={v} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MODALS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderAddCreditsModal() {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Add Credits</h3>
            <button
              onClick={() => { setShowAddCreditsModal(false); setSelectedUser(''); setCreditAmount(''); }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">User</label>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select a user</option>
                {users.map(u => (
                  <option key={u.email} value={u.email}>{u.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Credits to add</label>
              <input
                type="number"
                min="1"
                value={creditAmount}
                onChange={e => setCreditAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowAddCreditsModal(false); setSelectedUser(''); setCreditAmount(''); }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCredits}
                disabled={!selectedUser || !creditAmount || actionLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? 'Adding...' : 'Add Credits'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderBulkModal() {
    const targetCount = selectedUsers.size > 0 ? selectedUsers.size : users.length;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Action</h3>
            <button
              onClick={() => { setShowBulkModal(false); setBulkAmount(''); }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setBulkAction('credits')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                bulkAction === 'credits' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Add Credits
            </button>
            <button
              onClick={() => setBulkAction('plan')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                bulkAction === 'plan' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Change Plan
            </button>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            Applies to {targetCount} user{targetCount > 1 ? 's' : ''}{selectedUsers.size > 0 ? ' (selected)' : ' (all)'}.
          </p>
          <div className="space-y-4">
            {bulkAction === 'credits' ? (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Credits per user</label>
                <input
                  type="number"
                  min="1"
                  value={bulkAmount}
                  onChange={e => setBulkAmount(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">New plan</label>
                <select
                  value={bulkPlan}
                  onChange={e => setBulkPlan(e.target.value as 'free' | 'pro' | 'admin')}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowBulkModal(false); setBulkAmount(''); }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAddCredits}
                disabled={(bulkAction === 'credits' && !bulkAmount) || actionLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: MESSAGES
  // ══════════════════════════════════════════════════════════════════════════════

  function renderMessages() {
    const statusBadge = (status: string) => {
      switch (status) {
        case 'read': return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'replied': return 'bg-green-50 text-green-700 border border-green-200';
        default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Contact Messages</h2>
          <span className="text-sm text-gray-500">{messages.length} total</span>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No messages yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Subject</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Message</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <>
                    <tr
                      key={msg.id}
                      className={`border-b border-gray-50 transition-colors cursor-pointer ${expandedMessage === msg.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{msg.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{msg.email || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{msg.subject || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{msg.message}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(msg.status || 'unread')}`}>
                          {msg.status || 'unread'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateMessageStatus(msg.id, 'read'); }}
                            className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            disabled={actionLoading}
                          >
                            Read
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateMessageStatus(msg.id, 'replied'); }}
                            className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                            disabled={actionLoading}
                          >
                            Replied
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedMessage === msg.id && (
                      <tr key={`${msg.id}-expanded`}>
                        <td colSpan={7} className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                          <div className="rounded-lg bg-white border border-gray-200 p-4">
                            <p className="text-xs font-medium text-gray-500 mb-1">Full Message</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: REPORTS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderReports() {
    const statusBadge = (status: string) => {
      switch (status) {
        case 'in_progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'resolved': return 'bg-green-50 text-green-700 border border-green-200';
        case 'closed': return 'bg-gray-100 text-gray-600 border border-gray-200';
        default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      }
    };

    const REPORT_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Issue Reports</h2>
          <span className="text-sm text-gray-500">{reports.length} total</span>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Bug className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No reports yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Page URL</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Description</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <>
                    <tr
                      key={report.id}
                      className={`border-b border-gray-50 transition-colors cursor-pointer ${expandedReport === report.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{report.user_email || 'Anonymous'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate text-xs font-mono">
                        {report.page_url || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{report.description}</td>
                      <td className="px-4 py-3">
                        <select
                          value={report.status || 'open'}
                          onChange={(e) => { e.stopPropagation(); handleUpdateReportStatus(report.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium outline-none cursor-pointer ${statusBadge(report.status || 'open')}`}
                        >
                          {REPORT_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNotes(report.id);
                            setNotesText(report.admin_notes || '');
                          }}
                          className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Notes
                        </button>
                      </td>
                    </tr>
                    {expandedReport === report.id && (
                      <tr key={`${report.id}-expanded`}>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                          <div className="space-y-3">
                            <div className="rounded-lg bg-white border border-gray-200 p-4">
                              <p className="text-xs font-medium text-gray-500 mb-1">Full Description</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.description}</p>
                            </div>
                            {report.admin_notes && (
                              <div className="rounded-lg bg-white border border-gray-200 p-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">Admin Notes</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {editingNotes === report.id && (
                      <tr key={`${report.id}-notes`}>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                          <div className="rounded-lg bg-white border border-gray-200 p-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Admin Notes</p>
                            <textarea
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none"
                              placeholder="Add notes about this report..."
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSaveReportNotes(report.id, notesText); }}
                                disabled={actionLoading}
                                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                              >
                                Save Notes
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingNotes(null); }}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TAB: REVIEWS
  // ══════════════════════════════════════════════════════════════════════════════

  function renderReviews() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">User Reviews</h2>
          <span className="text-sm text-gray-500">{reviews.length} total</span>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Star className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No reviews yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Rating</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Review</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Approved</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Featured</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{review.user_name}</p>
                        <p className="text-xs text-gray-400">{review.user_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-3.5 w-3.5 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate">
                      {review.review_text || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleReviewAction(review.id, review.is_approved ? 'reject' : 'approve')}
                        disabled={actionLoading}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          review.is_approved
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {review.is_approved ? (
                          <><CheckCircle className="h-3 w-3" /> Yes</>
                        ) : (
                          <><X className="h-3 w-3" /> No</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleReviewAction(review.id, review.is_featured ? 'unfeature' : 'feature')}
                        disabled={actionLoading}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                          review.is_featured
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {review.is_featured ? (
                          <><Star className="h-3 w-3 fill-amber-400" /> Featured</>
                        ) : (
                          <><Star className="h-3 w-3" /> Feature</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {!review.is_approved && (
                          <button
                            onClick={() => handleReviewAction(review.id, 'approve')}
                            disabled={actionLoading}
                            className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            Approve
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => handleReviewAction(review.id, 'reject')}
                            disabled={actionLoading}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-Components
// ══════════════════════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function UserRow({
  user,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
  onAddCredits,
  onSetPlan,
  onDelete,
  onQuickAdd,
}: {
  user: UserCredits;
  expanded: boolean;
  selected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onAddCredits: () => void;
  onSetPlan: (plan: 'free' | 'pro' | 'admin') => void;
  onDelete: () => void;
  onQuickAdd: (amount: number) => void;
}) {
  return (
    <>
      <tr className={`transition-colors ${expanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="rounded border-gray-300"
          />
        </td>
        <td className="px-4 py-3">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-indigo-600"
          >
            <ChevronRight className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            {user.email}
          </button>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${planBadgeClass(user.plan)}`}>
            {user.plan}
          </span>
        </td>
        <td className="px-4 py-3 text-sm tabular-nums text-gray-900">
          {user.plan === 'admin' ? 'Unlimited' : user.credits.toLocaleString()}
        </td>
        <td className="px-4 py-3 text-sm tabular-nums text-gray-500">{user.totalUsed.toLocaleString()}</td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {user.lastUsedAt ? new Date(user.lastUsedAt).toLocaleDateString() : 'Never'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={onAddCredits}
              className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 hover:bg-indigo-100"
              title="Add Credits"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <select
                value={user.plan}
                onChange={e => onSetPlan(e.target.value as 'free' | 'pro' | 'admin')}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-6 text-xs font-medium text-gray-600 outline-none focus:border-indigo-500"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={onDelete}
              className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
              title="Delete User"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 py-4">
            <div className="ml-8 rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="mt-0.5 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Plan</p>
                  <p className="mt-0.5 text-sm text-gray-900 capitalize">{user.plan}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Credits Remaining</p>
                  <p className="mt-0.5 text-sm tabular-nums text-gray-900">
                    {user.plan === 'admin' ? 'Unlimited' : user.credits}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Used</p>
                  <p className="mt-0.5 text-sm tabular-nums text-gray-900">{user.totalUsed}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Joined</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Last Active</p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {user.lastUsedAt ? new Date(user.lastUsedAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => onQuickAdd(10)}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  +10 Credits
                </button>
                <button
                  onClick={() => onQuickAdd(50)}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  +50 Credits
                </button>
                <button
                  onClick={() => onQuickAdd(100)}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  +100 Credits
                </button>
                <div className="ml-auto">
                  <button
                    onClick={onDelete}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SettingsInput({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3">
      <Icon className="h-4 w-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function EnvVarRow({ name }: { name: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-gray-700">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-gray-400">
          {visible ? '(check .env.local)' : '********'}
        </span>
        <button
          onClick={() => setVisible(!visible)}
          className="text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
