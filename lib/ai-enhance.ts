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

// Detect which AI provider to use based on available keys
function getAIProvider(): { provider: 'openai' | 'anthropic'; key: string } | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (openaiKey) return { provider: 'openai', key: openaiKey };
  if (anthropicKey) return { provider: 'anthropic', key: anthropicKey };
  return null;
}

function buildPrompt(input: AnalysisInput, baseResult: AnalysisResult): string {
  return `You are a senior contract lawyer specializing in freelancer/independent contractor agreements. Analyze this contract and provide insights that regex-based analysis might miss.

CONTRACT TEXT:
${input.contractText}

PROJECT SCOPE:
${input.projectScope}

QUOTED PRICE: ${input.currency} ${input.quotedPrice}
ESTIMATED HOURS: ${input.estimatedHours}

The automated analysis already found these issues:
${baseResult.redFlags.map(f => `- [${f.severity}] ${f.issue}`).join("\n")}

Missing clauses detected:
${baseResult.missingClauses.map(m => `- [${m.importance}] ${m.name}`).join("\n")}

Current effective hourly rate: ${input.currency} ${baseResult.effectiveHourlyRate.toFixed(2)} (down from ${baseResult.nominalHourlyRate.toFixed(2)})

Please provide:
1. **Additional red flags** the automated system might have missed — subtle legal language, implied obligations, or hidden risks. For each, provide: severity (critical/high/medium/low), the problematic clause excerpt, what's wrong, financial impact, and suggested counter-proposal language.
2. **Additional missing protections** not already flagged.
3. **Overall AI assessment** — a 2-3 paragraph analysis of this deal from a freelancer's perspective. Be direct, practical, and specific. Include country-specific legal considerations if the currency suggests a jurisdiction.
4. **Negotiation strategy** — the top 3 things to negotiate first, in order of impact.

Respond in this exact JSON format:
{
  "extraRedFlags": [{"severity": "...", "clause": "...", "issue": "...", "impact": "...", "hourlyRateImpact": 0, "suggestion": "..."}],
  "extraMissing": [{"name": "...", "importance": "...", "description": "...", "suggestedLanguage": "..."}],
  "aiInsights": "Your full analysis as a markdown string..."
}`;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(prompt: string, apiKey: string): Promise<string> {
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
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

function parseAIResponse(text: string): { aiInsights: string; extraRedFlags: RedFlag[]; extraMissing: MissingClause[] } {
  // Strip markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find the JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { aiInsights: text, extraRedFlags: [], extraMissing: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      aiInsights: parsed.aiInsights || "AI analysis completed. See additional flags below.",
      extraRedFlags: (parsed.extraRedFlags || []).map((f: Record<string, unknown>) => ({
        severity: (f.severity as string) || "medium",
        clause: (f.clause as string) || "",
        issue: `🤖 AI: ${f.issue || ""}`,
        impact: (f.impact as string) || "",
        hourlyRateImpact: Number(f.hourlyRateImpact) || 0,
        suggestion: (f.suggestion as string) || "",
      })),
      extraMissing: (parsed.extraMissing || []).map((m: Record<string, unknown>) => ({
        name: (m.name as string) || "",
        importance: (m.importance as string) || "important",
        description: `🤖 AI: ${m.description || ""}`,
        suggestedLanguage: (m.suggestedLanguage as string) || "",
      })),
    };
  } catch {
    return { aiInsights: text, extraRedFlags: [], extraMissing: [] };
  }
}

// AI-enhanced analysis — supports both OpenAI and Anthropic
export async function enhanceWithAI(
  input: AnalysisInput,
  baseResult: AnalysisResult,
  manualApiKey?: string
): Promise<{ aiInsights: string; extraRedFlags: RedFlag[]; extraMissing: MissingClause[] }> {
  const prompt = buildPrompt(input, baseResult);

  // Priority: manual key from user > env OPENAI > env ANTHROPIC
  if (manualApiKey) {
    // Detect provider from key format
    if (manualApiKey.startsWith("sk-ant-")) {
      const text = await callAnthropic(prompt, manualApiKey);
      return parseAIResponse(text);
    } else {
      const text = await callOpenAI(prompt, manualApiKey);
      return parseAIResponse(text);
    }
  }

  const envProvider = getAIProvider();
  if (!envProvider) {
    throw new Error("No AI API key available");
  }

  const text = envProvider.provider === 'openai'
    ? await callOpenAI(prompt, envProvider.key)
    : await callAnthropic(prompt, envProvider.key);

  return parseAIResponse(text);
}

export { getCountryContext, getAIProvider, COUNTRY_CONTEXTS, currencyToCountry };
