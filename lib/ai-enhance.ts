import type { AnalysisInput, AnalysisResult, RedFlag, MissingClause } from "./analyzer";

// ============================================================
// AI Analysis Result Interface
// ============================================================

export interface AIAnalysisResult {
  aiInsights: string;
  extraRedFlags: RedFlag[];
  extraGreenFlags: Array<{ clause: string; benefit: string }>;
  extraMissing: MissingClause[];
  detectedInfo: {
    contractType: string;
    totalPrice: number | null;
    hourlyRate: number | null;
    currency: string;
    paymentTerms: string;
    clientName: string;
    contractorName: string;
    jurisdiction: string;
  };
  contractQuality: string;
  suggestedScore: number;
  negotiationPriorities: string[];
}

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
- critical: Will cause direct financial loss or legal liability. Examples: unlimited revisions with no cap, IP transfer before payment, termination without payment for completed work, unlimited liability, work for hire with no payment guarantee
- high: Creates significant risk that could cost money. Examples: net-60+ payment delay, broad non-compete (>12 months or worldwide), one-sided indemnification, no kill fee, vague/unlimited scope, exclusivity without adequate compensation
- medium: Suboptimal but manageable with awareness. Examples: net-30 payment (standard but not ideal), confidentiality without time limit, one-sided termination terms
- low: Minor concern, good to fix but not urgent. Examples: missing governing law, no force majeure clause

CRITICAL RULES — READ CAREFULLY:
- Do NOT flag standard acceptable practices as red flags:
  * "Contractor is an independent contractor" is GOOD, not a red flag
  * "IP transfers to Client upon receipt of full payment" is the FREELANCER-FRIENDLY approach — do NOT flag this
  * "Contractor retains pre-existing IP" is standard and good
  * Reasonable confidentiality (2-5 years) is standard
  * Mutual indemnification is fair and balanced
  * Reasonable non-solicitation (6-12 months, mutual) is standard — do NOT flag as "non-compete"
  * In ghostwriting contracts, no author credit is STANDARD practice — do NOT flag ghostwriting-specific norms as red flags
- A "non-compete" and a "non-solicitation" are DIFFERENT things. Only flag actual non-compete clauses (restrictions on doing similar work for other clients). Non-solicitation (not poaching employees) is standard and acceptable.
- ONLY report findings you can support with specific text from the contract
- For each finding, ALWAYS include the exact quote from the contract text
- Focus on subtle risks that simple keyword matching would miss: implied obligations, ambiguous scope boundaries, hidden cost triggers, jurisdiction-specific issues
- If the contract is genuinely good and well-drafted, say so — do not invent problems

MUST-DETECT RED FLAGS (always flag these if present):
- "unlimited revisions" or revisions with no cap → CRITICAL
- Non-compete clause >6 months or with broad/worldwide scope → HIGH or CRITICAL
- Scope creep language: "as needed", "from time to time", "as directed", "and other tasks", "including but not limited to" followed by open-ended obligations → HIGH
- No deposit/advance with 100% on completion → MEDIUM
- Net-60 or longer payment terms → HIGH
- Net-90+ → CRITICAL
- IP transfers before payment or "upon creation" → CRITICAL
- One-sided termination (client can terminate anytime, contractor cannot) → HIGH
- Unlimited liability or no liability cap → HIGH
- Penalty clauses for late delivery → MEDIUM
- Exclusivity without proportional compensation → HIGH
- "work for hire" combined with below-market rates → HIGH
- Employment relationship disguised as contractor → CRITICAL
- Vague/undefined scope of work → HIGH

EXTRACTION REQUIREMENTS:
- Extract the contract type (fixed-price, hourly, retainer, milestone, day-rate, per-unit, revenue-share)
- Extract the total price or hourly rate if mentioned
- Extract the currency from symbols used in the contract: $ = USD, £ = GBP, € = EUR, ₹ or Rs. = INR, A$ = AUD, C$ = CAD. Default to USD if no currency symbols found.
- Extract payment terms (Net-30, Net-60, milestone-based, upon completion, etc.)
- Extract party names (client and contractor)
- Detect the likely jurisdiction from governing law or party addresses
- Provide a suggested deal score from 0-100 based on your assessment

SCORING SYSTEM — FOLLOW PRECISELY:
Evaluate all red flags and green flags, then calculate a final score from 0 to 100. Use the penalty/bonus system below as guidance:

