// ============================================================================
// DEALWISE - Contract Analysis Engine
// The core scoring and red-flag detection system for freelancer contracts.
// ============================================================================

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface AnalysisInput {
  contractText: string;
  projectScope: string;
  quotedPrice?: number;    // NOW OPTIONAL — auto-detected from contract if missing
  estimatedHours?: number; // NOW OPTIONAL — auto-detected from contract if missing
  currency: string;
  country?: string;
  claudeApiKey?: string;
}

export interface RedFlag {
  severity: "critical" | "high" | "medium" | "low";
  clause: string;
  issue: string;
  impact: string;
  hourlyRateImpact: number;
  suggestion: string;
}

export interface GreenFlag {
  clause: string;
  benefit: string;
}

export interface MissingClause {
  name: string;
  importance: "critical" | "important" | "nice_to_have";
  description: string;
  suggestedLanguage: string;
}

export interface ScopeRisk {
  risk: string;
  likelihood: "high" | "medium" | "low";
  potentialCost: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  shortTextPenalty: number;
  heuristicFlagDeductions: number;
  aiFlagDeductions: number;
  missingClauseDeductions: number;
  greenFlagBonus: number;
  rateReductionPenalty: number;
  finalScore: number;
}

export interface AnalysisResult {
  overallScore: number;
  effectiveHourlyRate: number;
  nominalHourlyRate: number;
  rateReduction: number;
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
  scopeRisks: ScopeRisk[];
  summary: string;
  recommendation: "sign" | "negotiate" | "walk_away";
  contractType: string;  // "fixed-price" | "hourly" | "retainer" | "day-rate" | "per-unit" | "milestone" | "revenue-share" | "unknown"
  detectedPrice?: number;
  detectedRate?: number;
  aiInsights?: string;
  countryContext?: string;
  scoreBreakdown?: ScoreBreakdown;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Case-insensitive search; returns the first match or null. */
function findClause(text: string, pattern: RegExp): string | null {
  const m = text.match(pattern);
  return m ? m[0].trim() : null;
}

/** Return all matches for a pattern. */
function findAllClauses(text: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  const global = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  while ((m = global.exec(text)) !== null) {
    matches.push(m[0].trim());
  }
  return matches;
}

/** Grab surrounding context (~120 chars each side) for a match so we can show the clause in results. */
function extractContext(text: string, pattern: RegExp, contextChars = 120): string {
  const m = text.match(pattern);
  if (!m || m.index === undefined) return "";
  const start = Math.max(0, m.index - contextChars);
  const end = Math.min(text.length, m.index + m[0].length + contextChars);
  let ctx = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) ctx = "..." + ctx;
  if (end < text.length) ctx = ctx + "...";
  return ctx;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Pattern banks
// ---------------------------------------------------------------------------

// -- Payment terms --
const PAYMENT_NET_PATTERNS: { pattern: RegExp; days: number }[] = [
  { pattern: /net[\s-]?90/i, days: 90 },
  { pattern: /net[\s-]?60/i, days: 60 },
  { pattern: /net[\s-]?45/i, days: 45 },
  { pattern: /net[\s-]?30/i, days: 30 },
  { pattern: /net[\s-]?15/i, days: 15 },
  { pattern: /net[\s-]?14/i, days: 14 },
  { pattern: /net[\s-]?10/i, days: 10 },
  { pattern: /net[\s-]?7/i, days: 7 },
  { pattern: /within\s+90\s+days/i, days: 90 },
  { pattern: /within\s+60\s+days/i, days: 60 },
  { pattern: /within\s+45\s+days/i, days: 45 },
  { pattern: /within\s+30\s+days/i, days: 30 },
  { pattern: /within\s+15\s+days/i, days: 15 },
  { pattern: /within\s+14\s+days/i, days: 14 },
  { pattern: /within\s+7\s+days/i, days: 7 },
  { pattern: /payable\s+upon\s+completion/i, days: 30 }, // treat as net-30 risk
  { pattern: /due\s+upon\s+(?:final\s+)?(?:delivery|completion|acceptance)/i, days: 30 },
  { pattern: /paid?\s+(?:only\s+)?(?:upon|after|on)\s+(?:final\s+)?(?:approval|acceptance|completion|delivery)/i, days: 45 },
];

const UPON_COMPLETION_ONLY = /(?:payment|fee|compensation)[\s\S]{0,60}(?:upon|after|on)\s+(?:final\s+)?(?:completion|delivery|acceptance|approval)/i;

const MILESTONE_PATTERN = /milestone[s]?[\s-]?(?:based|payment|schedule|upon)/i;
const UPFRONT_DEPOSIT_PATTERN = /(?:upfront|advance|deposit|retainer|upon\s+signing|upon\s+execution|before\s+commencement|initial\s+payment|down\s*payment)/i;

// -- Revision limits -- (must be about CONTRACT revisions, not job task descriptions)
const UNLIMITED_REVISIONS = /unlimited\s+(?:revisions?|changes?|modifications?|edits?|rounds?\s+of\s+(?:revisions?|changes?|feedback))/i;
const NO_REVISION_LIMIT = /(?:no\s+limit|without\s+limit(?:ation)?)\s+(?:on|to)\s+(?:revisions?|changes?|modifications?|edits?)/i;
const REASONABLE_REVISIONS = /(?:reasonable\s+(?:number\s+of\s+)?(?:revisions?|changes?))/i;
const REVISION_ROUNDS_PATTERN = /(\d+)\s+(?:rounds?\s+of\s+)?(?:revisions?|changes?|modifications?|edits?|iterations?)(?:\s+(?:included|per|are|will|shall))/i;
const REVISION_MENTIONED = /(?:(?:project|deliverable|design|work)\s+(?:revisions?|changes?)|(?:rounds?\s+of\s+(?:revisions?|changes?|feedback))|(?:revisions?\s+(?:included|per\s+|are\s+|will\s+|shall\s+|round|limit)))/i;

// -- Scope creep indicators --
const SCOPE_CREEP_PATTERNS: { pattern: RegExp; description: string }[] = [
  { pattern: /(?:and|including)\s+(?:any\s+)?other\s+(?:tasks?|duties?|work|activities?|services?)\s+(?:as\s+(?:needed|required|directed|requested|assigned|determined))/i, description: "Open-ended task assignment" },
  { pattern: /additional\s+(?:duties?|tasks?|work|responsibilities?|services?)\s+(?:as\s+(?:needed|required|directed|requested|assigned|may\s+arise))/i, description: "Unscoped additional duties" },
  { pattern: /as\s+(?:otherwise\s+)?(?:directed|instructed|requested)\s+by\s+(?:the\s+)?(?:client|company|employer|manager)/i, description: "Client-directed scope changes" },
  { pattern: /(?:any|all)\s+(?:other\s+)?(?:related|associated|relevant)\s+(?:tasks?|work|duties?|activities?|services?)/i, description: "Catch-all scope language" },
  { pattern: /scope\s+(?:may|can|will)\s+(?:be\s+)?(?:expanded|extended|modified|changed|adjusted|amended)\s+(?:at\s+(?:any\s+time|the\s+(?:client|company)'?s?\s+discretion))/i, description: "Unilateral scope modification" },
  { pattern: /(?:including\s+but\s+not\s+limited\s+to)/i, description: "'Including but not limited to' broadens scope" },
  { pattern: /(?:and\/or|and\s+\/\s+or)\s+(?:any|other|additional)\s+(?:tasks?|work|deliverables?)/i, description: "Ambiguous scope boundaries" },
  { pattern: /(?:from\s+time\s+to\s+time|as\s+(?:may\s+be|the\s+need)\s+aris(?:e|es))/i, description: "Ad-hoc work expectations" },
  { pattern: /(?:reasonable|minor|small)\s+(?:changes?|modifications?|adjustments?)\s+(?:at\s+no\s+(?:additional\s+)?(?:cost|charge))/i, description: "Free changes without defining 'reasonable'" },
  { pattern: /(?:client|company)\s+(?:may|shall|can|will)\s+(?:request|require|demand)\s+(?:changes?|modifications?|adjustments?|additional\s+work)/i, description: "Client can demand changes without limits" },
];

// -- Kill fee / cancellation --
const CANCELLATION_PATTERN = /(?:cancell?ation|terminat(?:ion|e)|early\s+termination|right\s+to\s+(?:cancel|terminate))/i;
const KILL_FEE_PATTERN = /(?:kill\s+fee|cancell?ation\s+fee|terminat(?:ion|e)\s+(?:fee|payment|compensation)|early\s+terminat(?:ion|e)\s+fee)/i;
const CANCEL_WITHOUT_CAUSE = /(?:either\s+party|(?:client|company))\s+(?:may|can|shall\s+have\s+the\s+right\s+to)\s+(?:cancel|terminate)[\s\S]{0,80}(?:without\s+(?:cause|reason)|at\s+(?:any\s+time|its?\s+(?:sole\s+)?discretion)|for\s+(?:any|no)\s+reason)/i;
const CANCEL_NO_PAY = /(?:terminat|cancell?)[\s\S]{0,120}(?:no\s+(?:further\s+)?(?:payment|compensation|obligation)|(?:forfeit|waive|lose)\s+(?:any|all)\s+(?:right|claim)\s+to\s+(?:payment|compensation))/i;
const WORK_PAID_ON_CANCEL = /(?:terminat|cancell?)[\s\S]{0,150}(?:(?:pa(?:id|ys?|yment))\s+for\s+(?:all\s+)?(?:work\s+)?(?:completed|performed|done|to\s+date)|(?:pro[\s-]?rat(?:a|ed?)|proportional)\s+(?:payment|compensation|fee)|(?:compensat(?:ed?|ion))\s+for\s+(?:all\s+)?(?:work|services))/i;

// -- IP / ownership --
const WORK_FOR_HIRE = /work[\s-]?(?:made[\s-]?)?for[\s-]?hire/i;
const IP_TRANSFER = /(?:(?:all|any|full)\s+)?(?:intellectual\s+property|ip|copyright|ownership|deliverables?)\s+(?:rights?\s+)?(?:shall\s+)?(?:transfer|vest|belong|assign|be\s+(?:owned|assigned|transferred))\s+(?:to|in)\s+(?:the\s+)?(?:client|company|employer)/i;
const IP_BEFORE_PAYMENT = /(?:intellectual\s+property|ip|copyright|ownership)[\s\S]{0,120}(?:upon\s+(?:delivery|completion|creation)|immediately|automatically|at\s+(?:all|any)\s+times?)[\s\S]{0,80}(?:regardless|irrespective|whether\s+or\s+not\s+(?:paid?|payment))/i;
const IP_UPON_PAYMENT = /(?:intellectual\s+property|ip|copyright|ownership)[\s\S]{0,120}(?:upon|after|subject\s+to)\s+(?:full\s+)?(?:payment|receipt)/i;
const LICENSE_BACK = /(?:freelancer|contractor|consultant|designer|developer)\s+(?:shall\s+)?(?:retain|maintain|keep|reserve)[\s\S]{0,60}(?:license|right\s+to\s+(?:use|display|showcase|portfolio))/i;

// -- Non-compete / non-solicitation --
const NON_COMPETE = /non[\s-]?compet(?:e|ition|itive)\s+(?:clause|agreement|covenant|restriction|provision|obligation)?/i;
const NON_SOLICIT = /non[\s-]?solicit(?:ation)?\s+(?:clause|agreement|covenant|restriction|provision|obligation)?/i;
const NON_COMPETE_DURATION = /non[\s-]?compet[\s\S]{0,100}(\d+)\s+(?:month|year|week)/i;
const NON_COMPETE_BROAD = /non[\s-]?compet[\s\S]{0,150}(?:any\s+(?:similar|competing|related)|(?:worldwide|global|unlimited\s+(?:geographic|territorial)))/i;

// -- Late payment penalties --
const LATE_FEE_PATTERN = /(?:late\s+(?:fee|charge|penalty|interest|payment\s+(?:fee|charge|penalty|interest)))|(?:(?:interest|penalty)\s+(?:on|for)\s+(?:late|overdue|past[\s-]?due)\s+(?:payment|invoice|balance))|(?:late\s+payments?\s+(?:shall\s+)?(?:incur|accrue|bear|carry))|(?:overdue\s+(?:payment|invoice|balance)s?\s+(?:shall\s+)?(?:incur|accrue|bear))|(?:(?:incur|accrue)\s+interest)|(?:\d+\.?\d*\s*%\s*(?:per\s+)?(?:month|annual|yearly|monthly)\s*(?:interest|penalty|fee))/i;
const INTEREST_RATE_PATTERN = /(\d+(?:\.\d+)?)\s*%\s*(?:per\s+)?(?:month|annum|year|annual)/i;

// -- Liability --
const UNLIMITED_LIABILITY = /(?:(?:contractor|freelancer|consultant)\s+(?:shall\s+)?(?:be\s+)?(?:fully\s+)?(?:liable|responsible)\s+for\s+(?:any\s+and\s+)?all\s+(?:damages?|losses?|claims?))|(?:unlimited\s+(?:liability|indemnif(?:y|ication)))/i;
const INDEMNIFICATION = /(?:indemnif(?:y|ication|ies)|hold\s+harmless)/i;
const INDEMNIFY_BROAD = /(?:indemnif(?:y|ication|ies)|hold\s+harmless)[\s\S]{0,200}(?:any\s+and\s+all|all\s+(?:claims?|damages?|losses?|liabilit(?:y|ies))|(?:direct|indirect|consequential|incidental|special|punitive)\s+damages?)/i;
const LIABILITY_CAP = /(?:(?:total|aggregate|maximum|cumulative)\s+)?(?:liability|damages?)[\s\S]{0,80}(?:(?:shall\s+)?not\s+exceed|(?:is\s+)?limited\s+to|(?:capped?|cap)\s+at|equals?\s+(?:the\s+)?(?:total|aggregate))[\s\S]{0,60}(?:(?:the\s+)?(?:total\s+)?(?:fees?|amount|price|compensation|value)|[\$\d])/i;

// -- Dispute resolution --
const ARBITRATION = /(?:binding\s+)?arbitrat(?:ion|ed?)/i;
const ARBITRATION_CLIENT_JURISDICTION = /arbitrat(?:ion|ed?)[\s\S]{0,200}(?:(?:client|company|employer)(?:'?s?)?\s+(?:location|jurisdiction|state|city|county|office|headquarters|principal\s+place)|(?:in|at|within)\s+(?:the\s+)?(?:state|city|county)\s+of)/i;
const MEDIATION = /mediat(?:ion|ed?)/i;
const GOVERNING_LAW = /govern(?:ing|ed\s+by)\s+(?:the\s+)?law(?:s)?\s+of/i;

// -- Confidentiality --
const CONFIDENTIALITY = /\b(?:confidential(?:ity)?[\s-]?(?:clause|agreement|obligation|section)?|non[\s-]?disclosure\s+(?:agreement|clause)?|\bnda\b)\b/i;
const UNLIMITED_SUPPORT = /unlimited\s+(?:bug\s+)?fix(?:es|ing)?|unlimited\s+(?:support|maintenance|warranty|defect)/i;

// -- Termination notice --
const TERMINATION_NOTICE = /(?:terminat(?:ion|e))[\s\S]{0,80}(?:(\d+)\s+(?:day|week|month)(?:s')?\s+(?:prior\s+)?(?:written\s+)?notice)/i;

// ---------------------------------------------------------------------------
// Detection modules
// ---------------------------------------------------------------------------

interface DetectionContext {
  text: string;            // Lowered contract text
  original: string;        // Original contract text (for display)
  scope: string;           // Project scope
  nominalRate: number;
  quotedPrice: number;
  estimatedHours: number;
  currency: string;
}

function detectPaymentTerms(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
  hourlyPenalty: number;
  extraHoursMultiplier: number;
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];
  let hourlyPenalty = 0;
  const extraHoursMultiplier = 1;

  // Detect net-N payment terms
  let paymentDays: number | null = null;
  for (const { pattern, days } of PAYMENT_NET_PATTERNS) {
    if (pattern.test(ctx.text)) {
      paymentDays = days;
      break; // take the first (longest) match
    }
  }

  const ANNUAL_COST_OF_CAPITAL = 0.10; // 10% per year

  if (paymentDays !== null && paymentDays > 14) {
    const floatCost = ctx.quotedPrice * (ANNUAL_COST_OF_CAPITAL / 365) * paymentDays;
    const floatCostPerHour = floatCost / ctx.estimatedHours;
    const clause = extractContext(ctx.original, PAYMENT_NET_PATTERNS.find(p => p.pattern.test(ctx.text))!.pattern);

    if (paymentDays >= 60) {
      redFlags.push({
        severity: paymentDays >= 90 ? "critical" : "high",
        clause,
        issue: `Payment terms are Net-${paymentDays} — your money is locked up for ${paymentDays} days`,
        impact: `At 10% annual cost of capital, you lose ~${ctx.currency}${round2(floatCost)} in float cost. This reduces your effective hourly rate by ${ctx.currency}${round2(floatCostPerHour)}/hr.`,
        hourlyRateImpact: round2(floatCostPerHour),
        suggestion: `Counter with: "Payment shall be due within 14 days of invoice submission. Invoices may be submitted upon completion of each milestone."`,
      });
      hourlyPenalty += floatCostPerHour;
    } else if (paymentDays >= 30) {
      redFlags.push({
        severity: "medium",
        clause,
        issue: `Payment terms are Net-${paymentDays} — standard but not ideal for freelancers`,
        impact: `Float cost of ~${ctx.currency}${round2(floatCost)}. Effective hourly rate reduced by ${ctx.currency}${round2(floatCostPerHour)}/hr.`,
        hourlyRateImpact: round2(floatCostPerHour),
        suggestion: `Request Net-14 or Net-15 terms. "Payment shall be due within 14 days of invoice date."`,
      });
      hourlyPenalty += floatCostPerHour;
    }
  } else if (paymentDays !== null && paymentDays <= 14) {
    const clause = extractContext(ctx.original, PAYMENT_NET_PATTERNS.find(p => p.pattern.test(ctx.text))!.pattern);
    greenFlags.push({
      clause,
      benefit: `Fast payment terms (Net-${paymentDays}) — minimizes float cost and cash flow risk.`,
    });
  }

  // Upon completion only (no milestones, no upfront)
  if (UPON_COMPLETION_ONLY.test(ctx.text) && !MILESTONE_PATTERN.test(ctx.text) && !UPFRONT_DEPOSIT_PATTERN.test(ctx.text)) {
    const clause = extractContext(ctx.original, UPON_COMPLETION_ONLY);
    const riskCost = ctx.quotedPrice * 0.15; // 15% risk of non-payment after completion
    const riskPerHour = riskCost / ctx.estimatedHours;
    redFlags.push({
      severity: "high",
      clause,
      issue: "Payment only upon completion — all financial risk is on you",
      impact: `If the client ghosts or disputes the deliverable, you could lose 100% of the fee. Risk-adjusted cost: ~${ctx.currency}${round2(riskCost)} (${ctx.currency}${round2(riskPerHour)}/hr).`,
      hourlyRateImpact: round2(riskPerHour),
      suggestion: `Propose milestone payments: "50% deposit upon signing, 25% at midpoint deliverable, 25% upon final delivery."`,
    });
    hourlyPenalty += riskPerHour;
  }

  // Upfront deposit detection
  if (UPFRONT_DEPOSIT_PATTERN.test(ctx.text)) {
    const clause = extractContext(ctx.original, UPFRONT_DEPOSIT_PATTERN);
    greenFlags.push({
      clause,
      benefit: "Upfront deposit or retainer required — reduces your financial risk and demonstrates client commitment.",
    });
  } else {
    missingClauses.push({
      name: "Upfront Deposit / Retainer",
      importance: "critical",
      description: "No upfront payment is required. You bear 100% of the financial risk until project completion.",
      suggestedLanguage: `"A non-refundable deposit of [25-50]% of the total project fee shall be due upon execution of this Agreement. Work shall not commence until the deposit is received."`,
    });
    // Add implicit cost: no deposit = higher risk
    if (!UPON_COMPLETION_ONLY.test(ctx.text)) {
      const riskCost = ctx.quotedPrice * 0.08;
      const riskPerHour = riskCost / ctx.estimatedHours;
      hourlyPenalty += riskPerHour;
    }
  }

  // Milestone payments
  if (MILESTONE_PATTERN.test(ctx.text)) {
    const clause = extractContext(ctx.original, MILESTONE_PATTERN);
    greenFlags.push({
      clause,
      benefit: "Milestone-based payments reduce your exposure — you get paid as you deliver.",
    });
  }

  return { redFlags, greenFlags, missingClauses, hourlyPenalty, extraHoursMultiplier };
}

function detectRevisionLimits(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
  extraHoursMultiplier: number;
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];
  let extraHoursMultiplier = 1;

  // Unlimited revisions — the freelancer killer
  if (UNLIMITED_REVISIONS.test(ctx.text) || NO_REVISION_LIMIT.test(ctx.text)) {
    const pattern = UNLIMITED_REVISIONS.test(ctx.text) ? UNLIMITED_REVISIONS : NO_REVISION_LIMIT;
    const clause = extractContext(ctx.original, pattern);
    // Each unlimited revision round adds ~20% time; assume at least 2-3 extra rounds = 40-60% more hours
    const extraHoursFactor = 0.50; // 50% more hours on average
    const extraHours = ctx.estimatedHours * extraHoursFactor;
    const effectiveRate = ctx.quotedPrice / (ctx.estimatedHours + extraHours);
    const rateImpact = ctx.nominalRate - effectiveRate;
    extraHoursMultiplier = 1 + extraHoursFactor;

    redFlags.push({
      severity: "critical",
      clause,
      issue: "Unlimited revisions — this is the #1 freelancer trap",
      impact: `On average, 'unlimited revisions' leads to 2-3 extra rounds of changes, adding ~${Math.round(extraHours)} hours to the project. Your effective rate drops from ${ctx.currency}${round2(ctx.nominalRate)}/hr to ${ctx.currency}${round2(effectiveRate)}/hr.`,
      hourlyRateImpact: round2(rateImpact),
      suggestion: `Replace with: "This agreement includes [2-3] rounds of revisions. Each revision round shall be completed within [5] business days of feedback. Additional revision rounds shall be billed at ${ctx.currency}${round2(ctx.nominalRate)}/hr."`,
    });
  } else if (REASONABLE_REVISIONS.test(ctx.text)) {
    // "Reasonable revisions" — vague but not as bad
    const clause = extractContext(ctx.original, REASONABLE_REVISIONS);
    const extraHoursFactor = 0.20;
    const extraHours = ctx.estimatedHours * extraHoursFactor;
    const effectiveRate = ctx.quotedPrice / (ctx.estimatedHours + extraHours);
    const rateImpact = ctx.nominalRate - effectiveRate;
    extraHoursMultiplier = 1 + extraHoursFactor;

    redFlags.push({
      severity: "medium",
      clause,
      issue: "'Reasonable revisions' is vague — who defines reasonable?",
      impact: `Without a concrete number, 'reasonable' often means 'as many as the client wants.' Could add ~${Math.round(extraHours)} hours. Rate impact: -${ctx.currency}${round2(rateImpact)}/hr.`,
      hourlyRateImpact: round2(rateImpact),
      suggestion: `Clarify with: "Up to [2] rounds of revisions are included. 'Reasonable' shall mean changes that do not alter the agreed-upon scope or direction of the project."`,
    });
  } else {
    // Check for a specific number of revisions
    const roundsMatch = ctx.text.match(REVISION_ROUNDS_PATTERN);
    if (roundsMatch) {
      const rounds = parseInt(roundsMatch[1], 10);
      const clause = extractContext(ctx.original, REVISION_ROUNDS_PATTERN);
      if (rounds <= 3) {
        greenFlags.push({
          clause,
          benefit: `Revisions are capped at ${rounds} round(s) — this protects your time and sets clear expectations.`,
        });
      } else if (rounds <= 5) {
        const extraHoursFactor = (rounds - 2) * 0.10; // each round beyond 2 = ~10%
        const extraHours = ctx.estimatedHours * extraHoursFactor;
        const effectiveRate = ctx.quotedPrice / (ctx.estimatedHours + extraHours);
        const rateImpact = ctx.nominalRate - effectiveRate;
        extraHoursMultiplier = 1 + extraHoursFactor;

        redFlags.push({
          severity: "low",
          clause,
          issue: `${rounds} revision rounds is on the high side`,
          impact: `Each additional round beyond 2 costs you ~${round2(ctx.estimatedHours * 0.10)} hours. Total extra: ~${round2(extraHours)} hours, reducing rate by ${ctx.currency}${round2(rateImpact)}/hr.`,
          hourlyRateImpact: round2(rateImpact),
          suggestion: `Consider reducing to 2-3 rounds, or add: "Additional rounds beyond ${rounds} shall be billed at ${ctx.currency}${round2(ctx.nominalRate)}/hr."`,
        });
      } else {
        const extraHoursFactor = (rounds - 2) * 0.10;
        const extraHours = ctx.estimatedHours * extraHoursFactor;
        const effectiveRate = ctx.quotedPrice / (ctx.estimatedHours + extraHours);
        const rateImpact = ctx.nominalRate - effectiveRate;
        extraHoursMultiplier = 1 + extraHoursFactor;

        redFlags.push({
          severity: "high",
          clause,
          issue: `${rounds} revision rounds is excessive — this is essentially unlimited`,
          impact: `Could add ~${round2(extraHours)} hours to the project. Effective rate drops to ${ctx.currency}${round2(effectiveRate)}/hr.`,
          hourlyRateImpact: round2(rateImpact),
          suggestion: `Reduce to 2-3 rounds: "This agreement includes 2 rounds of revisions. Additional rounds shall be billed at ${ctx.currency}${round2(ctx.nominalRate)}/hr."`,
        });
      }
    } else if (!REVISION_MENTIONED.test(ctx.text)) {
      // No revision language at all
      missingClauses.push({
        name: "Revision Limits",
        importance: "critical",
        description: "The contract does not mention revisions at all. Without a defined limit, the client may expect unlimited revisions by default.",
        suggestedLanguage: `"This agreement includes [2] rounds of revisions per deliverable. Each round must be submitted within [5] business days. Additional revision rounds shall be billed at the hourly rate of ${ctx.currency}${round2(ctx.nominalRate)}/hr."`,
      });
      // Assume some risk
      extraHoursMultiplier = 1.15;
    }
  }

  return { redFlags, greenFlags, missingClauses, extraHoursMultiplier };
}

function detectScopeCreep(ctx: DetectionContext): {
  redFlags: RedFlag[];
  scopeRisks: ScopeRisk[];
  extraHoursMultiplier: number;
} {
  const redFlags: RedFlag[] = [];
  const scopeRisks: ScopeRisk[] = [];
  let cumulativeCreepFactor = 0;

  for (const { pattern, description } of SCOPE_CREEP_PATTERNS) {
    if (pattern.test(ctx.text)) {
      const clause = extractContext(ctx.original, pattern);
      const creepFactor = 0.08; // Each vague clause adds ~8% scope risk
      cumulativeCreepFactor += creepFactor;

      const extraHours = ctx.estimatedHours * creepFactor;
      const rateImpact = (ctx.quotedPrice / (ctx.estimatedHours + extraHours)) - ctx.nominalRate;

      redFlags.push({
        severity: cumulativeCreepFactor > 0.20 ? "high" : "medium",
        clause,
        issue: `Scope creep risk: ${description}`,
        impact: `This clause allows the client to add work without additional compensation. Could add ~${round2(extraHours)} hours. Rate impact: ${ctx.currency}${round2(Math.abs(rateImpact))}/hr reduction.`,
        hourlyRateImpact: round2(Math.abs(rateImpact)),
        suggestion: `Remove or replace with: "Any work not explicitly listed in the Scope of Work (Exhibit A) shall require a separate change order, with additional fees agreed in writing before work begins."`,
      });

      scopeRisks.push({
        risk: description,
        likelihood: "high",
        potentialCost: `~${round2(extraHours)} additional hours (${ctx.currency}${round2(extraHours * ctx.nominalRate)})`,
      });
    }
  }

  // Check if the scope section itself is vague
  if (ctx.scope) {
    const scopeLower = ctx.scope.toLowerCase();
    const vagueIndicators = [
      /etc\.?/i,
      /and\s+(?:so\s+on|more)/i,
      /among\s+(?:other|others)/i,
      /various/i,
      /miscellaneous/i,
      /general\s+(?:support|assistance|help)/i,
    ];

    for (const vp of vagueIndicators) {
      if (vp.test(scopeLower)) {
        cumulativeCreepFactor += 0.05;
        scopeRisks.push({
          risk: `Vague scope language detected: "${findClause(ctx.scope, vp) || vp.source}"`,
          likelihood: "medium",
          potentialCost: `~${round2(ctx.estimatedHours * 0.05)} additional hours`,
        });
      }
    }
  }

  // Cap cumulative creep at 30%
  const extraHoursMultiplier = 1 + Math.min(cumulativeCreepFactor, 0.30);

  return { redFlags, scopeRisks, extraHoursMultiplier };
}

function detectKillFee(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
  hourlyPenalty: number;
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];
  let hourlyPenalty = 0;

  const hasCancellation = CANCELLATION_PATTERN.test(ctx.text);
  const hasKillFee = KILL_FEE_PATTERN.test(ctx.text);
  const cancelWithoutCause = CANCEL_WITHOUT_CAUSE.test(ctx.text);
  const cancelNoPay = CANCEL_NO_PAY.test(ctx.text);
  const workPaidOnCancel = WORK_PAID_ON_CANCEL.test(ctx.text);

  if (cancelNoPay) {
    const clause = extractContext(ctx.original, CANCEL_NO_PAY);
    // Client can cancel and not pay — devastating
    const riskCost = ctx.quotedPrice * 0.25; // 25% probability-weighted loss
    const riskPerHour = riskCost / ctx.estimatedHours;
    hourlyPenalty = riskPerHour;

    redFlags.push({
      severity: "critical",
      clause,
      issue: "Client can cancel and you forfeit payment for completed work",
      impact: `If the client cancels at 80% completion, you lose all compensation for work already done. Probability-weighted loss: ~${ctx.currency}${round2(riskCost)} (${ctx.currency}${round2(riskPerHour)}/hr impact).`,
      hourlyRateImpact: round2(riskPerHour),
      suggestion: `Add kill fee clause: "In the event of cancellation, Client shall pay for all work completed to date, plus a cancellation fee of [25]% of the remaining contract value."`,
    });
  } else if (cancelWithoutCause && !hasKillFee && !workPaidOnCancel) {
    const clause = extractContext(ctx.original, CANCEL_WITHOUT_CAUSE);
    const riskCost = ctx.quotedPrice * 0.15;
    const riskPerHour = riskCost / ctx.estimatedHours;
    hourlyPenalty = riskPerHour;

    redFlags.push({
      severity: "high",
      clause,
      issue: "Client can cancel without cause — no kill fee or payment for completed work specified",
      impact: `Without a kill fee, early cancellation means lost time and income. Risk-adjusted cost: ~${ctx.currency}${round2(riskCost)} (${ctx.currency}${round2(riskPerHour)}/hr).`,
      hourlyRateImpact: round2(riskPerHour),
      suggestion: `Add: "Upon cancellation, Client shall pay Contractor for all work completed through the date of termination, plus a kill fee equal to 25% of the remaining unpaid balance."`,
    });
  } else if (workPaidOnCancel) {
    const clause = extractContext(ctx.original, WORK_PAID_ON_CANCEL);
    greenFlags.push({
      clause,
      benefit: "Completed work is paid upon cancellation — you won't lose money for work already done.",
    });

    if (hasKillFee) {
      const feeClause = extractContext(ctx.original, KILL_FEE_PATTERN);
      greenFlags.push({
        clause: feeClause,
        benefit: "Kill fee / cancellation fee included — additional protection against sudden cancellation.",
      });
    }
  } else if (!hasCancellation) {
    missingClauses.push({
      name: "Cancellation / Termination Clause",
      importance: "critical",
      description: "No termination or cancellation clause exists. Without one, either party's rights upon cancellation are undefined, which usually hurts the freelancer more.",
      suggestedLanguage: `"Either party may terminate this Agreement with [14] days written notice. Upon termination, Client shall pay Contractor for all work completed to date. If Client terminates without cause, Client shall also pay a cancellation fee equal to 25% of the remaining contract value."`,
    });
    const riskCost = ctx.quotedPrice * 0.10;
    const riskPerHour = riskCost / ctx.estimatedHours;
    hourlyPenalty = riskPerHour;
  }

  return { redFlags, greenFlags, missingClauses, hourlyPenalty };
}

function detectIPOwnership(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];

  const hasWorkForHire = WORK_FOR_HIRE.test(ctx.text);
  const hasIPTransfer = IP_TRANSFER.test(ctx.text);
  const hasIPBeforePayment = IP_BEFORE_PAYMENT.test(ctx.text);
  const hasIPUponPayment = IP_UPON_PAYMENT.test(ctx.text);
  const hasLicenseBack = LICENSE_BACK.test(ctx.text);

  if (hasIPBeforePayment) {
    const clause = extractContext(ctx.original, IP_BEFORE_PAYMENT);
    redFlags.push({
      severity: "critical",
      clause,
      issue: "IP transfers before full payment — client gets ownership even if they don't pay",
      impact: "Once IP transfers, you lose all leverage to collect payment. The client owns your work regardless of payment status.",
      hourlyRateImpact: 0, // hard to quantify but devastating
      suggestion: `Replace with: "All intellectual property rights shall transfer to Client only upon receipt of full and final payment. Until such payment, Contractor retains all rights."`,
    });
  }

  if (hasWorkForHire && !hasIPUponPayment) {
    const clause = extractContext(ctx.original, WORK_FOR_HIRE);
    redFlags.push({
      severity: "medium",
      clause,
      issue: "Work-for-hire designation — IP belongs to the client from inception",
      impact: "Under work-for-hire, the client is considered the legal author. You can't use the work in your portfolio or reuse any components without permission.",
      hourlyRateImpact: 0,
      suggestion: `Add: "Notwithstanding the work-for-hire designation, Contractor retains the right to display the work in portfolio and marketing materials, and to reuse general-purpose code/components in other projects."`,
    });
  }

  if (hasIPTransfer && hasIPUponPayment) {
    const clause = extractContext(ctx.original, IP_UPON_PAYMENT);
    greenFlags.push({
      clause,
      benefit: "IP transfers only upon full payment — your work is protected until you're paid.",
    });
  }

  if (hasLicenseBack) {
    const clause = extractContext(ctx.original, LICENSE_BACK);
    greenFlags.push({
      clause,
      benefit: "You retain a license to use the work (e.g., portfolio display) — common and fair.",
    });
  }

  if (!hasWorkForHire && !hasIPTransfer && !IP_TRANSFER.test(ctx.text)) {
    missingClauses.push({
      name: "IP Ownership / Assignment",
      importance: "important",
      description: "No IP ownership or assignment clause. Without one, IP ownership defaults to local law, which varies widely. This can create disputes later.",
      suggestedLanguage: `"Upon receipt of full payment, Contractor assigns to Client all intellectual property rights in the deliverables. Contractor retains the right to display the work in portfolio and marketing materials."`,
    });
  }

  return { redFlags, greenFlags, missingClauses };
}

function detectNonCompete(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];

  const hasNonCompete = NON_COMPETE.test(ctx.text);
  const hasNonSolicit = NON_SOLICIT.test(ctx.text);

  if (hasNonCompete) {
    const durationMatch = ctx.text.match(NON_COMPETE_DURATION);
    const isBroad = NON_COMPETE_BROAD.test(ctx.text);
    const clause = extractContext(ctx.original, NON_COMPETE);

    let duration = "unspecified";
    let durationMonths = 12; // assume 12 months if not specified
    if (durationMatch) {
      const num = parseInt(durationMatch[1], 10);
      const unit = durationMatch[0].toLowerCase();
      if (unit.includes("year")) {
        durationMonths = num * 12;
        duration = `${num} year(s)`;
      } else if (unit.includes("month")) {
        durationMonths = num;
        duration = `${num} month(s)`;
      } else if (unit.includes("week")) {
        durationMonths = num / 4;
        duration = `${num} week(s)`;
      }
    }

    const severity: RedFlag["severity"] = (durationMonths > 12 || isBroad) ? "critical" : durationMonths > 6 ? "high" : "medium";

    const opportunityCostPerMonth = ctx.quotedPrice * 0.3; // rough estimate
    const totalOpportunityCost = opportunityCostPerMonth * Math.min(durationMonths, 6);
    const hourlyImpact = round2(totalOpportunityCost / ctx.estimatedHours * 0.1); // 10% probability of enforcement

    redFlags.push({
      severity,
      clause,
      issue: `Non-compete clause (${duration}) ${isBroad ? "with broad geographic/industry scope" : ""}`.trim(),
      impact: `A non-compete prevents you from working with competing clients for ${duration}. For a freelancer, this can be devastating — it limits your entire client pool. ${isBroad ? "The broad scope makes this especially dangerous." : ""}`,
      hourlyRateImpact: hourlyImpact,
      suggestion: durationMonths > 6
        ? `Remove entirely or narrow: "Contractor agrees not to provide services to Client's direct competitors listed in Exhibit B for a period of [3] months. This restriction applies only to the specific project domain."`
        : `Narrow the scope: ensure it only applies to direct competitors and is limited to the specific type of work performed.`,
    });
  }

  if (hasNonSolicit) {
    const clause = extractContext(ctx.original, NON_SOLICIT);
    redFlags.push({
      severity: "low",
      clause,
      issue: "Non-solicitation clause — restricts your ability to work with client's employees or clients",
      impact: "You cannot hire or solicit the client's team or customers. This is relatively standard but review the scope and duration.",
      hourlyRateImpact: 0,
      suggestion: `Ensure it's limited to active solicitation (not passive inquiries) and to a reasonable duration: "Contractor agrees not to actively solicit Client's employees for a period of [6] months following project completion."`,
    });
  }

  return { redFlags, greenFlags };
}

function detectLatePaymentPenalties(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];

  const hasLateFee = LATE_FEE_PATTERN.test(ctx.text);
  const interestMatch = ctx.text.match(INTEREST_RATE_PATTERN);

  if (hasLateFee) {
    const clause = extractContext(ctx.original, LATE_FEE_PATTERN);
    if (interestMatch) {
      const rate = parseFloat(interestMatch[1]);
      greenFlags.push({
        clause,
        benefit: `Late payment penalty of ${rate}% is specified — this incentivizes the client to pay on time.`,
      });
    } else {
      greenFlags.push({
        clause,
        benefit: "Late payment penalties are mentioned — check that the rate is specified and reasonable (1.5%/month is standard).",
      });
    }
  } else {
    missingClauses.push({
      name: "Late Payment Penalties",
      importance: "important",
      description: "No late payment fee or interest clause. Without penalties, clients have no financial incentive to pay on time, and many won't.",
      suggestedLanguage: `"Invoices not paid within the payment terms shall accrue interest at a rate of 1.5% per month (18% annually), or the maximum rate permitted by law, whichever is less. Contractor reserves the right to suspend work until overdue payments are received."`,
    });
  }

  return { redFlags, greenFlags, missingClauses };
}

function detectLiability(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];

  const hasUnlimitedLiability = UNLIMITED_LIABILITY.test(ctx.text);
  const hasIndemnification = INDEMNIFICATION.test(ctx.text);
  const hasBroadIndemnification = INDEMNIFY_BROAD.test(ctx.text);
  const hasLiabilityCap = LIABILITY_CAP.test(ctx.text);

  if (hasUnlimitedLiability) {
    const clause = extractContext(ctx.original, UNLIMITED_LIABILITY);
    redFlags.push({
      severity: "critical",
      clause,
      issue: "Unlimited liability — you could owe far more than the contract is worth",
      impact: `If something goes wrong, you could be liable for the client's full damages, which could be many multiples of your ${ctx.currency}${ctx.quotedPrice} fee. This is an existential risk.`,
      hourlyRateImpact: 0,
      suggestion: `Add a liability cap: "Contractor's total liability under this Agreement shall not exceed the total fees paid to Contractor under this Agreement. In no event shall Contractor be liable for indirect, consequential, special, or punitive damages."`,
    });
  }

  if (hasBroadIndemnification) {
    const clause = extractContext(ctx.original, INDEMNIFY_BROAD);
    redFlags.push({
      severity: "high",
      clause,
      issue: "Broad indemnification — you may be covering the client's risks too",
      impact: "A broad indemnification clause can make you financially responsible for problems caused by the client's own actions, third parties, or circumstances beyond your control.",
      hourlyRateImpact: 0,
      suggestion: `Narrow to: "Contractor shall indemnify Client only against claims arising directly from Contractor's proven negligence or willful misconduct in performing the services."`,
    });
  } else if (hasIndemnification && !hasBroadIndemnification) {
    const clause = extractContext(ctx.original, INDEMNIFICATION);
    redFlags.push({
      severity: "medium",
      clause,
      issue: "Indemnification clause present — review scope carefully",
      impact: "Indemnification clauses can expose you to significant financial risk. Ensure it's limited to your own negligence and does not cover the client's failures.",
      hourlyRateImpact: 0,
      suggestion: `Ensure mutual indemnification and narrow scope: "Each party shall indemnify the other against claims arising from its own negligence or breach of this Agreement."`,
    });
  }

  if (hasLiabilityCap) {
    const clause = extractContext(ctx.original, LIABILITY_CAP);
    greenFlags.push({
      clause,
      benefit: "Liability is capped — your maximum exposure is limited, which is essential for freelancers.",
    });
  } else if (!hasUnlimitedLiability) {
    missingClauses.push({
      name: "Liability Cap",
      importance: "important",
      description: "No liability cap is defined. Without one, you could theoretically be liable for unlimited damages, even if the contract is worth only a small amount.",
      suggestedLanguage: `"The total aggregate liability of Contractor under this Agreement shall not exceed the total fees actually paid to Contractor. Neither party shall be liable for any indirect, incidental, consequential, special, or punitive damages."`,
    });
  }

  return { redFlags, greenFlags, missingClauses };
}

function detectDisputeResolution(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];

