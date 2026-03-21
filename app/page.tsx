"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  RefreshCw,
  Clock,
  X,
  AlertTriangle,
  FileText,
  Calculator,
  TrendingDown,
  Shield,
  DollarSign,
  Search,
  BarChart3,
  Sparkles,
  Check,
  ChevronDown,
  MessageSquare,
  GitCompareArrows,
  Layers,
  Download,
  GitBranch,
  Code2,
  Palette,
  Briefcase,
} from "lucide-react";
import Nav from "@/components/Nav";

/* ------------------------------------------------------------------ */
/*  Minimal fade-in wrapper                                            */
/* ------------------------------------------------------------------ */
function Fade({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                  */
/* ------------------------------------------------------------------ */
function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-gray-900 pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="pb-5"
        >
          <p className="text-[14px] leading-relaxed text-gray-500">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <Nav />

      {/* ============================================================
          1. HERO — White, clean, informative
          ============================================================ */}
      <section className="bg-white px-6 pt-28 pb-16">
        <div className="mx-auto max-w-5xl text-center">
          {/* Welcome-back banner for authenticated users */}
          {status === "authenticated" && (
            <Fade>
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-indigo-100 bg-indigo-50 px-5 py-2.5">
                <p className="text-sm font-medium text-indigo-700">
                  Welcome back!{" "}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-indigo-800"
                  >
                    Go to your Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </p>
              </div>
            </Fade>
          )}

          {/* Shield logo */}
          <Fade>
            <div className="mx-auto mb-6 flex justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2L4 7V14C4 20.075 8.275 25.71 14 27C19.725 25.71 24 20.075 24 14V7L14 2Z"
                  fill="url(#hero-shield-gradient)"
                  fillOpacity="0.15"
                  stroke="url(#hero-shield-gradient)"
                  strokeWidth="1.5"
                />
                <line
                  x1="6"
                  y1="14"
                  x2="22"
                  y2="14"
                  stroke="url(#hero-scan-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="hero-shield-gradient"
                    x1="4"
                    y1="2"
                    x2="24"
                    y2="27"
                  >
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient
                    id="hero-scan-gradient"
                    x1="6"
                    y1="14"
                    x2="22"
                    y2="14"
                  >
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </Fade>

          {/* Badge */}
          <Fade delay={0.05}>
            <span className="inline-block rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-[12px] font-medium text-indigo-600">
              AI-Powered &middot; Free &middot; No Signup Required
            </span>
          </Fade>

          {/* Headline */}
          <Fade delay={0.1}>
            <h1 className="mt-8 text-[44px] font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-[54px] md:text-[64px]">
              Know what you&apos;re really
              <br />
              getting paid &mdash; before you sign
            </h1>
          </Fade>

          {/* Subtitle */}
          <Fade delay={0.15}>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-gray-500">
              Paste your freelance contract or upload a PDF. Our AI analyzes
              every clause, calculates your real effective hourly rate, and tells
              you exactly what to negotiate.
            </p>
          </Fade>

          {/* CTAs */}
          <Fade delay={0.2}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Analyze My Contract &mdash; Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#what-you-get"
                className="text-[14px] font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                Watch how it works &darr;
              </a>
            </div>
          </Fade>

          {/* Trust items */}
          <Fade delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-indigo-500" />
                Analyzes in 30 seconds
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-indigo-500" />
                PDF, DOCX, TXT supported
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-indigo-500" />
                50 free credits
              </span>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          2. WHAT YOU GET — Show the actual output
          ============================================================ */}
      <section id="what-you-get" className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              What you get
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              See exactly what we analyze
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-gray-500">
              Upload any freelance contract and get a comprehensive report with
              these insights:
            </p>
          </Fade>

          <Fade delay={0.1}>
            <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Header bar */}
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                <span className="text-[12px] font-medium text-gray-400">
                  Analysis Result &mdash; freelance_contract_v3.pdf
                </span>
              </div>

              <div className="grid gap-0 md:grid-cols-2">
                {/* Left: Score + Rate + Recommendation */}
                <div className="border-b border-gray-100 p-6 md:border-b-0 md:border-r">
                  {/* Score */}
                  <div className="flex items-center gap-5">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                      <svg
                        className="-rotate-90 h-20 w-20"
                        viewBox="0 0 80 80"
                      >
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="5"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${(72 / 100) * 213.6} 213.6`}
                        />
                      </svg>
                      <span className="absolute text-[22px] font-bold text-amber-600">
                        72
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">
                        Deal Score
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-amber-700">
                        Negotiate
                      </span>
                    </div>
                  </div>

                  {/* Rate comparison */}
                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Effective Rate
                    </p>
                    <p className="mt-1 text-[18px] font-bold text-gray-900">
                      <span className="text-gray-400 line-through">
                        $85/hr
                      </span>
                      <span className="mx-2 text-gray-300">&rarr;</span>
                      <span className="text-amber-600">$72/hr</span>
                    </p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      15% rate reduction from hidden clauses
                    </p>
                  </div>
                </div>

                {/* Right: What's included */}
                <div className="p-6">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Your Report Includes
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Red flag detection with severity levels",
                      "Your real effective hourly rate",
                      "Missing clause alerts with suggested language",
                      "Ready-to-send counter-proposal text",
                      "AI-powered deep analysis",
                      "Country-specific legal context (US, India, UK, EU, AU, CA)",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[14px] text-gray-600"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA bar */}
              <div className="border-t border-gray-100 px-6 py-4">
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Try it yourself &mdash; free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          3. THE PROBLEM — with hard-hitting numbers
          ============================================================ */}
      <section className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              The problem
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Freelancers lose $14,000/year to contract fine print
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-gray-500">
              These are the hidden costs most freelancers never calculate:
            </p>
          </Fade>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {(
              [
                {
                  icon: RefreshCw,
                  title: "Unlimited Revisions",
                  stat: "+40% hours",
                  statColor: "text-red-600",
                  desc: "Sounds fair until round 12. Adds 40% unpaid hours.",
                },
                {
                  icon: Clock,
                  title: "Net-60 Payment Terms",
                  stat: "60 days wait",
                  statColor: "text-amber-600",
                  desc: "Your money sits in their account for 2 months.",
                },
                {
                  icon: X,
                  title: "No Kill Fee",
                  stat: "$0 for your work",
                  statColor: "text-red-600",
                  desc: "Client cancels mid-project. You eat the cost.",
                },
                {
                  icon: AlertTriangle,
                  title: "Scope Creep Language",
                  stat: "+$4,200 free work",
                  statColor: "text-orange-600",
                  desc: "'And other duties as assigned' is the most expensive sentence.",
                },
              ] as const
            ).map((card, i) => (
              <Fade key={card.title} delay={i * 0.05}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <card.icon className="h-5 w-5 text-gray-400" />
                    <span
                      className={`text-[15px] font-bold ${card.statColor}`}
                    >
                      {card.stat}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500">
                    {card.desc}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. HOW IT WORKS
          ============================================================ */}
      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              How it works
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Three steps. Thirty seconds.
            </h2>
          </Fade>

          <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
            {/* Dashed connecting line */}
            <div
              aria-hidden="true"
              className="absolute left-[16.6%] right-[16.6%] top-[20px] hidden border-t border-dashed border-gray-300 sm:block"
            />

            {(
              [
                {
                  step: "1",
                  icon: FileText,
                  title: "Upload or paste",
                  desc: "Drop in a PDF, DOCX, or paste text. We handle everything.",
                },
                {
                  step: "2",
                  icon: Search,
                  title: "We analyze everything",
                  desc: "48+ clause patterns, AI deep analysis, rate calculation, country-specific legal context.",
                },
                {
                  step: "3",
                  icon: BarChart3,
                  title: "Get your real rate",
                  desc: "See your score, red flags, missing clauses, and exact counter-proposal language.",
                },
              ] as const
            ).map((item, i) => (
              <Fade key={item.step} delay={i * 0.05}>
                <div className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-[14px] font-bold text-indigo-600">
                    {item.step}
                  </span>
                  <item.icon className="mt-4 h-6 w-6 text-gray-400" />
                  <h3 className="mt-3 text-[15px] font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500">
                    {item.desc}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. EVERY FEATURE — 3x3 grid
          ============================================================ */}
      <section id="features" className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Features
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Everything you get &mdash; for free
            </h2>
          </Fade>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                {
                  icon: Shield,
                  title: "Red Flag Detection",
                  desc: "Catches unlimited revisions, IP grabs, non-competes, scope creep, and 40+ more patterns.",
                },
                {
                  icon: DollarSign,
                  title: "Effective Rate Calculator",
                  desc: "See your REAL hourly rate after every hidden clause is factored in. Only dealwise does this.",
                },
                {
                  icon: AlertTriangle,
                  title: "Missing Clause Alerts",
                  desc: "Identifies protections your contract is missing — kill fees, liability caps, late payment penalties.",
                },
                {
                  icon: Sparkles,
                  title: "Counter-Proposal Language",
                  desc: "Get copy-paste-ready negotiation text for every red flag. Send it directly to your client.",
                },
                {
                  icon: Search,
                  title: "Scope Creep Detection",
                  desc: "Flags vague language like 'and other duties as assigned' before it becomes unpaid work.",
                },
                {
                  icon: BarChart3,
                  title: "AI Deep Analysis",
                  desc: "GPT-4o reads your contract like a lawyer, catching nuances that keyword matching misses.",
                },
                {
                  icon: FileText,
                  title: "PDF, DOCX, TXT Upload",
                  desc: "Upload any file format. We extract text automatically and analyze everything.",
                },
                {
                  icon: Calculator,
                  title: "6-Country Legal Context",
                  desc: "US, India, UK, EU, Australia, Canada. We know the laws that apply to your contract.",
                },
                {
                  icon: TrendingDown,
                  title: "Score 0-100",
                  desc: "Clear deal score with SIGN / NEGOTIATE / WALK AWAY recommendation.",
                },
              ] as const
            ).map((feature, i) => (
              <Fade key={feature.title} delay={i * 0.03}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                  <feature.icon className="h-5 w-5 text-indigo-500" />
                  <h3 className="mt-3 text-[15px] font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500">
                    {feature.desc}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          6. ALL YOUR TOOLS — Complete contract toolkit
          ============================================================ */}
      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Your toolkit
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Not just analysis &mdash; a complete contract toolkit
            </h2>
          </Fade>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                {
                  icon: MessageSquare,
                  title: "AI Chat",
                  desc: "Ask questions about your contract. 'What does clause 4.2 mean?' Get instant expert answers.",
                },
                {
                  icon: GitCompareArrows,
                  title: "Contract Comparison",
                  desc: "Compare two versions side-by-side. See what changed and which is better.",
                },
                {
                  icon: FileText,
                  title: "Template Library",
                  desc: "6 freelancer-friendly contract templates. Use them, customize them, protect yourself.",
                },
                {
                  icon: Layers,
                  title: "Bulk Analysis",
                  desc: "Upload multiple contracts at once. Get results for all of them.",
                },
                {
                  icon: Download,
                  title: "PDF & Word Export",
                  desc: "Download your analysis as PDF or Word document. Share with your lawyer.",
                },
                {
                  icon: GitBranch,
                  title: "Version Tracking",
                  desc: "Track how your contract improves across versions.",
                },
              ] as const
            ).map((tool, i) => (
              <Fade key={tool.title} delay={i * 0.05}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                  <tool.icon className="h-5 w-5 text-indigo-500" />
                  <h3 className="mt-3 text-[15px] font-semibold text-gray-900">
                    {tool.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500">
                    {tool.desc}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          7. WHO IT'S FOR — Persona cards
          ============================================================ */}
      <section className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Who it&apos;s for
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Built for freelancers, by freelancers
            </h2>
          </Fade>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {(
              [
                {
                  icon: Code2,
                  title: "Web Developers",
                  desc: "Catch scope creep, IP grabs, and unlimited revision traps before they cost you.",
                },
                {
                  icon: Palette,
                  title: "Designers",
                  desc: "Know your real rate after revision rounds. Get portfolio rights in every contract.",
                },
                {
                  icon: Briefcase,
                  title: "Consultants",
                  desc: "Analyze retainer agreements, hourly contracts, and day-rate deals in any currency.",
                },
              ] as const
            ).map((persona, i) => (
              <Fade key={persona.title} delay={i * 0.05}>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                  <persona.icon className="h-6 w-6 text-indigo-500" />
                  <h3 className="mt-4 text-[16px] font-semibold text-gray-900">
                    {persona.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                    {persona.desc}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          8. DEALWISE vs LAWYER — Comparison table
          ============================================================ */}
      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Why dealwise
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              DealWise vs Lawyer
            </h2>
          </Fade>

          <Fade delay={0.05}>
            <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="border-b border-gray-200 px-5 py-3 text-[13px] font-normal text-gray-400">
                      &nbsp;
                    </th>
                    <th className="border-b border-gray-200 bg-indigo-50 px-5 py-3 text-center text-[13px] font-semibold text-indigo-700">
                      dealwise
                    </th>
                    <th className="border-b border-gray-200 px-5 py-3 text-center text-[13px] font-semibold text-gray-500">
                      Lawyer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {(
                    [
                      { label: "Cost", ours: "Free", theirs: "$300-500/hr" },
                      {
                        label: "Speed",
                        ours: "30 seconds",
                        theirs: "3-5 days",
                      },
                      {
                        label: "Available",
                        ours: "24/7",
                        theirs: "Business hours",
                      },
                      {
                        label: "Language",
                        ours: "Plain English",
                        theirs: "Legalese",
                      },
                    ] as const
                  ).map((row, i) => (
                    <tr key={row.label}>
                      <td
                        className={`border-b border-gray-100 px-5 py-4 font-medium text-gray-900 ${
                          i === 3 ? "border-b-0" : ""
                        }`}
                      >
                        {row.label}
                      </td>
                      <td
                        className={`border-b border-gray-100 bg-indigo-50/50 px-5 py-4 text-center font-medium text-gray-900 ${
                          i === 3 ? "border-b-0" : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-600" />
                          {row.ours}
                        </span>
                      </td>
                      <td
                        className={`border-b border-gray-100 px-5 py-4 text-center text-gray-400 ${
                          i === 3 ? "border-b-0" : ""
                        }`}
                      >
                        {row.theirs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          9. PRICING
          ============================================================ */}
      <section id="pricing" className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Pricing
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Free during early access
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
              All features included. 50 credits on signup. No credit card
              required.
            </p>
          </Fade>

          <Fade delay={0.05}>
            <div className="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-left shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-[40px] font-bold tracking-tight text-gray-900">
                  $0
                </span>
                <span className="text-[15px] text-gray-400">/forever</span>
              </div>

              <ul className="mt-6 space-y-3">
                {[
                  "50 free credits on signup",
                  "Red flag detection",
                  "Effective rate calculator",
                  "Missing clause alerts",
                  "Counter-proposal language",
                  "Scope creep detection",
                  "AI deep analysis",
                  "PDF, DOCX, TXT upload",
                  "6-country legal context",
                  "AI chat",
                  "Contract comparison",
                  "Template library",
                  "Export & share results",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[14px] text-gray-600"
                  >
                    <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/analyze"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          10. FAQ
          ============================================================ */}
      <section className="bg-gray-50 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Fade>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              FAQ
            </p>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Common questions
            </h2>
          </Fade>

          <Fade delay={0.05}>
            <div className="mt-10 rounded-xl border border-gray-200 bg-white px-6">
              <FaqItem
                question="Is dealwise really free?"
                answer="Yes, during early access. You get 50 credits on signup. Each contract analysis uses 1 credit. All features are fully unlocked — no paywalls, no premium tiers."
              />
              <FaqItem
                question="Is my contract data safe?"
                answer="We don't store your contract text. Analysis runs and results are returned to you immediately. We never share, sell, or use your contract data for training. Your contracts stay yours."
              />
              <FaqItem
                question="How accurate is the analysis?"
                answer="Our engine uses 48+ regex patterns plus GPT-4o AI analysis. It catches things keyword matching alone would miss. That said, we recommend using dealwise as a first pass — for high-stakes contracts, always consult a lawyer too."
              />
              <FaqItem
                question="What types of contracts can I analyze?"
                answer="Freelance, consulting, design, development, hourly, retainer, project-based, day-rate — any contract where you're being paid for work. We support PDF, DOCX, and plain text formats."
              />
              <FaqItem
                question="Do I need to create an account?"
                answer="No, you can analyze 3 contracts without signing up. Create a free account to get 50 credits, save your analysis history, and access all tools like AI chat and contract comparison."
              />
              <FaqItem
                question="Can I use this for non-English contracts?"
                answer="Currently optimized for English contracts. We support 6 countries' legal contexts: US, India, UK, EU, Australia, and Canada. Multi-language support is on our roadmap."
              />
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          11. FINAL CTA
          ============================================================ */}
      <section className="bg-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Fade>
            <h2 className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]">
              Ready to know your real rate?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-gray-500">
              Upload your contract and see what you&apos;re actually getting
              paid.
            </p>
          </Fade>
          <Fade delay={0.05}>
            <div className="mt-8">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Analyze My Contract &mdash; Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          12. FOOTER
          ============================================================ */}
      <footer className="border-t border-gray-100 px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
            {/* Logo + tagline */}
            <div>
              <span className="text-[15px] font-semibold text-gray-900">
                dealwise
              </span>
              <p className="mt-1 text-[13px] text-gray-400">
                Know your real rate
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-gray-400">
              <Link
                href="/analyze"
                className="transition-colors hover:text-gray-600"
              >
                Analyze
              </Link>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-gray-600"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="transition-colors hover:text-gray-600"
              >
                Chat
              </Link>
              <Link
                href="/templates"
                className="transition-colors hover:text-gray-600"
              >
                Templates
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-gray-600"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-gray-600"
              >
                Terms
              </Link>
              <Link
                href="/api-docs"
                className="transition-colors hover:text-gray-600"
              >
                API Docs
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            <p className="text-[12px] text-gray-400">
              Built with Next.js &middot; TypeScript &middot; AI
            </p>
            <p className="text-[12px] text-gray-400">
              &copy; 2026 dealwise
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
