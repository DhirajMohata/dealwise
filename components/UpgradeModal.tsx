'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ArrowRight, Zap, X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  '30 analyses per month',
  'Unlimited AI chat',
  'Negotiation emails',
  'What-If Simulator',
  'PDF & DOCX export',
];

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="upgrade-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={onClose}
        >
          <motion.div
            key="upgrade-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indigo gradient strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-5 flex items-center justify-center rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8">
              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>

              {/* Heading */}
              <h2
                className="text-2xl font-bold tracking-tight text-gray-900"
                style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
              >
                You&apos;ve used all your free analyses
              </h2>

              {/* Subhead */}
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Upgrade to keep analyzing contracts and never miss a hidden clause.
              </p>

              {/* Feature list */}
              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50">
                      <Check className="h-3.5 w-3.5 text-indigo-600" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Primary CTA */}
              <Link
                href="/pricing"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Join Waitlist — Get Early Access
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Secondary */}
              <button
                onClick={onClose}
                className="mt-3 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                Maybe later
              </button>

              {/* Trust text */}
              <p className="mt-4 text-center text-xs text-gray-400">
                We&apos;ll notify you when paid plans launch.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
