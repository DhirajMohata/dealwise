"use client";
import { AlertTriangle } from "lucide-react";

export default function ErrorFallback({ error, reset }: { error?: string; reset?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
      <h3 className="mt-3 text-sm font-semibold text-gray-900">Something went wrong</h3>
      <p className="mt-1 text-xs text-gray-500">{error || "An unexpected error occurred. Please try again."}</p>
      {reset && (
        <button onClick={reset} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Try Again
        </button>
      )}
    </div>
  );
}