  const hasArbitration = ARBITRATION.test(ctx.text);
  const hasClientJurisdiction = ARBITRATION_CLIENT_JURISDICTION.test(ctx.text);
  const hasMediation = MEDIATION.test(ctx.text);
  const hasGoverningLaw = GOVERNING_LAW.test(ctx.text);

  if (hasArbitration && hasClientJurisdiction) {
    const clause = extractContext(ctx.original, ARBITRATION_CLIENT_JURISDICTION);
    redFlags.push({
      severity: "high",
      clause,
      issue: "Binding arbitration in client's jurisdiction — travel costs and home-court advantage for the client",
      impact: "If a dispute arises, you'd have to travel to the client's location for arbitration, at your own expense. Arbitration also limits your legal options and can be expensive.",
      hourlyRateImpact: 0,
      suggestion: `Counter with: "Any disputes shall first be submitted to mediation. If mediation fails, disputes shall be resolved by arbitration at a mutually agreed location, or via virtual proceedings."`,
    });
  } else if (hasArbitration) {
    const clause = extractContext(ctx.original, ARBITRATION);
    redFlags.push({
      severity: "medium",
      clause,
      issue: "Binding arbitration — limits your legal options",
      impact: "Arbitration can be faster than court but is often expensive and limits your rights to appeal. Ensure the location and arbitrator selection are fair.",
      hourlyRateImpact: 0,
      suggestion: `Add mediation first: "The parties shall first attempt to resolve disputes through good-faith mediation. If mediation fails within 30 days, disputes shall be submitted to binding arbitration."`,
    });
  }

