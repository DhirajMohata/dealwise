'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Shield, Zap, CreditCard, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useAuthModal } from '@/components/AuthProvider';

type TabType = 'signin' | 'signup';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  function handleClose() {
    closeAuthModal();
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setIsLoading(false);
    setIsGoogleLoading(false);
  }

  function switchTab(tab: TabType) {
    setActiveTab(tab);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        name: activeTab === 'signup' ? name : '',
        action: activeTab === 'signup' ? 'signup' : 'login',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error);
      } else if (result?.ok) {
        handleClose();
        // Don't reload -- session updates automatically via SessionProvider
        // window.location.reload() was destroying analysis results in React state
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    signIn('google', { callbackUrl: '/analyze' });
  }

  const showGoogle = typeof window !== 'undefined';

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl"
          >
            {/* Top gradient line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F8] hover:text-[#4B5563]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#111827]">
                  Welcome to DEALWISE
                </h2>
                <p className="mt-2 text-sm text-[#4B5563]">
                  Know your real rate before you sign.
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex rounded-xl border border-[#E5E7EB] bg-[#F3F4F8] p-1">
                <button
                  onClick={() => switchTab('signin')}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === 'signin'
                      ? 'bg-white text-[#111827] shadow-sm'
                      : 'text-[#9CA3AF] hover:text-[#4B5563]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab('signup')}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-[#111827] shadow-sm'
                      : 'text-[#9CA3AF] hover:text-[#4B5563]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'signup' && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-all hover:shadow-lg hover:brightness-105 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {activeTab === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    activeTab === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* Divider */}
              {showGoogle && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#E5E7EB]" />
                    <span className="text-xs text-[#9CA3AF]">or</span>
                    <div className="h-px flex-1 bg-[#E5E7EB]" />
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-sm font-semibold text-[#111827] transition-all hover:bg-gray-50 disabled:opacity-60"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>{isGoogleLoading ? 'Signing in...' : 'Continue with Google'}</span>
                  </button>
                </>
              )}

              {/* Trust badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-[#9CA3AF]">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  100% Free
                </span>
                <span className="h-3 w-px bg-[#E5E7EB]" />
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-emerald-500" />
                  No Credit Card
                </span>
                <span className="h-3 w-px bg-[#E5E7EB]" />
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  Unlimited Analyses
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
