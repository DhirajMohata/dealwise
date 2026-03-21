import type { AnalysisInput, AnalysisResult, RedFlag, MissingClause } from "./analyzer";

// Country-specific legal context
const COUNTRY_CONTEXTS: Record<string, {
  name: string;
  notes: string[];
  defaultPaymentNorm: string;
  ipDefaultRule: string;
  nonCompeteEnforceability: string;
}> = {
  US: {
    name: "United States",
    notes: [
      "In the US, non-compete clauses are increasingly unenforceable — the FTC has proposed a ban on most non-competes.",
      "IP defaults to the creator unless explicitly assigned in writing (Copyright Act, Section 201).",
      "Independent contractors are NOT employees — be sure the contract doesn't create an employment relationship (IRS 20-factor test).",
      "'Work for hire' only applies to specific categories unless explicitly agreed in a signed writing.",
    ],
    defaultPaymentNorm: "Net-30 is standard; Net-15 is ideal for freelancers.",
    ipDefaultRule: "Creator retains IP unless assigned in writing.",
    nonCompeteEnforceability: "Varies by state. California, Oklahoma, North Dakota, and Minnesota ban most non-competes. Many other states are restricting them.",
  },
  IN: {
    name: "India",
    notes: [
      "Non-compete clauses post-termination are generally unenforceable in India under Section 27 of the Indian Contract Act.",
      "IP in commissioned work belongs to the author under Indian Copyright Act 1957, unless assigned in writing.",
      "GST implications: Freelancers earning above ₹20 lakh annually must register for GST.",
      "Arbitration clauses are governed by the Arbitration and Conciliation Act, 1996.",
      "Payment delays are common — consider requiring 50% upfront for Indian clients.",
    ],
    defaultPaymentNorm: "Net-30 is standard. Always insist on upfront deposit (30-50%).",
    ipDefaultRule: "Author retains copyright unless assigned in writing.",
    nonCompeteEnforceability: "Post-termination non-competes are largely unenforceable under Indian law.",
  },
  GB: {
    name: "United Kingdom",
    notes: [
      "IR35 rules may apply — ensure the contract doesn't create a 'disguised employment' relationship.",
      "Non-compete clauses must be 'reasonable' in scope and duration to be enforceable.",
      "Late Payment of Commercial Debts Act gives you the right to charge 8% + Bank of England base rate on late invoices.",
      "GDPR applies — if handling personal data, ensure a Data Processing Agreement is included.",
    ],
    defaultPaymentNorm: "Net-30 is standard. The Late Payment Act protects freelancers.",
    ipDefaultRule: "Creator retains IP unless assigned. Moral rights cannot be transferred.",
    nonCompeteEnforceability: "Enforceable only if reasonable in duration (typically 6-12 months max) and geographic scope.",
  },
  EU: {
    name: "European Union",
    notes: [
      "GDPR compliance is mandatory if processing EU citizens' personal data.",
      "Consumer protection laws may apply depending on the client type.",
      "Non-compete enforceability varies by member state — generally more restrictive than the US.",
      "Payment terms: EU Late Payment Directive allows interest on invoices overdue past 30 days.",
    ],
    defaultPaymentNorm: "Net-30 is the legal default under the EU Late Payment Directive.",
    ipDefaultRule: "Varies by member state, but creators generally retain rights unless explicitly assigned.",
    nonCompeteEnforceability: "Varies by country. Generally must be limited in scope, duration, and geography.",
  },
  AU: {
    name: "Australia",
    notes: [
      "Independent contractor vs employee distinction is critical — sham contracting is illegal under the Fair Work Act.",
      "Non-compete clauses must be 'reasonable' to be enforceable.",
      "Australian Consumer Law (ACL) may provide additional protections.",
      "GST applies above AUD 75,000 annual turnover.",
    ],
    defaultPaymentNorm: "Net-14 to Net-30 is typical.",
    ipDefaultRule: "Creator retains IP unless assigned in writing.",
    nonCompeteEnforceability: "Must be reasonable in duration and scope. Courts regularly strike down overly broad restraints.",
  },
  CA: {
    name: "Canada",
    notes: [
      "Non-compete clauses are heavily restricted in Ontario (Working for Workers Act, 2021).",
      "IP defaults to the creator under the Copyright Act unless assigned.",
      "HST/GST registration required above CAD 30,000 annually.",
      "Provincial variations exist — employment standards differ by province.",
    ],
    defaultPaymentNorm: "Net-30 is standard.",
    ipDefaultRule: "Creator retains copyright unless explicitly assigned in writing.",
    nonCompeteEnforceability: "Banned in Ontario for most workers. Other provinces require reasonableness.",
  },
};

function getCountryContext(currency: string, country?: string): string {
  const code = country || currencyToCountry(currency);
  const ctx = COUNTRY_CONTEXTS[code];
  if (!ctx) return "";

  let text = `\n\n📍 **Legal Context for ${ctx.name}:**\n`;
  text += `• Payment norm: ${ctx.defaultPaymentNorm}\n`;
  text += `• IP default: ${ctx.ipDefaultRule}\n`;
  text += `• Non-compete: ${ctx.nonCompeteEnforceability}\n`;
  ctx.notes.forEach(note => {
    text += `• ${note}\n`;
  });
  return text;
}

