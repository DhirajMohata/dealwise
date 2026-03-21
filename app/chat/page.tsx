'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  FileText,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Bot,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getHistory, type HistoryEntry } from '@/lib/auth';
import { getSettings } from '@/lib/settings';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedContract, setSelectedContract] = useState<HistoryEntry | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHistory(getHistory());
    setMounted(true);

    // Check for contract context passed from analyze page
    try {
      const chatContext = localStorage.getItem('dealwise_chat_context');
      if (chatContext) {
        const parsed = JSON.parse(chatContext);
        localStorage.removeItem('dealwise_chat_context');

        // Create a synthetic history entry to use as selected contract
        const syntheticEntry: HistoryEntry = {
          id: `chat-${Date.now()}`,
          date: parsed.date || new Date().toISOString(),
          overallScore: parsed.result?.overallScore ?? 0,
          recommendation: parsed.result?.recommendation ?? 'negotiate',
          summary: parsed.result?.summary ?? '',
          contractSnippet: (parsed.contractText || '').slice(0, 80).replace(/\s+/g, ' ').trim(),
          currency: 'USD',
          nominalHourlyRate: parsed.result?.nominalHourlyRate ?? 0,
          effectiveHourlyRate: parsed.result?.effectiveHourlyRate ?? 0,
          rateReduction: parsed.result?.rateReduction ?? 0,
          fullResult: JSON.stringify(parsed.result || {}),
        };

        setSelectedContract(syntheticEntry);

        // Add a welcome message with context
        const introMsg: ChatMessage = {
          id: `intro-${Date.now()}`,
          role: 'assistant',
          content: `I've loaded your contract analysis. **Score: ${syntheticEntry.overallScore}/100** (${syntheticEntry.recommendation.replace('_', ' ').toUpperCase()})\n\nAsk me anything about it -- I'll help you understand the clauses, negotiate better terms, or explain any red flags.`,
          timestamp: Date.now(),
        };
        setMessages([introMsg]);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Send message ---- */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for API
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Get contract context if selected
      let contractContext: string | undefined;
      if (selectedContract) {
        try {
          const parsed = JSON.parse(selectedContract.fullResult);
          contractContext = parsed.contractText || selectedContract.contractSnippet;
        } catch {
          contractContext = selectedContract.contractSnippet;
        }
      }

      const settings = getSettings();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          contractContext,
          history: chatHistory,
          apiKey: settings.savedApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, selectedContract]);

  /* ---- Select contract ---- */
  const selectContract = (entry: HistoryEntry) => {
    setSelectedContract(entry);
    setMessages([]);
    // Add a system-style message
    const introMsg: ChatMessage = {
      id: `intro-${Date.now()}`,
      role: 'assistant',
      content: `I've loaded the contract: **"${entry.contractSnippet}"** (Score: ${entry.overallScore}/100, Recommendation: ${entry.recommendation.replace('_', ' ')})\n\nAsk me anything about this contract -- specific clauses, risks, negotiation strategies, or what terms to push back on.`,
      timestamp: Date.now(),
    };
    setMessages([introMsg]);
  };

  /* ---- Key handler ---- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!mounted) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          <Nav />
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen flex-col bg-white">
      <Nav />

      <div className="flex flex-1 overflow-hidden">
        {/* ---- Sidebar ---- */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex h-[calc(100vh-64px)] shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900">Contract History</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="mb-3 h-8 w-8 text-gray-300" />
                    <p className="text-xs text-gray-400">No contract history yet</p>
                    <Link
                      href="/analyze"
                      className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Analyze a contract
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {history.map((entry) => {
                      const isSelected = selectedContract?.id === entry.id;
                      return (
                        <button
                          key={entry.id}
                          onClick={() => selectContract(entry)}
                          className={`w-full rounded-xl p-3 text-left transition-all ${
                            isSelected
                              ? 'border border-indigo-200 bg-indigo-50 shadow-sm'
                              : 'border border-transparent hover:border-gray-200 hover:bg-white'
                          }`}
                        >
                          <p className={`truncate text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                            {entry.contractSnippet}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className={`text-[10px] font-medium ${
                              entry.overallScore >= 70 ? 'text-emerald-600' : entry.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              Score: {entry.overallScore}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedContract && (
                <div className="border-t border-gray-200 p-3">
                  <button
                    onClick={() => {
                      setSelectedContract(null);
                      setMessages([]);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear Selection
                  </button>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ---- Main Chat Area ---- */}
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">Contract AI Assistant</p>
              <p className="truncate text-xs text-gray-400">
                {selectedContract
                  ? `Discussing: ${selectedContract.contractSnippet}`
                  : 'General contract Q&A'}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex h-full flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                    <Sparkles className="h-10 w-10 text-indigo-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    AI Contract Assistant
                  </h3>
                  <p className="mb-8 max-w-md text-sm text-gray-500">
                    Select a contract from your history, or ask any question about freelance contracts.
                  </p>

                  <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      'What should a good IP clause include?',
                      'Is Net-60 payment terms fair?',
                      'How to handle unlimited revisions?',
                      'What kill fee should I negotiate?',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="rounded-xl border border-gray-200 bg-white p-3 text-left text-xs text-gray-600 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-gray-900"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            msg.role === 'user'
                              ? 'bg-indigo-600'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <UserIcon className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-indigo-50 text-gray-900'
                              : 'border border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="mx-auto flex max-w-3xl items-end gap-3">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your contract..."
                  rows={1}
                  className="max-h-32 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-gray-400">
              AI responses are for informational purposes only and do not constitute legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