  if (hasMediation) {
    const clause = extractContext(ctx.original, MEDIATION);
    greenFlags.push({
      clause,
      benefit: "Mediation is included — a lower-cost, collaborative way to resolve disputes before escalating.",
    });
  }

  if (!hasArbitration && !hasMediation && !hasGoverningLaw) {
    missingClauses.push({
      name: "Dispute Resolution",
      importance: "important",
      description: "No dispute resolution mechanism is specified. Without one, disagreements default to expensive litigation, which typically favors the party with more resources (usually the client).",
      suggestedLanguage: `"Any dispute arising from this Agreement shall first be submitted to good-faith mediation. If not resolved within 30 days, disputes shall be submitted to binding arbitration under [AAA/JAMS] rules. The prevailing party shall be entitled to recover reasonable attorney's fees."`,
    });
  }

  if (hasGoverningLaw) {
    const clause = extractContext(ctx.original, GOVERNING_LAW);
    // Neutral — just noting it
    greenFlags.push({
      clause,
      benefit: "Governing law is specified — reduces ambiguity about which jurisdiction's laws apply.",
    });
  }

  return { redFlags, greenFlags, missingClauses };
}

// ---------------------------------------------------------------------------
// 11. Advanced Contract Red Flag Detection
// ---------------------------------------------------------------------------

