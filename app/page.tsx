"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Check } from "lucide-react";
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
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
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
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-gray-900 pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
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
/*  Serif style helper                                                  */
/* ================================================================== */
const serifStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif), Georgia, serif",
};

/* ================================================================== */
/*  Product Showcase tab data                                           */
/* ================================================================== */
const tabNames = [
  "Red Flag Detection",
  "Rate Calculator",
  "Negotiation Email",
  "What-If Simulator",
  "Walk Away Calculator",
  "AI Chat",
];

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function Home() {
  const { status } = useSession();

  // Rate Reveal interactive state
  const [revisionOn, setRevisionOn] = useState(false);
  const [paymentOn, setPaymentOn] = useState(false);
  const [killFeeOn, setKillFeeOn] = useState(false);

  // Product Showcase tab state
  const [activeTab, setActiveTab] = useState(0);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Rate calculation
  const baseRate = 85;
  const rate =
    baseRate -
    (revisionOn ? 13 : 0) -
    (paymentOn ? 7 : 0) -
    (killFeeOn ? 13 : 0);

  const rateColor =
    rate >= 80
      ? "text-green-600"
      : rate >= 65
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* ============================================================
          1. HERO — Asymmetric 60/40 Split
          ============================================================ */}
      <section className="bg-white px-6 pt-28 pb-20">
        <div className="mx-auto max-w-6xl">
          {/* Welcome-back banner */}
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

          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
            {/* Left 60% */}
            <div className="lg:w-[60%]">
              <Fade>
                <span className="inline-block rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[12px] font-medium text-indigo-600">
                  Free during early access &middot; 50 credits on signup
                </span>
              </Fade>

              <Fade delay={0.05}>
                <h1
                  className="mt-6 text-[40px] font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-[48px] md:text-[56px]"
                  style={serifStyle}
                >
                  Your contract says $62/hour.
                  <br />
                  You&apos;ll actually earn $24.
                </h1>
              </Fade>

              <Fade delay={0.1}>
                <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-gray-500">
                  Upload any freelance contract. In 30 seconds, see your real
                  effective rate after hidden clauses eat your earnings.
                </p>
              </Fade>

              <Fade delay={0.15}>
                <div className="mt-8">
                  <Link
                    href="/analyze"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Analyze My Contract &mdash; Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Fade>

              <Fade delay={0.2}>
                <p className="mt-4 text-[12px] text-gray-400">
                  PDF, DOCX, TXT &middot; 30-second analysis &middot; No credit
                  card
                </p>
              </Fade>
            </div>

            {/* Right 40% — Product Preview */}
            <div className="lg:w-[40%]">
              <Fade delay={0.15}>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
                  {/* Score row */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                      <svg
                        className="-rotate-90 h-16 w-16"
                        viewBox="0 0 64 64"
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="5"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${(42 / 100) * 169.6} 169.6`}
                        />
                      </svg>
                      <span className="absolute text-[18px] font-bold text-red-600">
                        42
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        Deal Score
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-red-700">
                        Walk Away
                      </span>
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Effective Rate
                    </p>
                    <p className="mt-1 text-[17px] font-bold text-gray-900">
                      <span className="text-gray-400 line-through">
                        $62/hr
                      </span>
                      <span className="mx-2 text-gray-300">&rarr;</span>
                      <span className="text-red-600">$24/hr</span>
                    </p>
                  </div>

                  {/* Red flag pills */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                      Unlimited Revisions
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                      Net-60 Payment
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                      IP Before Payment
                    </span>
                  </div>
                </div>
              </Fade>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. RATE REVEAL — Interactive Demo
          ============================================================ */}
      <section className="bg-indigo-50/30 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Fade>
            <h2
              className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
              style={serifStyle}
            >
              See what bad clauses actually cost
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
              Toggle each clause to watch your hourly rate drop in real time.
            </p>
          </Fade>

          <Fade delay={0.1}>
            <div className="mt-10">
              {/* Large rate display */}
              <p className="text-[14px] font-medium text-gray-400">
                Your Rate
              </p>
              <p
                className={`mt-1 text-[56px] font-bold tracking-tight transition-colors duration-300 ${rateColor}`}
                style={serifStyle}
              >
                ${rate}/hr
              </p>

              {/* Toggleable clauses */}
              <div className="mx-auto mt-8 max-w-md space-y-4 text-left">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={revisionOn}
                      onChange={() => setRevisionOn(!revisionOn)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 accent-indigo-600"
                    />
                    <span className="text-[14px] font-medium text-gray-700">
                      Unlimited revisions
                    </span>
                  </div>
                  {revisionOn && (
                    <span className="text-[13px] font-semibold text-red-500">
                      -$13
                    </span>
                  )}
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={paymentOn}
                      onChange={() => setPaymentOn(!paymentOn)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 accent-indigo-600"
                    />
                    <span className="text-[14px] font-medium text-gray-700">
                      Net-60 payment terms
                    </span>
                  </div>
                  {paymentOn && (
                    <span className="text-[13px] font-semibold text-red-500">
                      -$7
                    </span>
                  )}
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={killFeeOn}
                      onChange={() => setKillFeeOn(!killFeeOn)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 accent-indigo-600"
                    />
                    <span className="text-[14px] font-medium text-gray-700">
                      No kill fee
                    </span>
                  </div>
                  {killFeeOn && (
                    <span className="text-[13px] font-semibold text-red-500">
                      -$13
                    </span>
                  )}
                </label>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Upload your contract to see YOUR real rate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          3. HOW IT WORKS — Horizontal Timeline
          ============================================================ */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Fade>
            <div className="text-center">
              <h2
                className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
                style={serifStyle}
              >
                Three steps. Thirty seconds.
              </h2>
            </div>
          </Fade>

          <div className="relative mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            {/* Dashed connecting line */}
            <div
              aria-hidden="true"
              className="absolute left-[16.6%] right-[16.6%] top-[20px] hidden border-t-2 border-dashed border-gray-300 sm:block"
            />

            {[
              {
                num: "01",
                title: "Upload",
                desc: "Drop in a PDF, DOCX, or paste your contract text directly.",
              },
              {
                num: "02",
                title: "Analyze",
                desc: "Our engine scans 30+ clause patterns and calculates your real rate.",
              },
              {
                num: "03",
                title: "Act",
                desc: "Get red flags, counter-proposals, and a clear sign/negotiate/walk recommendation.",
              },
            ].map((step, i) => (
              <Fade key={step.num} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-[13px] font-bold text-white">
                    {step.num}
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                    {step.desc}
                  </p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. PRODUCT SHOWCASE — Tabbed Panel
          ============================================================ */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Fade>
            <div className="text-center">
              <h2
                className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
                style={serifStyle}
              >
                Every tool in one analysis
              </h2>
            </div>
          </Fade>

          <Fade delay={0.1}>
            <div className="mt-12 flex flex-col gap-0 overflow-hidden rounded-xl border border-gray-200 bg-white md:flex-row">
              {/* Left — Tab list (30%) */}
              <div className="border-b border-gray-200 md:w-[30%] md:border-b-0 md:border-r">
                <div className="flex md:flex-col">
                  {tabNames.map((name, i) => (
                    <button
                      key={name}
                      onClick={() => setActiveTab(i)}
                      className={`w-full px-5 py-3.5 text-left text-[13px] font-medium transition-colors ${
                        activeTab === i
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      } ${i > 0 ? "border-t border-gray-100" : ""}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right — Content panel (70%) */}
              <div className="flex-1 p-6">
                {/* Tab 0: Red Flag Detection */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      3 critical flags found
                    </p>
                    {[
                      {
                        severity: "CRITICAL",
                        title: "Unlimited Revisions",
                        quote:
                          '"The contractor shall provide unlimited revisions until the client is satisfied..."',
                        impact: "Impact: -$13/hr · Adds 40% unpaid hours",
                      },
                      {
                        severity: "HIGH",
                        title: "Net-60 Payment Terms",
                        quote:
                          '"Payment shall be rendered within sixty (60) days of invoice receipt..."',
                        impact:
                          "Impact: -$7/hr · Your money locked for 2 months",
                      },
                      {
                        severity: "HIGH",
                        title: "IP Transfer Before Payment",
                        quote:
                          '"All intellectual property rights transfer to the client upon delivery..."',
                        impact:
                          "Impact: No leverage if client refuses to pay",
                      },
                    ].map((flag) => (
                      <div
                        key={flag.title}
                        className="rounded-r-lg border-l-4 border-red-500 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-red-600">
                            {flag.severity}
                          </span>
                          <span className="text-[10px] text-gray-300">
                            &middot;
                          </span>
                          <span className="text-[13px] font-semibold text-gray-900">
                            {flag.title}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[12px] italic text-gray-400">
                          {flag.quote}
                        </p>
                        <p className="mt-1.5 text-[12px] font-medium text-red-600">
                          {flag.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 1: Rate Calculator */}
                {activeTab === 1 && (
                  <div>
                    <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Rate Breakdown
                    </p>
                    <div className="space-y-5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[14px] text-gray-500">
                          Quoted Rate
                        </span>
                        <span className="text-[24px] font-bold text-gray-900">
                          $62/hr
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[14px] text-gray-500">
                          Effective Rate
                        </span>
                        <span className="text-[24px] font-bold text-red-600">
                          $24/hr
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-gray-100 pt-4">
                        <span className="text-[14px] text-gray-500">
                          Reduction
                        </span>
                        <span className="text-[24px] font-bold text-red-600">
                          61.3%
                        </span>
                      </div>
                      {/* Rate bar */}
                      <div className="mt-2">
                        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
                            style={{ width: "38.7%" }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                          <span>$0</span>
                          <span>$24 effective</span>
                          <span>$62 quoted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Negotiation Email */}
                {activeTab === 2 && (
                  <div>
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Ready to send
                    </p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                      <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-gray-700">
{`Hi,

I've reviewed the contract and noticed a few
points I'd like to discuss before signing:

1. Unlimited Revisions (Section 3.2)
   Could we cap revisions at 2 rounds? Additional
   rounds at $62/hr.

2. Payment Terms (Section 5.1)
   Could we move from Net-60 to Net-14? This is
   more standard for freelance work.

3. IP Transfer (Section 7.3)
   Could IP transfer upon final payment rather
   than upon delivery?

Happy to discuss. These are standard industry
terms and would make the agreement fair for
both sides.

Best regards`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Tab 3: What-If Simulator */}
                {activeTab === 3 && (
                  <div>
                    <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Adjust scenarios
                    </p>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-gray-600">
                            Extra revision rounds
                          </span>
                          <span className="font-semibold text-gray-900">3</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: "30%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-gray-600">Payment delay</span>
                          <span className="font-semibold text-gray-900">
                            45 days
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: "60%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-gray-600">Scope creep</span>
                          <span className="font-semibold text-gray-900">
                            20 hrs
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: "40%" }}
                          />
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <p className="text-[12px] text-gray-400">
                          Simulated Rate
                        </p>
                        <p className="mt-1 text-[28px] font-bold text-red-600">
                          $38/hr
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Walk Away Calculator */}
                {activeTab === 4 && (
                  <div>
                    <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Financial Impact
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <p className="text-[11px] font-medium text-gray-400">
                          Expected
                        </p>
                        <p className="mt-2 text-[22px] font-bold text-gray-900">
                          $5,000
                        </p>
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                        <p className="text-[11px] font-medium text-red-400">
                          Actual
                        </p>
                        <p className="mt-2 text-[22px] font-bold text-red-600">
                          $1,920
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <p className="text-[11px] font-medium text-gray-400">
                          Lost
                        </p>
                        <p className="mt-2 text-[22px] font-bold text-amber-600">
                          $3,080
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-center text-[13px] text-gray-500">
                      Based on 80 billable hours with clause-adjusted rate
                    </p>
                  </div>
                )}

                {/* Tab 5: AI Chat */}
                {activeTab === 5 && (
                  <div>
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Ask anything about your contract
                    </p>
                    <div className="space-y-4">
                      {/* User bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5">
                          <p className="text-[13px] text-white">
                            What does clause 4.2 mean?
                          </p>
                        </div>
                      </div>
                      {/* AI bubble */}
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5">
                          <p className="text-[13px] text-gray-700">
                            This clause means the client can terminate the
                            contract without paying for completed work. This is
                            a significant red flag — you should negotiate a kill
                            fee of at least 25% of the remaining project value.
                          </p>
                        </div>
                      </div>
                      {/* User bubble */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5">
                          <p className="text-[13px] text-white">
                            How should I negotiate this?
                          </p>
                        </div>
                      </div>
                      {/* AI bubble */}
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5">
                          <p className="text-[13px] text-gray-700">
                            I&apos;d suggest proposing: &ldquo;Either party may
                            terminate with 14 days notice. Upon termination,
                            Client shall pay for all work completed to
                            date.&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          5. STATS — Large Typography
          ============================================================ */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <Fade>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              <div>
                <p
                  className="text-[48px] font-bold text-gray-900"
                  style={serifStyle}
                >
                  30+
                </p>
                <p className="mt-1 text-[14px] text-gray-500">
                  red flag patterns
                </p>
              </div>
              <div>
                <p
                  className="text-[48px] font-bold text-gray-900"
                  style={serifStyle}
                >
                  6
                </p>
                <p className="mt-1 text-[14px] text-gray-500">
                  countries&apos; legal context
                </p>
              </div>
              <div>
                <p
                  className="text-[48px] font-bold text-gray-900"
                  style={serifStyle}
                >
                  30s
                </p>
                <p className="mt-1 text-[14px] text-gray-500">
                  average analysis time
                </p>
              </div>
            </div>
            <p className="mt-8 text-[14px] text-gray-400">
              Legal context for the US, India, UK, EU, Australia, and Canada.
            </p>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          6. COMPARISON — 3-Column Table
          ============================================================ */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <Fade>
            <div className="text-center">
              <h2
                className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
                style={serifStyle}
              >
                Three ways to review a contract
              </h2>
            </div>
          </Fade>

          <Fade delay={0.1}>
            <div className="mt-12 overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full border-separate border-spacing-0 text-left text-[14px]">
                <thead>
                  <tr>
                    <th className="border-b border-gray-200 px-5 py-3 text-[13px] font-normal text-gray-400">
                      &nbsp;
                    </th>
                    <th className="border-b border-gray-200 px-5 py-3 text-center text-[13px] font-semibold text-gray-500">
                      Read It Yourself
                    </th>
                    <th className="border-b border-gray-200 bg-indigo-50 px-5 py-3 text-center text-[13px] font-semibold text-indigo-700">
                      DealWise
                    </th>
                    <th className="border-b border-gray-200 px-5 py-3 text-center text-[13px] font-semibold text-gray-500">
                      Lawyer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Cost",
                      self: "Free",
                      ours: "Free",
                      lawyer: "$300-500/hr",
                    },
                    {
                      label: "Time",
                      self: "30-60 min",
                      ours: "30 seconds",
                      lawyer: "3-5 days",
                    },
                    {
                      label: "Red Flags Caught",
                      self: "Maybe 2-3",
                      ours: "30+ patterns",
                      lawyer: "Most",
                    },
                    {
                      label: "Rate Calculation",
                      self: "None",
                      ours: "Automatic",
                      lawyer: "Manual",
                    },
                    {
                      label: "Counter-Proposals",
                      self: "None",
                      ours: "Copy-paste ready",
                      lawyer: "Custom",
                    },
                    {
                      label: "Legal Context",
                      self: "None",
                      ours: "6 countries",
                      lawyer: "Jurisdiction",
                    },
                  ].map((row, i, arr) => (
                    <tr key={row.label}>
                      <td
                        className={`px-5 py-3.5 font-medium text-gray-900 ${
                          i < arr.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        {row.label}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-center text-gray-400 ${
                          i < arr.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        {row.self}
                      </td>
                      <td
                        className={`bg-indigo-50/50 px-5 py-3.5 text-center font-medium text-gray-900 ${
                          i < arr.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-indigo-600" />
                          {row.ours}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3.5 text-center text-gray-400 ${
                          i < arr.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        {row.lawyer}
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
          7. FAQ — Accordion
          ============================================================ */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <Fade>
            <div className="text-center">
              <h2
                className="text-[28px] font-bold tracking-tight text-gray-900 md:text-[36px]"
                style={serifStyle}
              >
                Common questions
              </h2>
            </div>
          </Fade>

          <Fade delay={0.1}>
            <div className="mt-10 rounded-xl border border-gray-200 bg-white px-6">
              {[
                {
                  q: "Is dealwise really free?",
                  a: "During early access, you get 50 credits on signup. Each analysis uses 1 credit (2 with AI). All features are unlocked.",
                },
                {
                  q: "Is my contract data safe?",
                  a: "Your contract text is processed and stored securely in our database. We never share your data with third parties.",
                },
                {
                  q: "How accurate is the analysis?",
                  a: "Our engine uses 30+ regex patterns and GPT-4o AI to catch issues. It's designed to supplement, not replace, professional legal advice.",
                },
                {
                  q: "What types of contracts work?",
                  a: "Freelance, consulting, design, development, writing — any contract where you're an independent contractor.",
                },
                {
                  q: "Do I need an account?",
                  a: "You can try 3 analyses without signing up. Create an account for 50 free credits and to save your history.",
                },
              ].map((faq, i) => (
                <FaqItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          8. FINAL CTA — Indigo Banner
          ============================================================ */}
      <section className="bg-indigo-600 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Fade>
            <h2
              className="text-[28px] font-bold tracking-tight text-white md:text-[36px]"
              style={serifStyle}
            >
              Ready to know your real rate?
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-indigo-100">
              Upload your contract. See your analysis in 30 seconds.
            </p>
          </Fade>
          <Fade delay={0.05}>
            <div className="mt-8">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[15px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                Analyze My Contract &mdash; Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-[12px] text-indigo-200">
              50 credits on signup &middot; No credit card required
            </p>
          </Fade>
        </div>
      </section>

      {/* ============================================================
          9. FOOTER
          ============================================================ */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-[13px] text-gray-400">
            &copy; 2026 dealwise
          </span>
          <div className="flex items-center gap-5 text-[13px] text-gray-400">
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
              href="/contact"
              className="transition-colors hover:text-gray-600"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
