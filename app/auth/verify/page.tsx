'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Nav from '@/components/Nav';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Missing verification token.'); return; }
    fetch(`/api/auth/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { setStatus('error'); setMessage(data.error); }
        else { setStatus('success'); setMessage(data.message); }
      })
      .catch(() => { setStatus('error'); setMessage('Something went wrong. Please try again.'); });
  }, [token]);

  return (
    <div className="min-h-dvh bg-white">
      <Nav />
      <div className="flex items-center justify-center px-4 py-32">
        <div className="text-center max-w-md">
          {status === 'loading' && <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600 mb-4" />}
          {status === 'success' && <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />}
          {status === 'error' && <XCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />}
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h1>
          <p className="text-gray-500 mb-6">{message}</p>
          {status === 'success' && (
            <Link href="/auth/signin" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              Sign In
            </Link>
          )}
          {status === 'error' && (
            <Link href="/auth/signin?tab=signup" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