function detectAdvancedRedFlags(ctx: DetectionContext): {
  redFlags: RedFlag[];
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
} {
  const redFlags: RedFlag[] = [];
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];

  // 1. "Employment" language in IC agreement (exclude "not an employee" patterns)
  const employmentLanguage = /(?:during\s+(?:the\s+)?(?:term\s+of\s+)?their\s+employment|(?<!not\s)(?<!not\s+an?\s)employee\s+of\s+the\s+contractor|(?<!not\s+)(?<!nor\s+)(?<!not\s+an?\s)(?:as\s+an?\s+employee))/i;
  const negatedEmployee = /not\s+(?:an?\s+)?employee|nor\s+(?:an?\s+)?employee|is\s+not\s+an\s+employee/i;
  const hasRealEmploymentLanguage = employmentLanguage.test(ctx.text) && !negatedEmployee.test(ctx.text.match(employmentLanguage)?.[0]?.replace(/^.*?(employee)/, "$1") || "");
  // More reliable: check if "employment" is used to describe the relationship (not just in a negation)
  const usesEmploymentWord = /(?:term\s+of\s+(?:their|the)\s+employment|during\s+(?:their|the)\s+employment|period\s+of\s+employment)/i;
  if ((usesEmploymentWord.test(ctx.text) || (hasRealEmploymentLanguage && !negatedEmployee.test(ctx.text))) && /independent\s+contractor|freelanc/i.test(ctx.text)) {
    redFlags.push({
      severity: "critical",
      clause: extractContext(ctx.original, employmentLanguage),
      issue: "Uses 'employment' language in an independent contractor agreement — this could reclassify you as an employee",
      impact: "If a court determines this language creates an employment relationship, the client could owe employment taxes and benefits, and you could lose independent contractor protections and deductions.",
      hourlyRateImpact: 0,
      suggestion: 'Replace all instances of "employment" with "engagement" or "term of this Agreement." Ensure the contract consistently refers to you as an independent contractor, not an employee.',
    });
  }

  // 2. Missing independent contractor status clause
  const hasICStatus = /independent\s+contractor|not\s+(?:an?\s+)?employee|contractor\s+status/i.test(ctx.text);
  if (!hasICStatus) {
    missingClauses.push({
      name: "Independent Contractor Status Clause",
      importance: "critical",
      description: "No clause establishing you as an independent contractor. Without this, your status is ambiguous and could lead to tax and legal complications.",
      suggestedLanguage: '"The Contractor is an independent contractor and not an employee, partner, or agent of the Client. Nothing in this Agreement shall be construed to create an employment, partnership, or agency relationship."',
    });
  }

  // 3. Overbroad IP clause — captures "ideas, concepts, developments, inventions"
  const overbroadIP = /(?:ideas|concepts|developments|inventions|improvements|methods|processes|formulas).*(?:property|owned|assigned|belong)/i;
  const overbroadIP2 = /intellectual\s+property\s+(?:includes|including).*(?:ideas|concepts|developments|inventions|formulas)/i;
  if (overbroadIP.test(ctx.text) || overbroadIP2.test(ctx.text)) {
    const clause = extractContext(ctx.original, overbroadIP.test(ctx.text) ? overbroadIP : overbroadIP2);
    redFlags.push({
      severity: "critical",
      clause,
      issue: "IP clause is absurdly broad — captures ideas, concepts, and inventions beyond the project deliverables",
      impact: "This clause could mean the client owns ANY idea you have while working on this project, even if unrelated to the deliverables. This includes your pre-existing tools, methods, and future ideas.",
      hourlyRateImpact: 0,
      suggestion: 'Replace with: "All intellectual property in the specific Deliverables described in the Scope of Work shall be assigned to Client upon receipt of full payment. Contractor retains all rights to pre-existing tools, methods, frameworks, and general knowledge. Contractor retains the right to display work in portfolio."',
    });
  }

  // 4. "Works made for hire" without pre-existing IP carve-out
  const workForHire = /work[s]?\s+(?:made\s+)?for\s+hire|work\s+for\s+hire/i;
  const hasPreexistingCarveout = /pre-?existing\s+(?:ip|intellectual\s+property|work|material)/i.test(ctx.text) || /prior\s+(?:work|invention|ip)/i.test(ctx.text);
  if (workForHire.test(ctx.text) && !hasPreexistingCarveout) {
    redFlags.push({
      severity: "high",
      clause: extractContext(ctx.original, workForHire),
      issue: '"Works made for hire" without pre-existing IP carve-out — your existing tools and methods could be claimed',
      impact: "Under 'work for hire,' the client is considered the legal author. Without a pre-existing IP carve-out, they could claim ownership of tools, libraries, or methods you developed before this project.",
      hourlyRateImpact: 0,
      suggestion: 'Add: "Notwithstanding the foregoing, Contractor retains all rights to pre-existing intellectual property, including tools, frameworks, libraries, and methodologies developed prior to this Agreement. Contractor grants Client a perpetual, non-exclusive license to use any pre-existing IP incorporated into the Deliverables."',
    });
  }

  // 5. One-sided amendment clause
  const oneSidedAmendment = /amend(?:ed|ment)?.*(?:only|solely)\s+(?:with\s+)?(?:the\s+)?(?:written\s+)?consent\s+of\s+(?:the\s+)?(?:company|client|employer)/i;
  if (oneSidedAmendment.test(ctx.text)) {
    redFlags.push({
      severity: "critical",
      clause: extractContext(ctx.original, oneSidedAmendment),
      issue: "One-sided amendment clause — only the client can approve changes to the contract",
      impact: "The client can modify contract terms without your consent. This means they could change scope, payment terms, or deadlines unilaterally.",
      hourlyRateImpact: 0,
      suggestion: 'Replace with: "Any amendment or modification of this Agreement shall only be valid if made in writing and signed by both Parties."',
    });
  }

  // 6. One-sided indemnification (only contractor indemnifies)
  const contractorIndemnifies = /contractor\s+(?:shall|will|agrees?\s+to)\s+indemnif/i.test(ctx.text);
  const clientIndemnifies = /(?:company|client)\s+(?:shall|will|agrees?\s+to)\s+indemnif/i.test(ctx.text);
  const mutualIndemnify = /(?:each\s+party|both\s+parties|mutual)\s+(?:shall|will|agrees?\s+to)\s+indemnif/i.test(ctx.text);
  if (contractorIndemnifies && !clientIndemnifies && !mutualIndemnify) {
    redFlags.push({
      severity: "high",
      clause: extractContext(ctx.original, /contractor\s+(?:shall|will|agrees?\s+to)\s+indemnif[^.]+\./i),
      issue: "One-sided indemnification — only you indemnify the client, not vice versa",
      impact: "You bear all legal and financial risk. If the client's actions cause a lawsuit involving your work, you could be financially responsible even if it's the client's fault.",
      hourlyRateImpact: 0,
      suggestion: 'Add mutual indemnification: "Each Party agrees to indemnify and hold harmless the other Party against any claims arising from the indemnifying Party\'s negligence, willful misconduct, or breach of this Agreement."',
    });
  } else if (mutualIndemnify) {
    greenFlags.push({
      clause: extractContext(ctx.original, /(?:each\s+party|both\s+parties|mutual)\s+(?:shall|will|agrees?\s+to)\s+indemnif[^.]+\./i),
      benefit: "Mutual indemnification — both parties share the risk, which is fair and balanced.",
    });
  }

  // 7. Auto-renewal trap
  const autoRenewal = /auto(?:matic(?:ally)?)\s+(?:renew|extend|roll)/i;
  if (autoRenewal.test(ctx.text)) {
    const clause = extractContext(ctx.original, autoRenewal);
    redFlags.push({
      severity: "medium",
      clause,
      issue: "Auto-renewal clause — contract renews automatically, potentially locking you in at below-market rates",
      impact: "If you don't actively cancel before the renewal window, you may be locked into another term at the original rate. Over time, this means working below your market value.",
      hourlyRateImpact: 0,
      suggestion: 'Add: "This Agreement shall not auto-renew. Any renewal must be agreed upon in writing by both Parties, with renegotiated terms including compensation."',
    });
  }

  // 8. Perpetual/indefinite NDA without time limit
  const perpetualNDA = /confidential(?:ity)?.*(?:indefinite|perpetual|surviv(?:e|es)\s+(?:indefinitely|without\s+limit))/i;
  const hasNDATimeLimit = /confidential(?:ity)?.*(?:period\s+of|for)\s+\d+\s+(?:year|month)/i.test(ctx.text);
  if (perpetualNDA.test(ctx.text) || (/confidential/i.test(ctx.text) && !hasNDATimeLimit && /surviv/i.test(ctx.text))) {
    redFlags.push({
      severity: "medium",
      clause: extractContext(ctx.original, /confidential[^.]*surviv[^.]+\./i),
      issue: "Perpetual confidentiality obligation — NDA has no expiration date",
      impact: "You're bound by confidentiality forever. Industry standard is 2-5 years. A perpetual NDA limits your ability to discuss your work or apply lessons learned to future projects.",
      hourlyRateImpact: 0,
      suggestion: 'Replace with: "The obligations of confidentiality shall survive termination of this Agreement for a period of [2-3] years. General knowledge, skills, and experience gained during this engagement are not considered Confidential Information."',
    });
  }

  // 9. Device search / inspection clause
  const deviceSearch = /search\s+(?:of\s+)?(?:all\s+)?(?:digital|device|computer|laptop|phone|personal)/i;
  if (deviceSearch.test(ctx.text)) {
    redFlags.push({
      severity: "critical",
      clause: extractContext(ctx.original, deviceSearch),
      issue: "Device search clause — the client can inspect your personal devices",
      impact: "This clause allows the client to search through your personal computers, phones, and other devices. This is an extreme invasion of privacy and is unusual in freelance contracts.",
      hourlyRateImpact: 0,
      suggestion: 'Remove entirely, or replace with: "Upon termination, Contractor agrees to return or delete all Client materials from Contractor\'s systems and provide written certification of deletion."',
    });
  }

  // 10. Jury trial waiver
  const juryWaiver = /waiv(?:e|er|es|ing)\s+(?:the\s+)?(?:right\s+to\s+)?(?:a\s+)?(?:trial\s+by\s+)?jury|shall\s+be\s+heard\s+by\s+a\s+judge\s+and\s+not\s+a\s+jury/i;
  if (juryWaiver.test(ctx.text)) {
    redFlags.push({
      severity: "medium",
      clause: extractContext(ctx.original, juryWaiver),
      issue: "Jury trial waiver — you give up the right to a jury trial",
      impact: "Bench trials (judge-only) can move faster but may favor the corporate party. You lose the option of presenting your case to a jury of peers.",
      hourlyRateImpact: 0,
      suggestion: 'Consider removing, or ensure arbitration is offered as an alternative with a neutral arbitrator and shared costs.',
    });
  }

  // 11. No portfolio use rights
  const hasPortfolioRights = /portfolio|display\s+(?:the\s+)?work|showcase|marketing\s+materials/i.test(ctx.text);
  if (!hasPortfolioRights && /intellectual\s+property|ip\s+|ownership|work\s+product/i.test(ctx.text)) {
    missingClauses.push({
      name: "Portfolio Use Rights",
      importance: "important",
      description: "No clause allowing you to display this work in your portfolio. Without it, showcasing this project could technically violate the IP assignment.",
      suggestedLanguage: '"Contractor retains the right to display and reference the Deliverables in Contractor\'s portfolio, website, and marketing materials for self-promotion purposes, subject to any confidentiality obligations."',
    });
  }

  // 12. Insurance requirement
  const insuranceReq = /(?:contractor|freelancer)\s+(?:shall|must|will)\s+(?:maintain|carry|obtain)\s+(?:adequate\s+)?insurance/i;
  if (insuranceReq.test(ctx.text)) {
    redFlags.push({
      severity: "low",
      clause: extractContext(ctx.original, insuranceReq),
      issue: "Insurance requirement — you must carry professional liability insurance",
      impact: "Professional liability insurance can cost $500-$3,000/year. Ensure you understand the coverage amounts required and factor this cost into your rate.",
      hourlyRateImpact: round2((1500 / (ctx.estimatedHours * 12))), // Annualized cost spread over hours
      suggestion: 'Negotiate: "Contractor shall maintain professional liability insurance with coverage of at least [specific amount]. The cost of said insurance shall be considered in the project pricing."',
    });
  }

  // 13. Unlimited support/bug fixes
  if (UNLIMITED_SUPPORT.test(ctx.text)) {
    redFlags.push({
      severity: "high",
      clause: extractContext(ctx.original, UNLIMITED_SUPPORT),
      issue: "Unlimited support/bug fixes — open-ended post-delivery obligation",
      impact: "Unlimited bug fixes or support means you could be working for free indefinitely after delivery. This is a common trap in software contracts.",
      hourlyRateImpact: round2(ctx.nominalRate * 0.1),
      suggestion: 'Replace with: "Contractor shall provide bug fixes for defects in the delivered work for a period of [30] days following delivery. Support beyond this period shall be billed at the hourly rate of [rate]."',
    });
  }

  return { redFlags, greenFlags, missingClauses };
}