function currencyToCountry(currency: string): string {
  const map: Record<string, string> = {
    USD: "US", EUR: "EU", GBP: "GB", INR: "IN", AUD: "AU", CAD: "CA",
  };
  return map[currency] || "US";
}

// ============================================================
// AI Provider Detection
// ============================================================

function getAIProvider(): { provider: 'openai' | 'anthropic'; key: string } | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (openaiKey) return { provider: 'openai', key: openaiKey };
  if (anthropicKey) return { provider: 'anthropic', key: anthropicKey };
  return null;
}

// ============================================================
// Expert System Prompt — Role, Methodology, Risk Framework
// ============================================================

const SYSTEM_PROMPT = `You are an expert contract risk analyst specializing in freelancer and independent contractor agreements. You have 15 years of experience reviewing contracts across US, UK, EU, Indian, Australian, and Canadian jurisdictions.

METHODOLOGY:
1. Read the entire contract carefully, identifying each party and their obligations
2. For each clause, assess: Is this fair to the freelancer? What is the financial risk?
3. Flag clauses that are one-sided, ambiguous, or missing standard protections
4. Always cite the exact section number or quote the exact text you are referencing
5. Quantify financial impact where possible (e.g., "adds ~20% unpaid hours")

SEVERITY DEFINITIONS:
- critical: Will cause direct financial loss or legal liability. Examples: unlimited revisions with no cap, IP transfer before payment, termination without payment for completed work, unlimited liability
- high: Creates significant risk that could cost money. Examples: net-60+ payment delay, broad non-compete (>12 months), one-sided indemnification, no kill fee
- medium: Suboptimal but manageable with awareness. Examples: net-30 payment (standard but not ideal), confidentiality without time limit, vague scope language
- low: Minor concern, good to fix but not urgent. Examples: missing governing law, no force majeure clause

CRITICAL RULES — READ CAREFULLY:
- Do NOT flag standard acceptable practices as red flags:
  * "Contractor is an independent contractor" is GOOD, not a red flag
  * "IP transfers to Client upon receipt of full payment" is the FREELANCER-FRIENDLY approach — do NOT flag this
  * "Contractor retains pre-existing IP" is standard and good
  * Reasonable confidentiality (2-5 years) is standard
  * Mutual indemnification is fair and balanced
- Do NOT duplicate findings already detected by the automated system (listed in the user message)
- ONLY report findings you can support with specific text from the contract
- For each finding, ALWAYS include the exact quote from the contract text
- Focus on subtle risks that simple keyword matching would miss: implied obligations, ambiguous scope boundaries, hidden cost triggers, jurisdiction-specific issues
- If the contract is genuinely good and well-drafted, say so — do not invent problems`;

// ============================================================
// JSON Schema for Structured Output (100% guaranteed valid JSON)
// ============================================================

const ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    additionalRedFlags: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          severity: { type: "string" as const, enum: ["critical", "high", "medium", "low"] },
          clause: { type: "string" as const, description: "Exact quote from contract text" },
          issue: { type: "string" as const, description: "What is wrong, in plain English" },
          impact: { type: "string" as const, description: "Financial or legal impact on freelancer" },
          hourlyRateImpact: { type: "number" as const, description: "Estimated dollar per hour reduction, 0 if not quantifiable" },
          suggestion: { type: "string" as const, description: "Counter-proposal language the freelancer can send" },
        },
        required: ["severity", "clause", "issue", "impact", "hourlyRateImpact", "suggestion"] as const,
        additionalProperties: false,
      },
    },
    additionalMissingClauses: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          importance: { type: "string" as const, enum: ["critical", "important", "nice_to_have"] },
          description: { type: "string" as const },
          suggestedLanguage: { type: "string" as const },
        },
        required: ["name", "importance", "description", "suggestedLanguage"] as const,
        additionalProperties: false,
      },
    },
    overallAssessment: { type: "string" as const, description: "2-3 paragraph plain-English analysis from a freelancer perspective" },
    negotiationPriorities: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Top 3 things to negotiate first, in priority order",
    },
    contractQuality: {
      type: "string" as const,
      enum: ["excellent", "good", "fair", "poor", "dangerous"],
      description: "Overall contract quality from the freelancer perspective",
    },
  },
  required: ["additionalRedFlags", "additionalMissingClauses", "overallAssessment", "negotiationPriorities", "contractQuality"] as const,
  additionalProperties: false,
};

// ============================================================
// Build User Prompt (contract-specific, includes regex findings for dedup)
// ============================================================

