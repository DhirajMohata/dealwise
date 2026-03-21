"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, Check, Shield } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const initialTab = searchParams.get("tab") || "signin";

  const [tab, setTab] = useState<"signin" | "signup">(initialTab === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      name: tab === "signup" ? name : undefined,
      action: tab === "signup" ? "signup" : "login",
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  function handleGoogle() {
    signIn("google", { callbackUrl });
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT — Brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-indigo-600 p-12 text-white">
        <div>
          <Link href="/" className="text-2xl font-semibold tracking-tight">dealwise</Link>
        </div>

        <div>
          <h1 className="text-[36px] font-bold leading-[1.15] tracking-tight" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            Know your real rate<br />before you sign.
          </h1>
          <div className="mt-8 space-y-4">
            {[
              "Analyzes 30+ contract red flag patterns",
              "Calculates your real effective hourly rate",
              "Generates ready-to-send negotiation emails",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-indigo-200" />
                <span className="text-[15px] text-indigo-100">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini product preview */}
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <span className="text-lg font-bold text-red-300">42</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">Deal Score</p>
              <p className="text-xs text-white/50">$62/hr → $24/hr · Walk Away</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Auth form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-xl font-semibold text-gray-900 tracking-tight">dealwise</Link>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
              {tab === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-[14px] text-gray-500">
              {tab === "signin" ? (
                <>Don&apos;t have an account? <button onClick={() => setTab("signup")} className="text-indigo-600 font-medium hover:text-indigo-700">Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setTab("signin")} className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</button></>
              )}
            </p>
          </div>

          {/* Google OAuth — FIRST */}
          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[12px] text-gray-400">or continue with email</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required={tab === "signup"}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {tab === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Trust */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 50 free credits</span>
            <span>·</span>
            <span>No credit card</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}>
      <SignInForm />
    </Suspense>
  );
}