function detectConfidentialityAndOther(ctx: DetectionContext): {
  greenFlags: GreenFlag[];
  missingClauses: MissingClause[];
} {
  const greenFlags: GreenFlag[] = [];
  const missingClauses: MissingClause[] = [];

  if (CONFIDENTIALITY.test(ctx.text)) {
    const clause = extractContext(ctx.original, CONFIDENTIALITY);
    greenFlags.push({
      clause,
      benefit: "Confidentiality / NDA clause is present — protects both parties' sensitive information.",
    });
  }

  // Check for termination notice period
  const noticeMatch = ctx.text.match(TERMINATION_NOTICE);
  if (noticeMatch) {
    const days = parseInt(noticeMatch[1], 10);
    if (days >= 14) {
      greenFlags.push({
        clause: extractContext(ctx.original, TERMINATION_NOTICE),
        benefit: `${days}-day termination notice period — gives you time to adjust if the project is cancelled.`,
      });
    } else {
      // Short notice is not great but not terrible
    }
  }

  // Check for missing force majeure
  const hasForceMajeure = /force\s+majeure/i.test(ctx.text);
  if (!hasForceMajeure) {
    missingClauses.push({
      name: "Force Majeure",
      importance: "nice_to_have",
      description: "No force majeure clause. This protects both parties from liability when external events (natural disasters, pandemics, etc.) prevent contract fulfillment.",
      suggestedLanguage: `"Neither party shall be liable for delays or failures in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemics, war, terrorism, or government actions."`,
    });
  }

  // Check for missing change order process
  const hasChangeOrder = /change\s+order/i.test(ctx.text) || /change\s+request\s+(?:process|procedure|form)/i.test(ctx.text);
  if (!hasChangeOrder) {
    missingClauses.push({
      name: "Change Order Process",
      importance: "important",
      description: "No formal change order process. Without one, scope changes can happen informally, making it hard to charge for additional work.",
      suggestedLanguage: `"Any changes to the scope of work must be documented in a written Change Order signed by both parties. The Change Order shall specify the additional work, timeline adjustments, and additional fees."`,
    });
  }

  return { greenFlags, missingClauses };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function calculateOverallScore(
  redFlags: RedFlag[],
  greenFlags: GreenFlag[],
  missingClauses: MissingClause[],
  rateReduction: number,
  contractTextLength: number = 1000
): { score: number; breakdown: ScoreBreakdown } {
  // Start at 50 — a truly neutral baseline
  let score = 50;
  const breakdown: ScoreBreakdown = {
    baseScore: 50,
    shortTextPenalty: 0,
    heuristicFlagDeductions: 0,
    aiFlagDeductions: 0,
    missingClauseDeductions: 0,
    greenFlagBonus: 0,
    rateReductionPenalty: 0,
    finalScore: 0,
  };

  // Penalty for very short/empty contracts
  if (contractTextLength < 100) { score -= 20; breakdown.shortTextPenalty = -20; }
  else if (contractTextLength < 300) { score -= 10; breakdown.shortTextPenalty = -10; }

  // --- DEDUCTIONS ---

  // Red flags: diminishing returns — first few hurt the most, later ones less
  // Only count HEURISTIC flags for scoring (AI flags are informational extras)
  const heuristicFlags = redFlags.filter(f => !f.issue.startsWith("\u{1F916}"));
  const aiFlags = redFlags.filter(f => f.issue.startsWith("\u{1F916}"));

  let heuristicDeduct = 0;
  heuristicFlags.forEach((flag, i) => {
    // Diminishing impact: each successive flag penalizes less
    const diminish = Math.max(0.4, 1 - i * 0.1);
    switch (flag.severity) {
      case "critical": heuristicDeduct += 12 * diminish; break;
      case "high": heuristicDeduct += 7 * diminish; break;
      case "medium": heuristicDeduct += 3 * diminish; break;
      case "low": heuristicDeduct += 1 * diminish; break;
    }
  });

  breakdown.heuristicFlagDeductions = -Math.round(heuristicDeduct);
  score -= Math.round(heuristicDeduct);

  // AI flags add less penalty (they're supplementary, often overlap with heuristics)
  let aiDeduct = 0;
  aiFlags.forEach((flag) => {
    switch (flag.severity) {
      case "critical": aiDeduct += 4; break;
      case "high": aiDeduct += 2; break;
      case "medium": aiDeduct += 1; break;
      case "low": aiDeduct += 0.5; break;
    }
  });

  breakdown.aiFlagDeductions = -Math.round(aiDeduct);
  score -= Math.round(aiDeduct);

  // Missing clauses: capped and scaled by contract length
  // Short contracts naturally miss more — don't penalize as heavily
  let missingDeductions = 0;
  for (const mc of missingClauses) {
    switch (mc.importance) {
      case "critical": missingDeductions += 5; break;
      case "important": missingDeductions += 2; break;
      case "nice_to_have": missingDeductions += 0.5; break;
    }
  }
  // Cap: shorter contracts get lower cap (they can't have everything)
  // If 5+ green flags, reduce missing clause cap further — professional contract
  const missingCap = greenFlags.length >= 5
    ? 12  // Professional contract — don't penalize too much for missing nice-to-haves
    : contractTextLength < 500 ? 15
    : contractTextLength < 2000 ? 20
    : 25;
  const missingPenalty = Math.min(Math.round(missingDeductions), missingCap);
  breakdown.missingClauseDeductions = -missingPenalty;
  score -= missingPenalty;

  // Rate reduction penalty (only if we have rate data)
  let rateReductionPenalty = 0;
  if (rateReduction > 50) rateReductionPenalty = 10;
  else if (rateReduction > 30) rateReductionPenalty = 7;
  else if (rateReduction > 15) rateReductionPenalty = 4;
  breakdown.rateReductionPenalty = -rateReductionPenalty;
  score -= rateReductionPenalty;

  // --- BONUSES ---

  // Green flags: each one adds 6 points (calibrated up from 5)
  // More green flags = better contract, with bonus for having many
  const greenBonus = greenFlags.length * 6 + (greenFlags.length >= 5 ? 6 : 0);
  breakdown.greenFlagBonus = greenBonus;
  score += greenBonus;

  // Clamp to 0-100
  breakdown.finalScore = Math.max(0, Math.min(100, Math.round(score)));
  return { score: breakdown.finalScore, breakdown };
}

function determineRecommendation(
  score: number,
  redFlags: RedFlag[],
): "sign" | "negotiate" | "walk_away" {
  const heuristicFlags = redFlags.filter(f => !f.issue.startsWith("🤖"));
  const criticalCount = heuristicFlags.filter(f => f.severity === "critical").length;
  const highCount = heuristicFlags.filter(f => f.severity === "high").length;

  // Walk away: very low score OR many critical issues
  if (score <= 20 || criticalCount >= 4) return "walk_away";

  // Sign: high score with no major issues
  if (score >= 65 && criticalCount === 0 && highCount <= 1) return "sign";

  // Everything else: negotiate
  return "negotiate";
}

function generateSummary(
  result: Omit<AnalysisResult, "summary">,
  currency: string,
): string {
  const parts: string[] = [];

  // Rate analysis
  parts.push(
    `Your nominal rate is ${currency}${round2(result.nominalHourlyRate)}/hr, but after accounting for contract risks, your effective rate drops to ${currency}${round2(result.effectiveHourlyRate)}/hr — a ${round2(result.rateReduction)}% reduction.`
  );

  // Red flag summary
  const criticalFlags = result.redFlags.filter(f => f.severity === "critical");
  const highFlags = result.redFlags.filter(f => f.severity === "high");

  if (criticalFlags.length > 0) {
    parts.push(
      `CRITICAL ISSUES (${criticalFlags.length}): ${criticalFlags.map(f => f.issue.split(" — ")[0]).join("; ")}.`
    );
  }
  if (highFlags.length > 0) {
    parts.push(
      `HIGH-PRIORITY ISSUES (${highFlags.length}): ${highFlags.map(f => f.issue.split(" — ")[0]).join("; ")}.`
    );
  }

  // Missing clauses
  const criticalMissing = result.missingClauses.filter(m => m.importance === "critical");
  if (criticalMissing.length > 0) {
    parts.push(
      `MISSING CRITICAL CLAUSES: ${criticalMissing.map(m => m.name).join(", ")}.`
    );
  }

  // Green flags
  if (result.greenFlags.length > 0) {
    parts.push(
      `POSITIVES (${result.greenFlags.length}): ${result.greenFlags.map(f => f.benefit.split(" — ")[0]).join("; ")}.`
    );
  }

  // Recommendation
  switch (result.recommendation) {
    case "sign":
      parts.push("RECOMMENDATION: This contract is relatively fair. Review the minor issues above, but it's reasonable to sign.");
      break;
    case "negotiate":
      parts.push("RECOMMENDATION: Do not sign as-is. Negotiate the flagged issues before proceeding. Use the suggested counter-language provided for each red flag.");
      break;
    case "walk_away":
      parts.push("RECOMMENDATION: This contract has serious structural problems that heavily favor the client. Consider walking away unless the client agrees to substantial revisions.");
      break;
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Contract type & price auto-detection
// ---------------------------------------------------------------------------

function detectContractType(text: string): string {
  const lower = text.toLowerCase();
  // Check milestone FIRST (milestone contracts often mention hourly rates for extras)
  const milestoneMatches = (lower.match(/milestone|phase\s+\d|stage\s+\d|\d+%\s*(?:upon|at|on)\s/gi) || []).length;
  if (milestoneMatches >= 2) return 'milestone';
  // Per-unit before retainer (both may mention "per month" but per-word is more specific)
  if (/per\s*word|\/\s*word|per\s+article|per\s+page|per\s+unit|per\s+piece/i.test(lower)) return 'per-unit';
  if (/(?:day\s+rate|daily\s+rate|\bper\s+day\b|\/\s*day)/i.test(lower)) return 'day-rate';
  if (/(?:monthly\s+retainer|retainer\s+(?:agreement|fee|of)|per\s+month.*(?:hour|service))/i.test(lower)) return 'retainer';
  if (/revenue\s+share|royalt|equity|percentage\s+of\s+(?:revenue|profit|sales)/i.test(lower)) return 'revenue-share';
  // Hourly is a common fallback — only match if clearly hourly-focused
  if (/(?:hourly\s+rate|rate\s+of\s+\$?\d+\s*(?:per\s+hour|\/\s*hr)|\$\d+\s*\/\s*hr)/i.test(lower)) return 'hourly';
  if (milestoneMatches >= 1) return 'milestone';
  return 'fixed-price';
}

function detectPriceFromText(text: string): { price?: number; rate?: number; hours?: number } {
  // Try to find hourly rate
  const ratePatterns = [
    /(?:USD|INR|GBP|EUR|Rs\.?|₹|\$|£|€)\s*([0-9,]+(?:\.\d{1,2})?)\s*(?:per\s+hour|\/\s*h(?:ou)?r|hourly)/i,
    /([0-9,]+(?:\.\d{1,2})?)\s*(?:per\s+hour|\/\s*h(?:ou)?r)/i,
    /hourly\s+rate\s+(?:of\s+)?(?:USD|INR|GBP|EUR|Rs\.?|₹|\$|£|€)\s*([0-9,]+(?:\.\d{1,2})?)/i,
  ];

  // Try to find total price
  const pricePatterns = [
    /(?:total|project|flat)\s+(?:fee|price|cost|amount)[\s:]*(?:of\s+)?(?:(?:USD|INR|GBP|EUR|Rs\.?|₹|\$|£|€)\s*)?([0-9,]+(?:\.\d{1,2})?)/i,
    /(?:USD|INR|GBP|EUR|Rs\.?|₹|\$|£|€)\s*([0-9,]+(?:\.\d{1,2})?)/i,
    /([0-9,]+(?:\.\d{1,2})?)\s*(?:USD|INR|GBP|EUR|rupees|dollars|pounds|euros)/i,
  ];

  let price: number | undefined;
  let rate: number | undefined;

  for (const p of ratePatterns) {
    const m = text.match(p);
    if (m) { rate = parseFloat(m[1].replace(/,/g, '')); break; }
  }

  // Find ALL monetary amounts and pick the largest reasonable one as the price
  const allAmounts: number[] = [];
  for (const p of pricePatterns) {
    let m;
    const regex = new RegExp(p.source, 'gi');
    while ((m = regex.exec(text)) !== null) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val >= 50 && val !== rate && val < 100000000) allAmounts.push(val);
    }
  }
  if (allAmounts.length > 0) {
    allAmounts.sort((a, b) => b - a);
    price = allAmounts[0]; // Largest amount is most likely the total price
  }

  return { price, rate, hours: undefined };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function analyzeContract(input: AnalysisInput): AnalysisResult {
  const { contractText, projectScope, currency } = input;

  if (!contractText || contractText.trim().length === 0) {
    throw new Error("Contract text is required.");
  }

  // Auto-detect contract type and pricing from text
  const detected = detectPriceFromText(contractText);
  const contractType = detectContractType(contractText);

  let finalPrice = input.quotedPrice || 0;
  let finalHours = input.estimatedHours || 0;

  if (!finalPrice && detected.price) finalPrice = detected.price;
  if (!finalPrice && detected.rate) {
    // Estimate total based on rate and contract type
    if (contractType === 'hourly' || detected.rate > 0) finalPrice = detected.rate * 40;
    if (contractType === 'day-rate') finalPrice = detected.rate * 10;
    if (contractType === 'retainer') finalPrice = detected.rate * 3;
  }
  if (!finalHours) {
    if (detected.rate && finalPrice) finalHours = Math.round(finalPrice / detected.rate);
    else finalHours = 80;
  }
  if (!finalPrice) finalPrice = 0;
  if (!finalHours) finalHours = 80;

  // Calculate nominal rate — prefer detected hourly rate if available
  let nominalRate: number;
  if (detected.rate && detected.rate > 0) {
    nominalRate = round2(detected.rate); // Use the actual hourly rate from contract
  } else if (finalHours > 0 && finalPrice > 0) {
    nominalRate = round2(finalPrice / finalHours);
  } else {
    nominalRate = 0;
  }

  const ctx: DetectionContext = {
    text: contractText.toLowerCase(),
    original: contractText,
    scope: projectScope,
    nominalRate,
    quotedPrice: finalPrice,
    estimatedHours: finalHours,
    currency,
  };

  // Run all detection modules
  const payment = detectPaymentTerms(ctx);
  const revisions = detectRevisionLimits(ctx);
  const scope = detectScopeCreep(ctx);
  const killFee = detectKillFee(ctx);
  const ip = detectIPOwnership(ctx);
  const nonCompete = detectNonCompete(ctx);
  const latePay = detectLatePaymentPenalties(ctx);
  const liability = detectLiability(ctx);
  const dispute = detectDisputeResolution(ctx);
  const misc = detectConfidentialityAndOther(ctx);
  const advanced = detectAdvancedRedFlags(ctx);

  // Aggregate results
  const allRedFlags = [
    ...payment.redFlags,
    ...revisions.redFlags,
    ...scope.redFlags,
    ...killFee.redFlags,
    ...ip.redFlags,
    ...nonCompete.redFlags,
    ...latePay.redFlags,
    ...liability.redFlags,
    ...dispute.redFlags,
    ...advanced.redFlags,
  ];

  const allGreenFlags = [
    ...payment.greenFlags,
    ...revisions.greenFlags,
    ...killFee.greenFlags,
    ...ip.greenFlags,
    ...nonCompete.greenFlags,
    ...latePay.greenFlags,
    ...liability.greenFlags,
    ...dispute.greenFlags,
    ...misc.greenFlags,
    ...advanced.greenFlags,
  ];

  const allMissingClauses = [
    ...payment.missingClauses,
    ...revisions.missingClauses,
    ...killFee.missingClauses,
    ...ip.missingClauses,
    ...latePay.missingClauses,
    ...liability.missingClauses,
    ...dispute.missingClauses,
    ...misc.missingClauses,
    ...advanced.missingClauses,
  ];

  const allScopeRisks = scope.scopeRisks;

  // Sort red flags by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  allRedFlags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Sort missing clauses by importance
  const importanceOrder: Record<string, number> = { critical: 0, important: 1, nice_to_have: 2 };
  allMissingClauses.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);

  // ---------- Calculate effective hourly rate ----------

  // 1. Start with total hours adjustments from revisions and scope creep
  //    Use the LARGER of the two multipliers (they overlap somewhat), but add a portion of the smaller
  const revisionMultiplier = revisions.extraHoursMultiplier;
  const scopeMultiplier = scope.extraHoursMultiplier;
  const largerMultiplier = Math.max(revisionMultiplier, scopeMultiplier);
  const smallerMultiplier = Math.min(revisionMultiplier, scopeMultiplier);
  // Combine: full larger + 50% of the incremental part of the smaller
  const combinedMultiplier = largerMultiplier + (smallerMultiplier - 1) * 0.5;

  const adjustedHours = finalHours * combinedMultiplier;

  // 2. Calculate rate before direct penalties
  let effectiveRate = finalPrice > 0 ? finalPrice / adjustedHours : 0;

  // 3. Subtract direct hourly penalties (payment float, kill fee risk, no deposit risk)
  const totalHourlyPenalty = payment.hourlyPenalty + killFee.hourlyPenalty;
  effectiveRate -= totalHourlyPenalty;

  // 4. Subtract non-compete opportunity cost if applicable
  const ncFlags = nonCompete.redFlags.filter(f => f.hourlyRateImpact > 0);
  for (const f of ncFlags) {
    effectiveRate -= f.hourlyRateImpact;
  }

  // Floor at zero
  effectiveRate = Math.max(0, round2(effectiveRate));

  const rateReduction = nominalRate > 0
    ? round2(((nominalRate - effectiveRate) / nominalRate) * 100)
    : 0;

  // ---------- Score and recommendation ----------
  const { score: overallScore, breakdown: scoreBreakdown } = calculateOverallScore(allRedFlags, allGreenFlags, allMissingClauses, rateReduction, contractText.length);
  const recommendation = determineRecommendation(overallScore, allRedFlags);

  const partialResult = {
    overallScore,
    effectiveHourlyRate: effectiveRate,
    nominalHourlyRate: nominalRate,
    rateReduction: Math.max(0, rateReduction),
    redFlags: allRedFlags,
    greenFlags: allGreenFlags,
    missingClauses: allMissingClauses,
    scopeRisks: allScopeRisks,
    recommendation,
    contractType,
    detectedPrice: detected.price,
    detectedRate: detected.rate,
    scoreBreakdown,
  };

  const summary = generateSummary(partialResult, currency);

  return {
    ...partialResult,
    summary,
  };
}
