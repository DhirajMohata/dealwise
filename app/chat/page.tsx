'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  FileText,
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Bot,
  User as UserIcon,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSession } from 'next-auth/react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getSettings } from '@/lib/settings';
import { useCredits } from '@/components/CreditsProvider';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: boolean;
}

interface Conversation {
  id: string;
  user_email: string;
  contract_id: string | null;
  contract_snippet: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  const { data: session } = useSession();

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { refreshCredits } = useCredits();

  /* ---- Helpers: DB calls ---- */

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        return data as Conversation[];
      }
    } catch {
      // silently fail
    }
    return [] as Conversation[];
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped: ChatMessage[] = data.map((m: { id: string; role: 'user' | 'assistant'; content: string; created_at: string }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at).getTime(),
        }));
        setMessages(mapped);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const createConversation = useCallback(async (opts: { contractId?: string; contractSnippet?: string; title?: string }): Promise<Conversation | null> => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversations((prev) => [conv, ...prev]);
        return conv as Conversation;
      }
    } catch {
      // silently fail
    }
    return null;
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
      setMessages([]);
    }
    // Fire and forget
    fetch('/api/chat/conversations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, [activeConversation]);

  const saveMessageToDB = useCallback((conversationId: string, role: 'user' | 'assistant', content: string) => {
    // Fire and forget - non-blocking
    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, role, content }),
    }).catch(() => {});
  }, []);

  /* ---- Mount: load conversations, handle chat context ---- */

  useEffect(() => {
    setMounted(true);

    const init = async () => {
      const convs = await fetchConversations();
      setConversationsLoaded(true);
      setLoadingConversations(false);

      // Check for contract context passed from analyze page
      let handledContext = false;
      try {
        const chatContext = localStorage.getItem('dealwise_chat_context');
        if (chatContext) {
          const parsed = JSON.parse(chatContext);
          localStorage.removeItem('dealwise_chat_context');

          const contractSnippet = (parsed.contractText || '').slice(0, 80).replace(/\s+/g, ' ').trim();
          const overallScore = parsed.result?.overallScore ?? 0;
          const recommendation = parsed.result?.recommendation ?? 'negotiate';

          const newConv = await createConversation({
            contractId: parsed.contractId || `chat-${Date.now()}`,
            contractSnippet,
            title: contractSnippet || 'Contract Chat',
          });

          if (newConv) {
            setActiveConversation(newConv.id);

            const introMsg: ChatMessage = {
              id: `intro-${Date.now()}`,
              role: 'assistant',
              content: `I've loaded your contract analysis. **Score: ${overallScore}/100** (${String(recommendation).replace('_', ' ').toUpperCase()})\n\nAsk me anything about it -- I'll help you understand the clauses, negotiate better terms, or explain any red flags.`,
              timestamp: Date.now(),
            };
            setMessages([introMsg]);
            saveMessageToDB(newConv.id, 'assistant', introMsg.content);
            handledContext = true;
          }
        }
      } catch {
        // silently fail
      }

      // If no context was handled, load the most recent conversation
      if (!handledContext && convs.length > 0) {
        setActiveConversation(convs[0].id);
        // fetchMessages will be triggered by the activeConversation change
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Load messages when active conversation changes ---- */

  useEffect(() => {
    if (activeConversation && conversationsLoaded) {
      fetchMessages(activeConversation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* Auto-resize textarea */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  }, []);

  /* ---- Copy message ---- */
  const copyMessage = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  /* ---- Get contract context for the active conversation ---- */
  const getContractContext = useCallback((): string | undefined => {
    if (!activeConversation) return undefined;
    const conv = conversations.find((c) => c.id === activeConversation);
    return conv?.contract_snippet || undefined;
  }, [activeConversation, conversations]);

  /* ---- Send message ---- */
  const sendMessage = useCallback(async (retryText?: string) => {
    const text = (retryText || input).trim();
    if (!text || loading) return;

    // If no active conversation, create one first
    let convId = activeConversation;
    if (!convId) {
      const newConv = await createConversation({ title: text.slice(0, 60).trim() });
      if (!newConv) return;
      convId = newConv.id;
      setActiveConversation(convId);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Only add user message if not retrying (retry reuses existing message)
    if (!retryText) {
      setMessages((prev) => [...prev, userMsg]);
      // Save user message to DB (non-blocking)
      saveMessageToDB(convId, 'user', text);
    }
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const currentMessages = retryText ? messages : [...messages, userMsg];
      const chatHistory = currentMessages
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const contractContext = getContractContext();

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
        const errorContent =
          res.status === 402
            ? `You're out of credits. [Get more credits](/pricing) to continue chatting.`
            : `Sorry, something went wrong: ${data.error || 'Unknown error'}`;

        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: errorContent,
          timestamp: Date.now(),
          error: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      if (data.creditsRemaining !== undefined) {
        refreshCredits();
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      // Save assistant message to DB (non-blocking)
      saveMessageToDB(convId, 'assistant', data.reply);

      // Update the conversation title in local state if it was the first message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId && c.title === 'New Chat') {
            return { ...c, title: text.slice(0, 60).trim(), updated_at: new Date().toISOString() };
          }
          if (c.id === convId) {
            return { ...c, updated_at: new Date().toISOString() };
          }
          return c;
        })
      );
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Network error: ${err instanceof Error ? err.message : 'Could not reach the server'}. Check your connection and try again.`,
        timestamp: Date.now(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, messages, activeConversation, refreshCredits, createConversation, saveMessageToDB, getContractContext]);

  /* ---- Retry last message ---- */
  const retryLastMessage = useCallback(() => {
    // Find last user message
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[idx];
    // Remove everything after and including the last user message's response
    setMessages(messages.slice(0, idx + 1).filter((m) => !m.error));
    sendMessage(lastUserMsg.content);
  }, [messages, sendMessage]);

  /* ---- Select conversation ---- */
  const selectConversation = useCallback((convId: string) => {
    if (convId === activeConversation) return;
    setActiveConversation(convId);
    setMessages([]);
    setSidebarOpen(false);
  }, [activeConversation]);

  /* ---- New chat ---- */
  const startNewChat = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    inputRef.current?.focus();
  }, []);

  /* ---- Key handler ---- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---- Get active conversation details ---- */
  const activeConv = conversations.find((c) => c.id === activeConversation);

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
    <div className="flex h-dvh flex-col bg-white">
      <Nav />

      <div className="flex min-h-0 flex-1">
        {/* ---- Mobile overlay backdrop ---- */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ---- Sidebar ---- */}
        <div
          className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-40 w-[280px] bg-white shadow-xl' : 'hidden'} md:relative md:flex md:w-[280px] md:flex-shrink-0 md:border-r md:border-gray-200 md:shadow-none`}
        >
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Conversations</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={startNewChat}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <X className="h-4 w-4 md:hidden" />
                  <ChevronLeft className="hidden h-4 w-4 md:block" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="mb-2 h-6 w-6 text-gray-300" />
                  <p className="text-xs text-gray-400">No conversations yet</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Start a chat or{' '}
                    <Link
                      href="/analyze"
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      analyze a contract
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {conversations.map((conv) => {
                    const isSelected = activeConversation === conv.id;
                    return (
                      <div
                        key={conv.id}
                        className={`group relative w-full rounded-lg px-3 py-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 ring-1 ring-indigo-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => selectConversation(conv.id)}
                          className="w-full text-left"
                        >
                          <p className={`truncate text-sm ${isSelected ? 'font-medium text-indigo-700' : 'text-gray-700'}`}>
                            {conv.title || 'New Chat'}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {conv.contract_snippet && (
                              <span className="flex items-center gap-0.5 text-[10px] text-indigo-500">
                                <FileText className="h-2.5 w-2.5" />
                                Contract
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {new Date(conv.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="absolute right-2 top-2 rounded p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- Main Chat Area ---- */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
              title="Show conversations"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">Contract AI</p>
              <p className="truncate text-[11px] text-gray-400">
                {activeConv?.contract_snippet
                  ? activeConv.contract_snippet
                  : activeConv?.title && activeConv.title !== 'New Chat'
                    ? activeConv.title
                    : 'General Q&A'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={startNewChat}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              /* Empty state */
              <div className="flex h-full flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                    <Sparkles className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                    Contract AI Assistant
                  </h3>
                  <p className="mb-6 max-w-sm text-sm text-gray-500">
                    Select a conversation from the sidebar, or ask any question about freelance contracts.
                  </p>

                  <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
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
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-xs text-gray-600 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-gray-900"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[85%] gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            msg.role === 'user'
                              ? 'bg-indigo-600'
                              : msg.error
                                ? 'bg-red-500'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <UserIcon className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Bot className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>

                        {/* Message bubble */}
                        <div className="flex flex-col">
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : msg.error
                                  ? 'border border-red-200 bg-red-50 text-red-700'
                                  : 'border border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            {msg.role === 'user' ? (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <div className={`prose prose-sm max-w-none ${msg.error ? 'text-red-700 prose-a:text-red-700 prose-a:underline' : 'text-gray-700'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>

                          {/* Message actions */}
                          {msg.role === 'assistant' && !msg.error && (
                            <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => copyMessage(msg.id, msg.content)}
                                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                title="Copy"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Retry button on error */}
                          {msg.error && (
                            <button
                              onClick={retryLastMessage}
                              className="mt-1.5 inline-flex items-center gap-1 self-start rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-gray-100 bg-white px-4 py-3 md:px-6">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <div className="relative min-w-0 flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={activeConv?.contract_snippet ? "Ask about this contract..." : "Ask about freelance contracts..."}
                  rows={1}
                  className="max-h-32 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  style={{ minHeight: '40px' }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mx-auto mt-1.5 max-w-3xl text-center text-[10px] text-gray-400">
              AI responses are for informational purposes only, not legal advice. Press Shift+Enter for new line.
            </p>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