PENALTIES (subtract from score):
- Each CRITICAL red flag: -15 to -25 points
- Each HIGH red flag: -8 to -12 points
- Each MEDIUM red flag: -3 to -5 points
- Each missing critical protection (no payment terms, no IP clause, no termination clause): -10 points
- Each missing important protection (no liability cap, no dispute resolution): -5 points
- Vague or undefined scope: -15 points
- No deposit AND 100% payment on completion: -10 points
- Unlimited revisions: -20 points
- Non-compete >12 months or worldwide: -20 points

BONUSES (add to score):
- Deposit/advance payment: +5 points
- Kill fee or termination protection: +5 points
- Capped revisions (2-3 rounds): +3 points
- IP transfers on payment (not on creation): +5 points
- Milestone payments: +5 points
- Mutual indemnification: +5 points
- Mediation/arbitration clause: +3 points
- Liability cap: +3 points
- Portfolio rights retained: +2 points
- Net-14 or better payment terms: +3 points

SCORE RANGES (final score must fall in appropriate range):
- 85-100: Excellent — deposit, kill fee, capped revisions, IP on payment, mutual terms, liability cap, dispute resolution. Very few or no concerns.
- 65-84: Good — most protections present, no critical red flags, maybe 1-2 medium issues.
- 45-64: Fair/Negotiate — some significant gaps or 1-2 high-severity issues. Needs negotiation before signing.
- 25-44: Poor — multiple high-severity flags, missing critical protections. Significant rewrite needed.
- 0-24: Dangerous — critical red flags (unlimited revisions, no payment protection, one-sided terms, exploitative). Walk away or completely rewrite.

CALIBRATION EXAMPLES:
- A contract with unlimited revisions, no deposit, Net-90, and one-sided termination = 0-10
- A contract with 2-year worldwide non-compete and IP on creation = 15-25
- A platform contract (Deel, Toptal, Upwork style) with slightly client-favoring terms = 50-62
- A contract with vague scope ("as needed", "other tasks as assigned") and no deposit = 35-50
- A contract with Net-30, no kill fee, but otherwise fair = 55-65
- A contract with deposit, capped revisions, milestone payments, IP on payment = 80-92
- A contract with all protections (deposit, kill fee, mutual indemnification, capped revisions, IP on payment, liability cap, mediation) = 88-98

STACKING RULE — THIS IS MANDATORY:
- A contract with 2+ CRITICAL red flags: score MUST be 0-15. No exceptions.
- A contract with 3+ CRITICAL red flags: score MUST be 0-10.
- A contract with 5+ CRITICAL red flags: score MUST be 0-5.
- A contract with 1 CRITICAL + 2 HIGH red flags: score MUST be below 30.
- Count every distinct problem separately — do not group them or minimize them.
- DO NOT give a score of 50 to terrible contracts. A score of 50 means "fair contract with some issues" — if a contract has unlimited revisions, no payment protection, or exploitative terms, it should score BELOW 20.

SCOPE CREEP DETECTION: Look for these patterns that indicate scope creep risk:
- "including but not limited to" followed by an open-ended list
- "as needed", "from time to time", "as directed by Client"
- "other tasks as reasonably requested" or "other duties as assigned"
- "various other [activities/tasks]" or "any other [work] as needed"
- General IT support or troubleshooting added to a specific project scope
These should be flagged as HIGH severity with issue text containing "scope creep".

IMPORTANT: Do NOT default to 75. A score of 75 means "good contract with only minor issues." Most contracts have real issues that should bring them below 65.`;

// ============================================================
// JSON Schema for Structured Output (100% guaranteed valid JSON)
// ============================================================

const ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    detectedInfo: {
      type: "object" as const,
      properties: {
        contractType: { type: "string" as const },
        totalPrice: { type: "number" as const, description: "Total price in contract, or 0 if not found" },
        hourlyRate: { type: "number" as const, description: "Hourly rate in contract, or 0 if not found" },
        currency: { type: "string" as const },
        paymentTerms: { type: "string" as const },
        clientName: { type: "string" as const },
        contractorName: { type: "string" as const },
        jurisdiction: { type: "string" as const },
      },
      required: ["contractType", "totalPrice", "hourlyRate", "currency", "paymentTerms", "clientName", "contractorName", "jurisdiction"] as const,
      additionalProperties: false,
    },
    allRedFlags: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          severity: { type: "string" as const, enum: ["critical", "high", "medium", "low"] },
          clause: { type: "string" as const },
          issue: { type: "string" as const },
          impact: { type: "string" as const },
          hourlyRateImpact: { type: "number" as const },
          suggestion: { type: "string" as const },
        },
        required: ["severity", "clause", "issue", "impact", "hourlyRateImpact", "suggestion"] as const,
        additionalProperties: false,
      },
    },
    allGreenFlags: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          clause: { type: "string" as const },
          benefit: { type: "string" as const },
        },
        required: ["clause", "benefit"] as const,
        additionalProperties: false,
      },
    },
    allMissingClauses: {
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
    overallAssessment: { type: "string" as const },
    negotiationPriorities: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    contractQuality: {
      type: "string" as const,
      enum: ["excellent", "good", "fair", "poor", "dangerous"],
    },
    suggestedScore: {
      type: "number" as const,
      description: "Suggested deal score from 0-100",
    },
  },
  required: ["detectedInfo", "allRedFlags", "allGreenFlags", "allMissingClauses", "overallAssessment", "negotiationPriorities", "contractQuality", "suggestedScore"] as const,
  additionalProperties: false,
};

// ============================================================
// Build User Prompt — Full contract analysis (AI-first)
// ============================================================

function buildUserPrompt(input: AnalysisInput, _baseResult: AnalysisResult): string {
  return `Analyze this freelance/contractor agreement completely. Extract all information, identify all risks, and provide a comprehensive assessment.

