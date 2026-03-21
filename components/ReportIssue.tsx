"use client";
import { useState } from "react";
import { MessageCircleWarning, X, Send, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function ReportIssue() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { data: session } = useSession();

  async function submit() {
    if (!description.trim()) return;
    setSending(true);
    await fetch("/api/report-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        pageUrl: window.location.href,
        userEmail: session?.user?.email,
      }),
    });
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); setDescription(""); }, 2000);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Report an issue"
      >
        {open ? <X className="h-4 w-4" /> : <MessageCircleWarning className="h-4 w-4" />}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-20 right-5 z-40 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
          >
            {sent ? (
              <div className="flex flex-col items-center py-4 text-center">
                <Check className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">Thanks for reporting!</p>
                <p className="text-xs text-gray-500 mt-1">We&apos;ll look into it.</p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-900">Report an Issue</h3>
                <p className="text-xs text-gray-500 mt-1">Found a bug or have feedback? Let us know.</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                />
                <button
                  onClick={submit}
                  disabled={sending || !description.trim()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sending ? "Sending..." : "Send Report"}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
