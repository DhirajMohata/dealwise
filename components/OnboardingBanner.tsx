"use client";
import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('dealwise_onboarding_dismissed');
    const hasHistory = localStorage.getItem('dealwise_history');
    if (!dismissed && (!hasHistory || hasHistory === '[]')) setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('dealwise_onboarding_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-indigo-900">Welcome to dealwise!</h3>
                <p className="mt-1 text-sm text-indigo-700">Upload a contract PDF or paste the text below. We&apos;ll analyze it in 30 seconds and show you your real effective hourly rate.</p>
                <div className="mt-3 flex gap-4 text-xs text-indigo-600">
                  <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Drop a PDF above</span>
                  <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Or paste text below</span>
                  <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Click &quot;Analyze My Deal&quot;</span>
                </div>
              </div>
              <button onClick={dismiss} className="text-indigo-400 hover:text-indigo-600"><X className="h-4 w-4" /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
