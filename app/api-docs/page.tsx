'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Code2, Zap, Shield, Clock } from 'lucide-react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="relative rounded-xl border border-gray-200 bg-[#1E1E2E] text-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium text-white/40">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-white/80">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">API Documentation</h1>
          </div>
          <p className="max-w-2xl text-gray-400">
            Integrate DealWise contract analysis into your own applications. Our REST API is free to use during early access.
          </p>
        </div>

        {/* Info Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Zap className="mb-3 h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Free During Early Access</h3>
            <p className="mt-1 text-xs text-gray-500">No API key required. All endpoints are open.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Shield className="mb-3 h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900">No Authentication</h3>
            <p className="mt-1 text-xs text-gray-500">No signup or tokens needed. Just POST and go.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Clock className="mb-3 h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-gray-900">Rate Limited</h3>
            <p className="mt-1 text-xs text-gray-500">10 requests per minute per IP address.</p>
          </div>
        </div>

        {/* Endpoint */}
        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">POST</span>
              <code className="text-sm font-semibold text-gray-900">/api/analyze</code>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Analyzes a freelance contract and returns a detailed risk assessment including an overall score, effective hourly rate calculation, red flags, missing clauses, and actionable suggestions.
            </p>

            {/* Request Body */}
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Request Body</h3>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">Field</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Required</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {[
                    { field: 'contractText', type: 'string', required: true, desc: 'The full text of the contract (max 50,000 characters)' },
                    { field: 'projectScope', type: 'string', required: true, desc: 'Description of the work being contracted' },
                    { field: 'quotedPrice', type: 'number', required: false, desc: 'Total quoted price (optional — auto-detected from contract text if omitted)' },
                    { field: 'estimatedHours', type: 'number', required: false, desc: 'Estimated hours (optional — auto-detected from contract text if omitted)' },
                    { field: 'currency', type: 'string', required: true, desc: 'Currency code: USD, EUR, GBP, INR, AUD, CAD' },
                    { field: 'country', type: 'string', required: false, desc: 'Country code for legal context: US, IN, GB, EU, AU, CA' },
                    { field: 'claudeApiKey', type: 'string', required: false, desc: 'Your Claude API key for AI-enhanced analysis' },
                  ].map((row) => (
                    <tr key={row.field} className="border-b border-gray-200">
                      <td className="px-4 py-2.5"><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">{row.field}</code></td>
                      <td className="px-4 py-2.5 text-xs">{row.type}</td>
                      <td className="px-4 py-2.5 text-xs">{row.required ? <span className="font-semibold text-red-600">Yes</span> : 'No'}</td>
                      <td className="px-4 py-2.5 text-xs">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Response Schema */}
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Response Schema</h3>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">Field</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {[
                    { field: 'overallScore', type: 'number', desc: 'Deal score from 0-100 (higher is better)' },
                    { field: 'effectiveHourlyRate', type: 'number', desc: 'Your real hourly rate after all contract impacts' },
                    { field: 'nominalHourlyRate', type: 'number', desc: 'Your quoted hourly rate (price / hours)' },
                    { field: 'rateReduction', type: 'number', desc: 'Percentage by which your rate is reduced' },
                    { field: 'recommendation', type: 'string', desc: '"sign" | "negotiate" | "walk_away"' },
                    { field: 'summary', type: 'string', desc: 'Human-readable analysis summary' },
                    { field: 'redFlags', type: 'RedFlag[]', desc: 'Array of detected red flags with severity, clause, issue, impact, suggestion' },
                    { field: 'greenFlags', type: 'GreenFlag[]', desc: 'Array of positive contract clauses' },
                    { field: 'missingClauses', type: 'MissingClause[]', desc: 'Array of missing protections with suggested language' },
                    { field: 'scopeRisks', type: 'ScopeRisk[]', desc: 'Array of scope creep risks with likelihood' },
                    { field: 'aiInsights', type: 'string?', desc: 'AI-generated deep analysis (requires Claude API key)' },
                    { field: 'countryContext', type: 'string?', desc: 'Country-specific legal context' },
                  ].map((row) => (
                    <tr key={row.field} className="border-b border-gray-200">
                      <td className="px-4 py-2.5"><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">{row.field}</code></td>
                      <td className="px-4 py-2.5 text-xs">{row.type}</td>
                      <td className="px-4 py-2.5 text-xs">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Error Responses */}
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Error Responses</h3>
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {[
                    { status: '400', desc: 'Missing required fields, invalid input, or contract text too long' },
                    { status: '429', desc: 'Rate limit exceeded (10 req/min). Try again in a minute.' },
                    { status: '500', desc: 'Internal server error. Please try again.' },
                  ].map((row) => (
                    <tr key={row.status} className="border-b border-gray-200">
                      <td className="px-4 py-2.5"><span className="rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">{row.status}</span></td>
                      <td className="px-4 py-2.5 text-xs">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Example Request */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Example Request</h3>
            <CodeBlock
              language="bash"
              code={`curl -X POST https://dealwise.app/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "contractText": "This Agreement is entered into between Client Corp and Freelancer. The Freelancer agrees to deliver a website redesign project. Payment of $5,000 will be made net-60 after project completion. The Freelancer grants unlimited revisions until Client is satisfied. All intellectual property created becomes property of Client Corp.",
    "projectScope": "Website redesign with 5 pages and CMS integration",
    "quotedPrice": 5000,
    "estimatedHours": 80,
    "currency": "USD"
  }'`}
            />
          </section>

          {/* Example Response */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Example Response</h3>
            <CodeBlock
              language="json"
              code={`{
  "overallScore": 35,
  "effectiveHourlyRate": 38.46,
  "nominalHourlyRate": 62.50,
  "rateReduction": 38.5,
  "recommendation": "negotiate",
  "summary": "This contract has several significant red flags...",
  "redFlags": [
    {
      "severity": "critical",
      "clause": "unlimited revisions until Client is satisfied",
      "issue": "Unlimited revisions with no cap",
      "impact": "Could add 20-40+ hours of unpaid work",
      "hourlyRateImpact": 15.63,
      "suggestion": "Replace with: Up to 3 rounds of revisions..."
    }
  ],
  "greenFlags": [],
  "missingClauses": [
    {
      "name": "Kill Fee / Cancellation Clause",
      "importance": "critical",
      "description": "No protection if client cancels mid-project",
      "suggestedLanguage": "Either party may terminate..."
    }
  ],
  "scopeRisks": [
    {
      "risk": "Website redesign scope is vague",
      "likelihood": "high",
      "potentialCost": "20-40 additional hours"
    }
  ]
}`}
            />
          </section>

          {/* Rate Limits */}
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="mb-2 text-sm font-semibold text-amber-800">Rate Limits</h3>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>10 requests per minute per IP address</li>
              <li>Maximum contract text length: 50,000 characters</li>
              <li>Maximum file upload size: 5MB (via /api/parse-pdf endpoint)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