function buildUserPrompt(input: AnalysisInput, baseResult: AnalysisResult): string {
  return `Analyze this freelance contract. The automated system already found the issues listed below — do NOT repeat them. Only find ADDITIONAL issues the automated system missed.

CONTRACT TEXT:
---
${input.contractText}
---

PROJECT CONTEXT:
- Scope: ${input.projectScope || "Not specified"}
- Quoted Price: ${input.currency} ${input.quotedPrice || "Not specified"}
- Estimated Hours: ${input.estimatedHours || "Not specified"}
- Currency: ${input.currency}
- Effective Hourly Rate: ${input.currency} ${baseResult.effectiveHourlyRate.toFixed(2)} (nominal: ${baseResult.nominalHourlyRate.toFixed(2)}, ${baseResult.rateReduction.toFixed(1)}% reduction)

ALREADY DETECTED BY AUTOMATED SYSTEM (do NOT duplicate these):
Red Flags:
${baseResult.redFlags.map(f => `- [${f.severity}] ${f.issue}`).join("\n") || "- None detected"}

Missing Clauses:
${baseResult.missingClauses.map(m => `- [${m.importance}] ${m.name}`).join("\n") || "- None detected"}

Green Flags (positive terms found):
${baseResult.greenFlags.map(g => `- ${g.benefit}`).join("\n") || "- None detected"}

Find ONLY additional issues, missing protections, and subtle risks that the automated keyword-based system could not detect. Focus on: implied obligations, ambiguous language, hidden cost triggers, jurisdiction-specific concerns, and clauses that interact with each other to create risk.`;
}

// ============================================================
// OpenAI Call with Structured Output
// ============================================================

async function callOpenAIStructured(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "contract_analysis",
          strict: true,
          schema: ANALYSIS_SCHEMA,
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

// ============================================================
// Anthropic Call (fallback — no structured output, uses prompt-based JSON)
// ============================================================

async function callAnthropicFallback(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt + "\n\nRespond with ONLY valid JSON matching this structure: {additionalRedFlags: [...], additionalMissingClauses: [...], overallAssessment: string, negotiationPriorities: string[], contractQuality: string}" }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || "{}";
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
}

// ============================================================
// Transform AI Response to Our Format
// ============================================================

function transformAIResponse(parsed: Record<string, unknown>): {
  aiInsights: string;
  extraRedFlags: RedFlag[];
  extraMissing: MissingClause[];
} {
  const flags = (parsed.additionalRedFlags as Array<Record<string, unknown>>) || [];
  const missing = (parsed.additionalMissingClauses as Array<Record<string, unknown>>) || [];
  const assessment = (parsed.overallAssessment as string) || "";
  const priorities = (parsed.negotiationPriorities as string[]) || [];
  const quality = (parsed.contractQuality as string) || "";

  // Build insights from assessment + priorities + quality
  let insights = assessment;
  if (priorities.length > 0) {
    insights += "\n\n**Negotiation Priorities (in order of impact):**\n" +
      priorities.map((p, i) => `${i + 1}. ${p}`).join("\n");
  }
  if (quality) {
    insights += `\n\n**Overall Contract Quality:** ${quality.charAt(0).toUpperCase() + quality.slice(1)}`;
  }

  return {
    aiInsights: insights,
    extraRedFlags: flags.map((f) => ({
      severity: (f.severity as string) || "medium",
      clause: (f.clause as string) || "",
      issue: `🤖 AI: ${f.issue || ""}`,
      impact: (f.impact as string) || "",
      hourlyRateImpact: Number(f.hourlyRateImpact) || 0,
      suggestion: (f.suggestion as string) || "",
    })) as RedFlag[],
    extraMissing: missing.map((m) => ({
      name: (m.name as string) || "",
      importance: (m.importance as string) || "important",
      description: `🤖 AI: ${m.description || ""}`,
      suggestedLanguage: (m.suggestedLanguage as string) || "",
    })) as MissingClause[],
  };
}

// ============================================================
// Main Entry Point — AI-Enhanced Analysis
// ============================================================

export async function enhanceWithAI(
  input: AnalysisInput,
  baseResult: AnalysisResult,
  manualApiKey?: string
): Promise<{ aiInsights: string; extraRedFlags: RedFlag[]; extraMissing: MissingClause[] }> {
  const userPrompt = buildUserPrompt(input, baseResult);

  // Determine which provider + key to use
  let provider: "openai" | "anthropic";
  let apiKey: string;

  if (manualApiKey) {
    provider = manualApiKey.startsWith("sk-ant-") ? "anthropic" : "openai";
    apiKey = manualApiKey;
  } else {
    const envProvider = getAIProvider();
    if (!envProvider) throw new Error("No AI API key available");
    provider = envProvider.provider;
    apiKey = envProvider.key;
  }

  // Call the appropriate provider
  const parsed = provider === "openai"
    ? await callOpenAIStructured(SYSTEM_PROMPT, userPrompt, apiKey)
    : await callAnthropicFallback(SYSTEM_PROMPT, userPrompt, apiKey);

  return transformAIResponse(parsed);
}

export { getCountryContext, getAIProvider, COUNTRY_CONTEXTS, currencyToCountry };
