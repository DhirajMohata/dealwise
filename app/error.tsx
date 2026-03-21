'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFE] px-4">
      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-[#111827]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#4B5563]">
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-all hover:shadow-lg hover:brightness-105"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        {/* Error details collapsible */}
        <div className="mt-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] transition-colors hover:text-[#4B5563]"
          >
            Error details
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            />
          </button>

          {showDetails && (
            <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm">
              <p className="break-all text-xs text-[#4B5563]">
                <span className="font-semibold text-[#111827]">Message: </span>
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-[#9CA3AF]">
                  <span className="font-semibold text-[#4B5563]">Digest: </span>
                  {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
