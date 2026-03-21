'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Settings, LayoutDashboard, MessageSquare, FileText, Search, GitCompareArrows, Code2, Layers, Shield, GitBranch, DollarSign } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

interface CreditInfo {
  credits: number;
  plan: 'free' | 'pro' | 'admin';
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

  const isLoading = status === 'loading';
  const user = session?.user;
  const isLoggedIn = !!user;

  // Fetch credits when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/credits')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCreditInfo({ credits: data.credits, plan: data.plan });
        })
        .catch(() => {});
    } else {
      setCreditInfo(null);
    }
  }, [isLoggedIn]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const linkClass = (href: string) =>
    `text-[13px] font-medium transition-colors ${
      isActive(href) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
    }`;

  const mobileLinkClass = (href: string) =>
    `flex items-center gap-2.5 text-[13px] font-medium transition-colors py-1 ${
      isActive(href) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
    }`;

  const isUserAdmin = creditInfo?.plan === 'admin';

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-50 h-14 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center">
          <span className="text-base font-semibold tracking-tight text-gray-900">
            dealwise
          </span>
        </Link>

        {/* Center nav links (desktop) */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/analyze" className={linkClass('/analyze')}>
            Analyze
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link href="/chat" className={linkClass('/chat')}>
                Chat
              </Link>
              <Link href="/templates" className={linkClass('/templates')}>
                Templates
              </Link>
              <Link href="/compare" className={linkClass('/compare')}>
                Compare
              </Link>
              <Link href="/versions" className={linkClass('/versions')}>
                Versions
              </Link>
              <Link href="/pricing" className={linkClass('/pricing')}>
                Pricing
              </Link>
              {isUserAdmin && (
                <Link href="/admin" className={linkClass('/admin')}>
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/#pricing"
                className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                Pricing
              </Link>
            </>
          )}
        </div>

        {/* Right side (desktop) */}
        <div className="hidden items-center gap-3 sm:flex">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2.5">
                  {/* Credits badge */}
                  {creditInfo && (
                    <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">
                      {creditInfo.plan === 'admin' ? 'Unlimited' : creditInfo.credits} credits
                    </span>
                  )}

                  {/* Admin link */}
                  {isUserAdmin && (
                    <Link
                      href="/admin"
                      className={`flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-gray-100 ${
                        isActive('/admin') ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="Admin Dashboard"
                    >
                      <Shield className="h-4 w-4" />
                    </Link>
                  )}

                  {/* Settings */}
                  <Link
                    href="/settings"
                    className={`flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-gray-100 ${
                      isActive('/settings') ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>

                  {/* User avatar */}
                  <div className="flex items-center">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white ring-2 ring-gray-100">
                        <span className="text-xs font-medium">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/analyze"
                    className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Analyze Free
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex items-center justify-center sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-gray-500" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden border-t border-gray-100 bg-white sm:hidden"
          >
            <div className="flex flex-col gap-3 px-6 py-4">
              <Link
                href="/analyze"
                className={mobileLinkClass('/analyze')}
                onClick={() => setMobileOpen(false)}
              >
                <Search className="h-4 w-4" />
                Analyze
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className={mobileLinkClass('/dashboard')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/chat"
                    className={mobileLinkClass('/chat')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </Link>
                  <Link
                    href="/templates"
                    className={mobileLinkClass('/templates')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Templates
                  </Link>
                  <Link
                    href="/compare"
                    className={mobileLinkClass('/compare')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <GitCompareArrows className="h-4 w-4" />
                    Compare
                  </Link>
                  <Link
                    href="/bulk"
                    className={mobileLinkClass('/bulk')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Layers className="h-4 w-4" />
                    Bulk
                  </Link>
                  <Link
                    href="/versions"
                    className={mobileLinkClass('/versions')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <GitBranch className="h-4 w-4" />
                    Versions
                  </Link>
                  <Link
                    href="/pricing"
                    className={mobileLinkClass('/pricing')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <DollarSign className="h-4 w-4" />
                    Pricing
                  </Link>

                  {isUserAdmin && (
                    <Link
                      href="/admin"
                      className={mobileLinkClass('/admin')}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  )}

                  <div className="my-1 h-px bg-gray-100" />

                  <Link
                    href="/settings"
                    className={mobileLinkClass('/settings')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </>
              ) : (
                <Link
                  href="/#pricing"
                  className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900 py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
              )}

              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <div className="my-1 h-px bg-gray-100" />
                      <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            width={28}
                            height={28}
                            className="h-7 w-7 rounded-full ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white ring-2 ring-gray-100">
                            <span className="text-xs font-medium">
                              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-gray-900">{user.name}</p>
                          <p className="truncate text-[11px] text-gray-400">{user.email}</p>
                        </div>
                        {creditInfo && (
                          <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">
                            {creditInfo.plan === 'admin' ? 'Unlimited' : creditInfo.credits}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileOpen(false);
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="my-1 h-px bg-gray-100" />
                      <Link
                        href="/auth/signin"
                        onClick={() => setMobileOpen(false)}
                        className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/analyze"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                      >
                        Analyze Free
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