CONTRACT TEXT:
---
${input.contractText}
---

${input.projectScope ? `PROJECT CONTEXT: ${input.projectScope}` : ''}
${input.quotedPrice ? `QUOTED PRICE: ${input.currency || 'USD'} ${input.quotedPrice}` : ''}
${input.estimatedHours ? `ESTIMATED HOURS: ${input.estimatedHours}` : ''}

Provide your complete analysis including all red flags, green flags, missing protections, detected contract information, and a suggested score.`;
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
      max_tokens: 6000,
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
      messages: [{ role: "user", content: userPrompt + "\n\nRespond with ONLY valid JSON matching this structure: {detectedInfo: {contractType, totalPrice, hourlyRate, currency, paymentTerms, clientName, contractorName, jurisdiction}, allRedFlags: [{severity, clause, issue, impact, hourlyRateImpact, suggestion}], allGreenFlags: [{clause, benefit}], allMissingClauses: [{name, importance, description, suggestedLanguage}], overallAssessment: string, negotiationPriorities: string[], contractQuality: string, suggestedScore: number}" }],
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

function transformAIResponse(parsed: Record<string, unknown>): AIAnalysisResult {
  const flags = (parsed.allRedFlags as Array<Record<string, unknown>>) || [];
  const greenFlags = (parsed.allGreenFlags as Array<Record<string, unknown>>) || [];
  const missing = (parsed.allMissingClauses as Array<Record<string, unknown>>) || [];
  const assessment = (parsed.overallAssessment as string) || "";
  const priorities = (parsed.negotiationPriorities as string[]) || [];
  const quality = (parsed.contractQuality as string) || "";
  const suggestedScore = parsed.suggestedScore != null ? Number(parsed.suggestedScore) : 50;
  const detectedInfoRaw = (parsed.detectedInfo as Record<string, unknown>) || {};

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
    extraGreenFlags: greenFlags.map((g) => ({
      clause: (g.clause as string) || "",
      benefit: (g.benefit as string) || "",
    })),
    extraMissing: missing.map((m) => ({
      name: (m.name as string) || "",
      importance: (m.importance as string) || "important",
      description: `🤖 AI: ${m.description || ""}`,
      suggestedLanguage: (m.suggestedLanguage as string) || "",
    })) as MissingClause[],
    detectedInfo: {
      contractType: (detectedInfoRaw.contractType as string) || "unknown",
      totalPrice: detectedInfoRaw.totalPrice != null ? Number(detectedInfoRaw.totalPrice) : null,
      hourlyRate: detectedInfoRaw.hourlyRate != null ? Number(detectedInfoRaw.hourlyRate) : null,
      currency: (detectedInfoRaw.currency as string) || "USD",
      paymentTerms: (detectedInfoRaw.paymentTerms as string) || "Not specified",
      clientName: (detectedInfoRaw.clientName as string) || "Unknown",
      contractorName: (detectedInfoRaw.contractorName as string) || "Unknown",
      jurisdiction: (detectedInfoRaw.jurisdiction as string) || "Unknown",
    },
    contractQuality: quality || "fair",
    suggestedScore,
    negotiationPriorities: priorities,
  };
}

// ============================================================
// Main Entry Point — AI-First Full Contract Analysis
// ============================================================

export async function enhanceWithAI(
  input: AnalysisInput,
  baseResult: AnalysisResult,
  manualApiKey?: string
): Promise<AIAnalysisResult> {
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
